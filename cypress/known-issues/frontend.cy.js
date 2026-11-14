import Alertas from '../pages/components/Alertas';
import CadastroPage from '../pages/CadastroPage';
import HomePage from '../pages/HomePage';
import ListaDeComprasPage from '../pages/ListaDeComprasPage';
import { novoUsuario } from '../../shared/factories';
import { usuariosApi } from '../support/api';

// Cada teste descreve o comportamento esperado de um item de
// docs/comportamentos-inesperados.md e falha enquanto o defeito existir.
describe('Defeitos conhecidos - Frontend', () => {
  const cadastrarPelaTela = () => {
    CadastroPage.visitar();
    CadastroPage.preencher(novoUsuario());
    CadastroPage.enviar().then(({ response }) => {
      cy.limparAoFinal(() => usuariosApi.excluir(response.body._id));
    });
  };

  const abrirListaComUmProduto = () => {
    cy.criarProduto().as('produto');
    cy.criarUsuario().then((usuario) => cy.loginViaApi(usuario));
    HomePage.visitar();
    cy.get('@produto').then(({ nome }) => {
      HomePage.pesquisarProduto(nome);
      HomePage.adicionarNaLista(nome);
    });
  };

  it('[F1] a senha não deveria ser gravada no localStorage após o cadastro', () => {
    cadastrarPelaTela();
    CadastroPage.mensagemDeSucesso().should('be.visible');

    cy.window().its('localStorage').invoke('getItem', 'serverest/userPassword').should('be.null');
  });

  it('[F2] "Adicionar no carrinho" não deveria levar a uma página em construção', () => {
    abrirListaComUmProduto();
    ListaDeComprasPage.adicionarNoCarrinho();

    cy.location('pathname').should('eq', '/carrinho');
    cy.contains('Em construção').should('not.exist');
  });

  it('[F3] o campo "Preço" deveria manter o preço unitário ao alterar a quantidade', function () {
    abrirListaComUmProduto();
    ListaDeComprasPage.aumentarQuantidade();
    ListaDeComprasPage.quantidadeDoProduto().should('have.text', 'Total: 2');

    cy.get('@produto').then(({ preco }) => {
      cy.contains('p', 'Preço').should('have.text', `Preço R$${preco}`);
    });
  });

  it('[F4] a mensagem de lista vazia não deveria mencionar "carrinho"', () => {
    abrirListaComUmProduto();
    ListaDeComprasPage.limpar();

    ListaDeComprasPage.mensagemDeListaVazia().should('not.contain.text', 'carrinho');
  });

  it('[F5] o alerta de sucesso do cadastro deveria ter role="alert"', () => {
    cadastrarPelaTela();
    CadastroPage.mensagemDeSucesso().should('be.visible');

    Alertas.com('Cadastro realizado com sucesso').should('exist');
  });

  it('[F6] o documento deveria declarar o idioma pt-BR', () => {
    cy.visit('/login');

    cy.get('html').should('have.attr', 'lang', 'pt-BR');
  });

  it('[F8] um usuário comum não deveria abrir as telas de administrador', () => {
    cy.criarUsuario().then((usuario) => cy.loginViaApi(usuario));
    cy.visit('/admin/cadastrarprodutos');

    cy.location('pathname').should('not.eq', '/admin/cadastrarprodutos');
  });
});
