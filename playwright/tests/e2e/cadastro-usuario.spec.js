import { novoUsuario } from '../../../shared/factories';
import { CadastroPage } from '../../pages/CadastroPage';
import { HomePage } from '../../pages/HomePage';
import { expect, test as base } from '../../support/fixtures';

// Fixture local: entrega a tela de cadastro já aberta.
const test = base.extend({
  cadastroPage: async ({ page }, use) => {
    const tela = new CadastroPage(page);
    await tela.abrir();
    await use(tela);
  },
});

test.describe('Frontend - Cadastro de usuário', () => {
  test(
    'cadastra um novo usuário e o direciona para a loja',
    { tag: '@smoke' },
    async ({ page, api, massa, cadastroPage }) => {
      const usuario = novoUsuario();

      await cadastroPage.preencher(usuario);
      const resposta = await cadastroPage.enviar();
      const { _id } = await resposta.json();
      massa.limparAoFinal(() => api.usuarios.excluir(_id));
      expect(resposta.status()).toBe(201);

      // Além da mensagem em tela, confirma na API que o cadastro foi persistido como usuário comum.
      const persistido = await (await api.usuarios.buscarPorId(_id)).json();
      expect(persistido).toMatchObject({
        nome: usuario.nome,
        email: usuario.email,
        administrador: 'false',
      });

      await expect(cadastroPage.mensagemDeSucesso).toBeVisible();
      // A aplicação aguarda cerca de 3s exibindo a mensagem antes de redirecionar.
      await expect(page).toHaveURL('/home', { timeout: 10_000 });
      await expect(new HomePage(page).titulo).toBeVisible();
    },
  );

  test('não permite cadastrar um e-mail já utilizado', async ({ page, massa, cadastroPage }) => {
    const existente = await massa.criarUsuario();

    await cadastroPage.preencher(novoUsuario({ email: existente.email }));
    const resposta = await cadastroPage.enviar();
    expect(resposta.status()).toBe(400);

    await expect(cadastroPage.alertas.todos).toHaveCount(1);
    await expect(cadastroPage.alertas.com('Este email já está sendo usado')).toBeVisible();
    await expect(page).toHaveURL('/cadastrarusuarios');
  });

  test('exige o preenchimento dos campos obrigatórios', async ({ page, cadastroPage }) => {
    const resposta = await cadastroPage.enviar();
    expect(resposta.status()).toBe(400);

    await expect(cadastroPage.alertas.todos).toHaveCount(3);
    for (const mensagem of [
      'Nome é obrigatório',
      'Email é obrigatório',
      'Password é obrigatório',
    ]) {
      await expect(cadastroPage.alertas.com(mensagem)).toBeVisible();
    }
    await expect(page).toHaveURL('/cadastrarusuarios');
  });
});
