import { novoAdministrador } from '../../../shared/factories';
import { HomePage } from '../../pages/HomePage';
import { ProdutosAdminPage } from '../../pages/ProdutosAdminPage';
import { expect, test as base } from '../../support/fixtures';

// O cadastro de produto pela tela está bloqueado por um defeito da aplicação (F10 em
// docs/comportamentos-inesperados.md) e é exercitado em cypress/known-issues. Aqui ficam
// os comportamentos do painel que seguem funcionando.

// Fixture local: o painel de produtos aberto na sessão de um administrador criado via API.
const test = base.extend({
  painel: async ({ massa, abrirSessao }, use) => {
    const admin = await massa.criarUsuario(novoAdministrador());
    await use(new ProdutosAdminPage(await abrirSessao(admin)));
  },
});

test.describe('Frontend - Produtos (administrador)', () => {
  test(
    'exibe o produto cadastrado no painel do administrador e na loja do cliente',
    { tag: '@smoke' },
    async ({ massa, abrirSessao, painel }) => {
      const produto = await massa.criarProduto();

      await painel.abrirLista();
      const linha = painel.linhaDoProduto(produto.nome);
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

  test('exige o preenchimento dos campos obrigatórios no cadastro', async ({ painel }) => {
    await painel.abrirCadastro();
    const resposta = await painel.enviar();
    expect(resposta.status()).toBe(400);

    await expect(painel.alertas.todos).toHaveCount(4);
    for (const mensagem of [
      'Nome é obrigatório',
      'Preco é obrigatório',
      'Descricao é obrigatório',
      'Quantidade é obrigatório',
    ]) {
      await expect(painel.alertas.com(mensagem)).toBeVisible();
    }
    await expect(painel.page).toHaveURL('/admin/cadastrarprodutos');
  });
});
