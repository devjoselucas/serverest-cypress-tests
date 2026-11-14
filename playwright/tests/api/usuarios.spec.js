import { novoUsuario } from '../../../shared/factories';
import { expect, test } from '../../support/fixtures';

test.describe('API - Usuários', () => {
  test(
    'cadastra um usuário e o disponibiliza para consulta',
    { tag: '@smoke' },
    async ({ api, massa }) => {
      const usuario = novoUsuario();

      const cadastro = await api.usuarios.criar(usuario);
      const { message, _id } = await cadastro.json();
      massa.limparAoFinal(() => api.usuarios.excluir(_id));

      expect(cadastro.status()).toBe(201);
      expect(message).toBe('Cadastro realizado com sucesso');
      expect(_id).toMatch(/^[a-zA-Z0-9]{16}$/);

      const consulta = await api.usuarios.buscarPorId(_id);
      expect(consulta.status()).toBe(200);
      expect(await consulta.json()).toEqual({ ...usuario, _id });
    },
  );

  test('não permite cadastrar dois usuários com o mesmo e-mail', async ({ api, massa }) => {
    const existente = await massa.criarUsuario();

    const cadastro = await api.usuarios.criar(novoUsuario({ email: existente.email }));
    expect(cadastro.status()).toBe(400);
    expect(await cadastro.json()).toEqual({ message: 'Este email já está sendo usado' });

    const { quantidade, usuarios } = await (
      await api.usuarios.listar({ email: existente.email })
    ).json();
    expect(quantidade, 'usuários com o e-mail informado').toBe(1);
    expect(usuarios[0]._id).toBe(existente._id);
  });

  test('valida os campos obrigatórios no cadastro', async ({ api }) => {
    const cadastro = await api.usuarios.criar({});

    expect(cadastro.status()).toBe(400);
    expect(await cadastro.json()).toEqual({
      nome: 'nome é obrigatório',
      email: 'email é obrigatório',
      password: 'password é obrigatório',
      administrador: 'administrador é obrigatório',
    });
  });
});
