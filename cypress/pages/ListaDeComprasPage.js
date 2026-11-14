class ListaDeComprasPage {
  nomesDosProdutos() {
    return cy.getByTestId('shopping-cart-product-name');
  }

  quantidadeDoProduto() {
    return cy.getByTestId('shopping-cart-product-quantity');
  }

  aumentarQuantidade() {
    cy.getByTestId('product-increase-quantity').click();
  }

  diminuirQuantidade() {
    cy.getByTestId('product-decrease-quantity').click();
  }

  limpar() {
    cy.getByTestId('limparLista').click();
  }

  mensagemDeListaVazia() {
    return cy.getByTestId('shopping-cart-empty-message');
  }
}

export default new ListaDeComprasPage();
