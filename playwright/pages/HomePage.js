import { respostaDe } from './respostas';

export class HomePage {
  constructor(page) {
    this.page = page;
    this.titulo = page.getByRole('heading', { name: 'Serverest Store' });
    this.botaoSair = page.getByTestId('logout');
  }

  async abrir() {
    const catalogo = respostaDe(this.page, 'GET', '/produtos');
    await this.page.goto('/home');
    await catalogo;
  }

  async pesquisarProduto(nome) {
    await this.page.getByTestId('pesquisar').fill(nome);
    // Aguarda a resposta da busca em vez de usar esperas fixas.
    const busca = respostaDe(this.page, 'GET', '/produtos');
    await this.page.getByTestId('botaoPesquisar').click();
    await busca;
  }

  cardDoProduto(nome) {
    return this.page.locator('.card').filter({ hasText: nome });
  }

  async adicionarNaLista(nome) {
    await this.cardDoProduto(nome).getByTestId('adicionarNaLista').click();
  }
}
