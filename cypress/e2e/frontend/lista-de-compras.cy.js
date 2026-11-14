import HomePage from '../../pages/HomePage';
import ListaDeComprasPage from '../../pages/ListaDeComprasPage';

describe('Frontend - Lista de compras', () => {
  let produto;

  // Pré-condições montadas via API: o teste começa já autenticado e com um produto
  // próprio, sem depender do catálogo existente no ambiente compartilhado.
  beforeEach(() => {
    cy.criarProduto().then((criado) => {
      produto = criado;
    });
    cy.criarUsuario().then((usuario) => cy.loginViaApi(usuario));

    HomePage.visitar();
    cy.then(() => {
      HomePage.pesquisarProduto(produto.nome);
      HomePage.adicionarNaLista(produto.nome);
    });
    cy.location('pathname').should('eq', '/minhaListaDeProdutos');
  });

  it('adiciona à lista um produto encontrado pela pesquisa', () => {
    ListaDeComprasPage.nomesDosProdutos()
      .should('have.length', 1)
      .and('contain.text', produto.nome);
    ListaDeComprasPage.quantidadeDoProduto().should('have.text', 'Total: 1');
  });

  it('atualiza a quantidade do produto na lista', () => {
    ListaDeComprasPage.aumentarQuantidade();
    ListaDeComprasPage.quantidadeDoProduto().should('have.text', 'Total: 2');

    ListaDeComprasPage.diminuirQuantidade();
    ListaDeComprasPage.quantidadeDoProduto().should('have.text', 'Total: 1');
  });

  it('esvazia a lista ao limpar', () => {
    ListaDeComprasPage.limpar();

    ListaDeComprasPage.mensagemDeListaVazia().should('be.visible');
    ListaDeComprasPage.nomesDosProdutos().should('not.exist');
  });
});
