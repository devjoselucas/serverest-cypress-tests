import { novoProduto } from '../../../shared/factories';
import { expect, test } from '../../support/fixtures';

test.describe('API - Login', () => {
  test(
    'autentica com credenciais válidas e retorna um token Bearer',
    { tag: '@smoke' },
    async ({ api, massa }) => {
      const { email, password } = await massa.criarUsuario();

      const login = await api.login.autenticar({ email, password });
      const { message, authorization } = await login.json();

      expect(login.status()).toBe(200);
      expect(message).toBe('Login realizado com sucesso');
      expect(authorization).toMatch(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);
    },
  );

  test('recusa senha incorreta sem emitir token', async ({ api, massa }) => {
    const { email } = await massa.criarUsuario();

    const login = await api.login.autenticar({ email, password: 'senha-incorreta' });

    expect(login.status()).toBe(401);
    expect(await login.json()).toEqual({ message: 'Email e/ou senha inválidos' });
  });

  test('valida o formato do e-mail e a senha em branco', async ({ api }) => {
    const login = await api.login.autenticar({ email: 'email-invalido', password: '' });

    expect(login.status()).toBe(400);
    expect(await login.json()).toEqual({
      email: 'email deve ser um email válido',
      password: 'password não pode ficar em branco',
    });
  });

  test('nega rota exclusiva de administrador ao token de um usuário comum', async ({
    api,
    massa,
  }) => {
    const produto = novoProduto();
    const token = await massa.obterToken(await massa.criarUsuario());

    const cadastro = await api.produtos.criar(produto, token);
    expect(cadastro.status()).toBe(403);
    expect(await cadastro.json()).toEqual({ message: 'Rota exclusiva para administradores' });

    const { quantidade } = await (await api.produtos.listar({ nome: produto.nome })).json();
    expect(quantidade).toBe(0);
  });
});
