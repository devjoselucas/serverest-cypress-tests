import HomePage from '../../pages/HomePage';
import LoginPage from '../../pages/LoginPage';
import { novoAdministrador, novoUsuario } from '../../support/factories';

describe('Frontend - Login', () => {
  beforeEach(() => {
    LoginPage.visitar();
  });

  it('autentica um usuário comum e exibe a loja', () => {
    cy.criarUsuario().then((usuario) => {
      LoginPage.entrarCom(usuario).its('response.statusCode').should('eq', 200);

      cy.location('pathname').should('eq', '/home');
      HomePage.titulo().should('be.visible');
      HomePage.botaoSair().should('be.visible');
    });
  });

  it('autentica um administrador e exibe a área administrativa', () => {
    cy.criarUsuario(novoAdministrador()).then((admin) => {
      LoginPage.entrarCom(admin).its('response.statusCode').should('eq', 200);

      cy.location('pathname').should('eq', '/admin/home');
      cy.contains('h1', `Bem Vindo ${admin.nome}`).should('be.visible');
    });
  });

  it('recusa credenciais inválidas e mantém o usuário na tela de login', () => {
    // Usuário gerado pela factory, mas nunca cadastrado.
    LoginPage.entrarCom(novoUsuario()).its('response.statusCode').should('eq', 401);

    LoginPage.alerta().should('be.visible').and('contain.text', 'Email e/ou senha inválidos');
    cy.location('pathname').should('eq', '/login');
    cy.window().its('localStorage').invoke('getItem', 'serverest/userToken').should('be.null');
  });
});
