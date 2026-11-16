import Alertas from '../pages/components/Alertas';
import CadastroPage from '../pages/CadastroPage';
import HomePage from '../pages/HomePage';
import ListaDeComprasPage from '../pages/ListaDeComprasPage';
import ProdutosAdminPage from '../pages/ProdutosAdminPage';
import { novoAdministrador, novoProduto, novoUsuario } from '../../shared/factories';
import { produtosApi, usuariosApi } from '../support/api';

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

  // F10: o formulário envia preço e quantidade como texto e a API os recusa (400).
  const abrirCadastroDeProdutosComoAdmin = () => {
    cy.criarUsuario(novoAdministrador()).then((admin) => {
      cy.obterToken(admin).as('tokenAdmin');
      cy.loginViaApi(admin);
    });
    ProdutosAdminPage.visitarCadastro();
  };

  it('[F10] o administrador deveria conseguir cadastrar um produto pela tela', () => {
    abrirCadastroDeProdutosComoAdmin();
    ProdutosAdminPage.preencher(novoProduto());

    ProdutosAdminPage.enviar().then(({ response }) => {
      // Quando o defeito for corrigido o produto passa a ser criado e precisa ser removido.
      if (response.statusCode === 201) {
        cy.get('@tokenAdmin').then((token) => {
          cy.limparAoFinal(() => produtosApi.excluir(response.body._id, token));
        });
      }
      expect(response.statusCode).to.eq(201);
    });
    cy.location('pathname').should('eq', '/admin/listarprodutos');
  });

  it('[F10] o cadastro pela tela deveria avisar quando o nome do produto já existe', () => {
    abrirCadastroDeProdutosComoAdmin();

    cy.criarProduto().then((existente) => {
      ProdutosAdminPage.preencher(novoProduto({ nome: existente.nome }));
      ProdutosAdminPage.enviar();

      Alertas.com('Já existe produto com esse nome').should('be.visible');
    });
  });
});
