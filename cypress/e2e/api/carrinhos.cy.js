import { carrinhosApi, produtosApi } from '../../support/api';

describe('API - Carrinhos', () => {
  const ESTOQUE_INICIAL = 10;
  let produto;
  let token;

  const estoqueAtual = () => produtosApi.buscarPorId(produto._id).its('body.quantidade');

  beforeEach(() => {
    cy.criarProduto({ quantidade: ESTOQUE_INICIAL, preco: 150 }).then((criado) => {
      produto = criado;
    });
    cy.criarUsuario()
      .then((usuario) => cy.obterToken(usuario))
      .then((tokenGerado) => {
        token = tokenGerado;
      });
  });

  it('cria o carrinho calculando os totais e reservando o estoque', () => {
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

    estoqueAtual().should('eq', ESTOQUE_INICIAL - quantidade);
  });

  it('devolve os produtos ao estoque quando a compra é cancelada', () => {
    cy.criarCarrinho([{ idProduto: produto._id, quantidade: 4 }], token)
      .its('status')
      .should('eq', 201);
    estoqueAtual().should('eq', ESTOQUE_INICIAL - 4);

    carrinhosApi.cancelarCompra(token).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.message).to.eq(
        'Registro excluído com sucesso. Estoque dos produtos reabastecido',
      );
    });

    estoqueAtual().should('eq', ESTOQUE_INICIAL);
  });

  it('recusa quantidade acima do estoque e mantém o estoque inalterado', () => {
    const quantidade = ESTOQUE_INICIAL + 1;

    cy.criarCarrinho([{ idProduto: produto._id, quantidade }], token).then(({ status, body }) => {
      expect(status).to.eq(400);
      expect(body.message).to.eq('Produto não possui quantidade suficiente');
      expect(body.item).to.include({ quantidade, quantidadeEstoque: ESTOQUE_INICIAL });
    });

    estoqueAtual().should('eq', ESTOQUE_INICIAL);
  });

  it('exige autenticação para criar um carrinho', () => {
    carrinhosApi.criar([{ idProduto: produto._id, quantidade: 1 }]).then(({ status, body }) => {
      expect(status).to.eq(401);
      expect(body.message).to.eq(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
      );
    });

    estoqueAtual().should('eq', ESTOQUE_INICIAL);
  });
});
