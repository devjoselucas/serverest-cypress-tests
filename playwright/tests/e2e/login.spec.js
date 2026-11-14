import { novoAdministrador, novoUsuario } from '../../../shared/factories';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { expect, test as base } from '../../support/fixtures';

// Fixture local: entrega a tela de login já aberta.
const test = base.extend({
  loginPage: async ({ page }, use) => {
    const tela = new LoginPage(page);
    await tela.abrir();
    await use(tela);
  },
});

test.describe('Frontend - Login', () => {
  test(
    'autentica um usuário comum e exibe a loja',
    { tag: '@smoke' },
    async ({ page, massa, loginPage }) => {
      const usuario = await massa.criarUsuario();
      const home = new HomePage(page);

      const resposta = await loginPage.entrarCom(usuario);
      expect(resposta.status()).toBe(200);

      await expect(page).toHaveURL('/home');
      await expect(home.titulo).toBeVisible();
      await expect(home.botaoSair).toBeVisible();
    },
  );

  test('autentica um administrador e exibe a área administrativa', async ({
    page,
    massa,
    loginPage,
  }) => {
    const admin = await massa.criarUsuario(novoAdministrador());

    const resposta = await loginPage.entrarCom(admin);
    expect(resposta.status()).toBe(200);

    await expect(page).toHaveURL('/admin/home');
    await expect(page.getByRole('heading', { name: `Bem Vindo ${admin.nome}` })).toBeVisible();
  });

  test('recusa credenciais inválidas e mantém o usuário na tela de login', async ({
    page,
    loginPage,
  }) => {
    // Usuário gerado pela factory, mas nunca cadastrado.
    const resposta = await loginPage.entrarCom(novoUsuario());
    expect(resposta.status()).toBe(401);

    await expect(loginPage.alertas.com('Email e/ou senha inválidos')).toBeVisible();
    await expect(page).toHaveURL('/login');
    expect(await page.evaluate(() => localStorage.getItem('serverest/userToken'))).toBeNull();
  });
});
