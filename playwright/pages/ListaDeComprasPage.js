export class ListaDeComprasPage {
  constructor(page) {
    this.page = page;
    this.nomesDosProdutos = page.getByTestId('shopping-cart-product-name');
    this.quantidadeDoProduto = page.getByTestId('shopping-cart-product-quantity');
    this.mensagemDeListaVazia = page.getByTestId('shopping-cart-empty-message');
  }

  async aumentarQuantidade() {
    await this.page.getByTestId('product-increase-quantity').click();
  }

  async diminuirQuantidade() {
    await this.page.getByTestId('product-decrease-quantity').click();
  }

  async limpar() {
    await this.page.getByTestId('limparLista').click();
  }
}
