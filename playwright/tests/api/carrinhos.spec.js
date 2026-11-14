import { expect, test as base } from '../../support/fixtures';

const ESTOQUE_INICIAL = 10;

// Fixtures locais: as pré-condições deste arquivo (produto com estoque conhecido e token
// de um cliente) são declaradas uma vez e injetadas só nos testes que as pedem.
const test = base.extend({
  produto: async ({ massa }, use) => {
    await use(await massa.criarProduto({ quantidade: ESTOQUE_INICIAL, preco: 150 }));
  },
  token: async ({ massa }, use) => {
    await use(await massa.obterToken(await massa.criarUsuario()));
  },
});

test.describe('API - Carrinhos', () => {
  const estoqueDe = async (api, produto) =>
    (await (await api.produtos.buscarPorId(produto._id)).json()).quantidade;

  test(
    'cria o carrinho calculando os totais e reservando o estoque',
    { tag: '@smoke' },
    async ({ api, massa, produto, token }) => {
      const quantidade = 3;

      const cadastro = await massa.criarCarrinho([{ idProduto: produto._id, quantidade }], token);
      const { message, _id } = await cadastro.json();
      expect(cadastro.status()).toBe(201);
      expect(message).toBe('Cadastro realizado com sucesso');

      const carrinho = await (await api.carrinhos.buscarPorId(_id)).json();
      expect(carrinho).toMatchObject({
        produtos: [{ idProduto: produto._id, quantidade, precoUnitario: produto.preco }],
        precoTotal: produto.preco * quantidade,
        quantidadeTotal: quantidade,
      });

      expect(await estoqueDe(api, produto)).toBe(ESTOQUE_INICIAL - quantidade);
    },
  );

  test('devolve os produtos ao estoque quando a compra é cancelada', async ({
    api,
    massa,
    produto,
    token,
  }) => {
    const cadastro = await massa.criarCarrinho([{ idProduto: produto._id, quantidade: 4 }], token);
    expect(cadastro.status()).toBe(201);
    expect(await estoqueDe(api, produto)).toBe(ESTOQUE_INICIAL - 4);

    const cancelamento = await api.carrinhos.cancelarCompra(token);
    expect(cancelamento.status()).toBe(200);
    expect((await cancelamento.json()).message).toBe(
      'Registro excluído com sucesso. Estoque dos produtos reabastecido',
    );

    expect(await estoqueDe(api, produto)).toBe(ESTOQUE_INICIAL);
  });

  test('recusa quantidade acima do estoque e mantém o estoque inalterado', async ({
    api,
    massa,
    produto,
    token,
  }) => {
    const quantidade = ESTOQUE_INICIAL + 1;

    const cadastro = await massa.criarCarrinho([{ idProduto: produto._id, quantidade }], token);
    const { message, item } = await cadastro.json();

    expect(cadastro.status()).toBe(400);
    expect(message).toBe('Produto não possui quantidade suficiente');
    expect(item).toMatchObject({ quantidade, quantidadeEstoque: ESTOQUE_INICIAL });
    expect(await estoqueDe(api, produto)).toBe(ESTOQUE_INICIAL);
  });

  test('exige autenticação para criar um carrinho', async ({ api, produto }) => {
    const cadastro = await api.carrinhos.criar([{ idProduto: produto._id, quantidade: 1 }]);

    expect(cadastro.status()).toBe(401);
    expect((await cadastro.json()).message).toBe(
      'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
    );
    expect(await estoqueDe(api, produto)).toBe(ESTOQUE_INICIAL);
  });
});
