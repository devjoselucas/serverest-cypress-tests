import { apiUrl } from '../support/api/client';

class ProdutosAdminPage {
  visitarCadastro() {
    cy.intercept('POST', apiUrl('/produtos')).as('cadastroProduto');
    cy.visit('/admin/cadastrarprodutos');
  }

  preencher({ nome, preco, descricao, quantidade }) {
    cy.getByTestId('nome').type(nome);
    cy.getByTestId('preco').type(preco);
    cy.getByTestId('descricao').type(descricao);
    cy.getByTestId('quantity').type(quantidade);
  }

  enviar() {
    // O data-testid do botão tem um erro de digitação na própria aplicação ("cadastar").
    cy.getByTestId('cadastarProdutos').click();
    return cy.wait('@cadastroProduto');
  }

  linhaDoProduto(nome) {
    return cy.contains('tr', nome);
  }
}

export default new ProdutosAdminPage();
