import { apiUrl } from '../support/api/client';

class CadastroPage {
  visitar() {
    cy.intercept('POST', apiUrl('/usuarios')).as('cadastro');
    cy.visit('/cadastrarusuarios');
  }

  preencher({ nome, email, password }) {
    cy.getByTestId('nome').type(nome);
    cy.getByTestId('email').type(email);
    cy.getByTestId('password').type(password, { log: false });
  }

  enviar() {
    cy.getByTestId('cadastrar').click();
    return cy.wait('@cadastro');
  }

  mensagemDeSucesso() {
    return cy.contains('Cadastro realizado com sucesso');
  }

  alertas() {
    return cy.get('[role="alert"]');
  }
}

export default new CadastroPage();
