import Alertas from '../../pages/components/Alertas';
import HomePage from '../../pages/HomePage';
import ProdutosAdminPage from '../../pages/ProdutosAdminPage';
import { novoAdministrador } from '../../../shared/factories';

// O cadastro de produto pela tela está bloqueado por um defeito da aplicação (F10 em
// docs/comportamentos-inesperados.md) e é exercitado em cypress/known-issues. Aqui ficam
// os comportamentos do painel que seguem funcionando.
describe('Frontend - Produtos (administrador)', () => {
  beforeEach(() => {
    cy.criarUsuario(novoAdministrador()).then((admin) => cy.loginViaApi(admin));
  });

  it(
    'exibe o produto cadastrado no painel do administrador e na loja do cliente',
    { tags: '@smoke' },
    () => {
      cy.criarProduto().then((produto) => {
        ProdutosAdminPage.visitarLista();
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
      });
    },
  );

  it('exige o preenchimento dos campos obrigatórios no cadastro', () => {
    ProdutosAdminPage.visitarCadastro();
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
});
