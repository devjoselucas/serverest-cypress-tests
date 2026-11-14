import { Alertas } from './components/Alertas';
import { respostaDe } from './respostas';

export class CadastroPage {
  constructor(page) {
    this.page = page;
    this.alertas = new Alertas(page);
    this.mensagemDeSucesso = page.getByText('Cadastro realizado com sucesso');
  }

  async abrir() {
    await this.page.goto('/cadastrarusuarios');
  }

  async preencher({ nome, email, password }) {
    await this.page.getByTestId('nome').fill(nome);
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('password').fill(password);
  }

  /** Envia o formulário; devolve a resposta da API de cadastro. */
  async enviar() {
    const resposta = respostaDe(this.page, 'POST', '/usuarios');
    await this.page.getByTestId('cadastrar').click();
    return resposta;
  }
}
