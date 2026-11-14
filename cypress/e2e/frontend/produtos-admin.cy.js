import Alertas from '../../pages/components/Alertas';
import HomePage from '../../pages/HomePage';
import ProdutosAdminPage from '../../pages/ProdutosAdminPage';
import { novoAdministrador, novoProduto } from '../../../shared/factories';
import { produtosApi } from '../../support/api';

describe('Frontend - Cadastro de produtos (administrador)', () => {
  beforeEach(() => {
    cy.criarUsuario(novoAdministrador()).as('admin');
    cy.get('@admin').then((admin) => {
      cy.obterToken(admin).as('tokenAdmin');
      cy.loginViaApi(admin);
    });
    ProdutosAdminPage.visitarCadastro();
  });

  it(
    'cadastra um produto que fica disponível para os clientes na loja',
    { tags: '@smoke' },
    function () {
      const produto = novoProduto();

      ProdutosAdminPage.preencher(produto);
      ProdutosAdminPage.enviar().then(({ response }) => {
        cy.limparAoFinal(() => produtosApi.excluir(response.body._id, this.tokenAdmin));
        expect(response.statusCode).to.eq(201);
      });

      cy.location('pathname').should('eq', '/admin/listarprodutos');
      ProdutosAdminPage.linhaDoProduto(produto.nome)
        .should('be.visible')
        .and('contain.text', produto.preco)
        .and('contain.text', produto.quantidade);

      // Troca de perfil: o mesmo produto precisa aparecer para um cliente comum.
      cy.criarUsuario().then((cliente) => cy.loginViaApi(cliente));
      HomePage.visitar();
      HomePage.pesquisarProduto(produto.nome);
      HomePage.cardDoProduto(produto.nome)
        .should('be.visible')
        .and('contain.text', `$ ${produto.preco}`);
    },
  );

  it('exige o preenchimento dos campos obrigatórios', () => {
    ProdutosAdminPage.enviar().its('response.statusCode').should('eq', 400);

    Alertas.todos().should('have.length', 4);
    [
      'Nome é obrigatório',
      'Preco é obrigatório',
      'Descricao é obrigatório',
      'Quantidade é obrigatório',
    ].forEach((mensagem) => {
      Alertas.com(mensagem).should('be.visible');
    });
    cy.location('pathname').should('eq', '/admin/cadastrarprodutos');
  });

  it('não permite cadastrar um produto com nome já existente', () => {
    cy.criarProduto().then((existente) => {
      ProdutosAdminPage.preencher(novoProduto({ nome: existente.nome }));
      ProdutosAdminPage.enviar().its('response.statusCode').should('eq', 400);

      Alertas.com('Já existe produto com esse nome').should('be.visible');
      cy.location('pathname').should('eq', '/admin/cadastrarprodutos');
    });
  });
});
