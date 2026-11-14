import { carrinhosApi, produtosApi } from '../../support/api';

describe('API - Carrinhos', () => {
  const ESTOQUE_INICIAL = 10;

  const estoqueDe = (produto) => produtosApi.buscarPorId(produto._id).its('body.quantidade');

  // Os aliases ficam disponíveis nos testes como this.produto e this.token.
  beforeEach(() => {
    cy.criarProduto({ quantidade: ESTOQUE_INICIAL, preco: 150 }).as('produto');
    cy.criarUsuario()
      .then((usuario) => cy.obterToken(usuario))
      .as('token');
  });

  it('cria o carrinho calculando os totais e reservando o estoque', function () {
    const { produto, token } = this;
    const quantidade = 3;

    cy.criarCarrinho([{ idProduto: produto._id, quantidade }], token).then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.message).to.eq('Cadastro realizado com sucesso');

      carrinhosApi
        .buscarPorId(body._id)
        .its('body')
        .should('deep.include', {
          produtos: [{ idProduto: produto._id, quantidade, precoUnitario: produto.preco }],
          precoTotal: produto.preco * quantidade,
          quantidadeTotal: quantidade,
        });
    });

    estoqueDe(produto).should('eq', ESTOQUE_INICIAL - quantidade);
  });

  it('devolve os produtos ao estoque quando a compra é cancelada', function () {
    const { produto, token } = this;

    cy.criarCarrinho([{ idProduto: produto._id, quantidade: 4 }], token)
      .its('status')
      .should('eq', 201);
    estoqueDe(produto).should('eq', ESTOQUE_INICIAL - 4);

    carrinhosApi.cancelarCompra(token).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.message).to.eq(
        'Registro excluído com sucesso. Estoque dos produtos reabastecido',
      );
    });

    estoqueDe(produto).should('eq', ESTOQUE_INICIAL);
  });

  it('recusa quantidade acima do estoque e mantém o estoque inalterado', function () {
    const { produto, token } = this;
    const quantidade = ESTOQUE_INICIAL + 1;

    cy.criarCarrinho([{ idProduto: produto._id, quantidade }], token).then(({ status, body }) => {
      expect(status).to.eq(400);
      expect(body.message).to.eq('Produto não possui quantidade suficiente');
      expect(body.item).to.include({ quantidade, quantidadeEstoque: ESTOQUE_INICIAL });
    });

    estoqueDe(produto).should('eq', ESTOQUE_INICIAL);
  });

  it('exige autenticação para criar um carrinho', function () {
    const { produto } = this;

    carrinhosApi.criar([{ idProduto: produto._id, quantidade: 1 }]).then(({ status, body }) => {
      expect(status).to.eq(401);
      expect(body.message).to.eq(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
      );
    });

    estoqueDe(produto).should('eq', ESTOQUE_INICIAL);
  });
});
