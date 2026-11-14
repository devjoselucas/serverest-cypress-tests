import { apiUrl } from '../support/api/client';

class HomePage {
  visitar() {
    cy.intercept('GET', apiUrl('/produtos*')).as('produtos');
    cy.visit('/home');
    cy.wait('@produtos');
  }

  titulo() {
    return cy.contains('h1', 'Serverest Store');
  }

  botaoSair() {
    return cy.getByTestId('logout');
  }

  pesquisarProduto(nome) {
    cy.getByTestId('pesquisar').type(nome);
    cy.getByTestId('botaoPesquisar').click();
    // Aguarda a resposta da busca em vez de usar esperas fixas.
    cy.wait('@produtos').its('request.url').should('include', 'nome=');
  }

  cardDoProduto(nome) {
    return cy.contains('.card', nome);
  }

  adicionarNaLista(nome) {
    this.cardDoProduto(nome).find('[data-testid="adicionarNaLista"]').click();
  }
}

export default new HomePage();
