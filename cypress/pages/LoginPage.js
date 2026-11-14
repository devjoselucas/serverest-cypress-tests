import { apiUrl } from '../support/api/client';

class LoginPage {
  visitar() {
    cy.intercept('POST', apiUrl('/login')).as('login');
    cy.visit('/login');
  }

  entrarCom({ email, password }) {
    cy.getByTestId('email').type(email);
    cy.getByTestId('senha').type(password, { log: false });
    cy.getByTestId('entrar').click();
    return cy.wait('@login');
  }
}

export default new LoginPage();
