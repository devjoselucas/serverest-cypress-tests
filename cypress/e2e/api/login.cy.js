import { loginApi, produtosApi } from '../../support/api';
import { novoProduto } from '../../../shared/factories';

describe('API - Login', () => {
  it('autentica com credenciais válidas e retorna um token Bearer', () => {
    cy.criarUsuario().then(({ email, password }) => {
      loginApi.autenticar({ email, password }).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.message).to.eq('Login realizado com sucesso');
        expect(body.authorization).to.match(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);
      });
    });
  });

  it('recusa senha incorreta sem emitir token', () => {
    cy.criarUsuario().then(({ email }) => {
      loginApi.autenticar({ email, password: 'senha-incorreta' }).then(({ status, body }) => {
        expect(status).to.eq(401);
        expect(body).to.deep.eq({ message: 'Email e/ou senha inválidos' });
      });
    });
  });

  it('valida o formato do e-mail e a senha em branco', () => {
    loginApi.autenticar({ email: 'email-invalido', password: '' }).then(({ status, body }) => {
      expect(status).to.eq(400);
      expect(body).to.deep.eq({
        email: 'email deve ser um email válido',
        password: 'password não pode ficar em branco',
      });
    });
  });

  it('nega rota exclusiva de administrador ao token de um usuário comum', () => {
    const produto = novoProduto();

    cy.criarUsuario()
      .then((usuario) => cy.obterToken(usuario))
      .then((token) => produtosApi.criar(produto, token))
      .then(({ status, body }) => {
        expect(status).to.eq(403);
        expect(body).to.deep.eq({ message: 'Rota exclusiva para administradores' });
      });

    produtosApi.listar({ nome: produto.nome }).its('body.quantidade').should('eq', 0);
  });
});
