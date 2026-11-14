import { HomePage } from '../../pages/HomePage';
import { ListaDeComprasPage } from '../../pages/ListaDeComprasPage';
import { expect, test as base } from '../../support/fixtures';

// Fixture local: entrega a lista de compras já aberta com um produto próprio, criado via
// API e adicionado por um cliente autenticado sem passar pela tela de login.
const test = base.extend({
  produto: async ({ massa }, use) => {
    await use(await massa.criarProduto());
  },
  lista: async ({ massa, abrirSessao, produto }, use) => {
    const page = await abrirSessao(await massa.criarUsuario());
    const home = new HomePage(page);

    await home.abrir();
    await home.pesquisarProduto(produto.nome);
    await home.adicionarNaLista(produto.nome);
    await expect(page).toHaveURL('/minhaListaDeProdutos');

    await use(new ListaDeComprasPage(page));
  },
});

test.describe('Frontend - Lista de compras', () => {
  test(
    'adiciona à lista um produto encontrado pela pesquisa',
    { tag: '@smoke' },
    async ({ lista, produto }) => {
      await expect(lista.nomesDosProdutos).toHaveCount(1);
      await expect(lista.nomesDosProdutos).toContainText(produto.nome);
      await expect(lista.quantidadeDoProduto).toHaveText('Total: 1');
    },
  );

  test('atualiza a quantidade do produto na lista', async ({ lista }) => {
    await lista.aumentarQuantidade();
    await expect(lista.quantidadeDoProduto).toHaveText('Total: 2');

    await lista.diminuirQuantidade();
    await expect(lista.quantidadeDoProduto).toHaveText('Total: 1');
  });

  test('esvazia a lista ao limpar', async ({ lista }) => {
    await lista.limpar();

    await expect(lista.mensagemDeListaVazia).toBeVisible();
    await expect(lista.nomesDosProdutos).toHaveCount(0);
  });
});
