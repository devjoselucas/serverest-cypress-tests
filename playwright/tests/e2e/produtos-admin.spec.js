import { novoAdministrador, novoProduto } from '../../../shared/factories';
import { HomePage } from '../../pages/HomePage';
import { ProdutosAdminPage } from '../../pages/ProdutosAdminPage';
import { expect, test as base } from '../../support/fixtures';

// Fixtures locais: um administrador criado via API e a tela de cadastro de produtos já
// aberta na sessão dele.
const test = base.extend({
  admin: async ({ massa }, use) => {
    await use(await massa.criarUsuario(novoAdministrador()));
  },
  cadastroDeProdutos: async ({ abrirSessao, admin }, use) => {
    const tela = new ProdutosAdminPage(await abrirSessao(admin));
    await tela.abrirCadastro();
    await use(tela);
  },
});

test.describe('Frontend - Cadastro de produtos (administrador)', () => {
  test(
    'cadastra um produto que fica disponível para os clientes na loja',
    { tag: '@smoke' },
    async ({ api, massa, abrirSessao, admin, cadastroDeProdutos }) => {
      const produto = novoProduto();
      const tokenAdmin = await massa.obterToken(admin);

      await cadastroDeProdutos.preencher(produto);
      const resposta = await cadastroDeProdutos.enviar();
      const { _id } = await resposta.json();
      massa.limparAoFinal(() => api.produtos.excluir(_id, tokenAdmin));
      expect(resposta.status()).toBe(201);

      await expect(cadastroDeProdutos.page).toHaveURL('/admin/listarprodutos');
      const linha = cadastroDeProdutos.linhaDoProduto(produto.nome);
      await expect(linha).toBeVisible();
      await expect(linha).toContainText(String(produto.preco));
      await expect(linha).toContainText(String(produto.quantidade));

      // Segundo perfil, em outro contexto de navegador: o mesmo produto precisa aparecer
      // para um cliente comum.
      const home = new HomePage(await abrirSessao(await massa.criarUsuario()));
      await home.abrir();
      await home.pesquisarProduto(produto.nome);
      await expect(home.cardDoProduto(produto.nome)).toBeVisible();
      await expect(home.cardDoProduto(produto.nome)).toContainText(`$ ${produto.preco}`);
    },
  );

  test('exige o preenchimento dos campos obrigatórios', async ({ cadastroDeProdutos }) => {
    const resposta = await cadastroDeProdutos.enviar();
    expect(resposta.status()).toBe(400);

    await expect(cadastroDeProdutos.alertas.todos).toHaveCount(4);
    for (const mensagem of [
      'Nome é obrigatório',
      'Preco é obrigatório',
      'Descricao é obrigatório',
      'Quantidade é obrigatório',
    ]) {
      await expect(cadastroDeProdutos.alertas.com(mensagem)).toBeVisible();
    }
    await expect(cadastroDeProdutos.page).toHaveURL('/admin/cadastrarprodutos');
  });

  test('não permite cadastrar um produto com nome já existente', async ({
    massa,
    cadastroDeProdutos,
  }) => {
    const existente = await massa.criarProduto();

    await cadastroDeProdutos.preencher(novoProduto({ nome: existente.nome }));
    const resposta = await cadastroDeProdutos.enviar();
    expect(resposta.status()).toBe(400);

    await expect(cadastroDeProdutos.alertas.com('Já existe produto com esse nome')).toBeVisible();
    await expect(cadastroDeProdutos.page).toHaveURL('/admin/cadastrarprodutos');
  });
});
