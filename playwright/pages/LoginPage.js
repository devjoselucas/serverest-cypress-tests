import { Alertas } from './components/Alertas';
import { respostaDe } from './respostas';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.alertas = new Alertas(page);
  }

  async abrir() {
    await this.page.goto('/login');
  }

  /** Preenche e envia o formulário; devolve a resposta da API de login. */
  async entrarCom({ email, password }) {
    const resposta = respostaDe(this.page, 'POST', '/login');
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('senha').fill(password);
    await this.page.getByTestId('entrar').click();
    return resposta;
  }
}
