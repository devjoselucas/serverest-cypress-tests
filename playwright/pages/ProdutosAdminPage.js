import { Alertas } from './components/Alertas';
import { respostaDe } from './respostas';

export class ProdutosAdminPage {
  constructor(page) {
    this.page = page;
    this.alertas = new Alertas(page);
  }

  async abrirCadastro() {
    await this.page.goto('/admin/cadastrarprodutos');
  }

  async abrirLista() {
    const lista = respostaDe(this.page, 'GET', '/produtos');
    await this.page.goto('/admin/listarprodutos');
    await lista;
  }

  /** Envia o formulário; devolve a resposta da API de cadastro de produto. */
  async enviar() {
    const resposta = respostaDe(this.page, 'POST', '/produtos');
    // O data-testid do botão tem um erro de digitação na própria aplicação ("cadastar").
    await this.page.getByTestId('cadastarProdutos').click();
    return resposta;
  }

  linhaDoProduto(nome) {
    return this.page.getByRole('row').filter({ hasText: nome });
  }
}
