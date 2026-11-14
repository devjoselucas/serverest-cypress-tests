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

  async preencher({ nome, preco, descricao, quantidade }) {
    await this.page.getByTestId('nome').fill(nome);
    await this.page.getByTestId('preco').fill(String(preco));
    await this.page.getByTestId('descricao').fill(descricao);
    await this.page.getByTestId('quantity').fill(String(quantidade));
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
