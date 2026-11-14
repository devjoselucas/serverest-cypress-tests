import { usuariosApi } from '../../support/api';
import { novoUsuario } from '../../../shared/factories';

describe('API - Usuários', () => {
  it('cadastra um usuário e o disponibiliza para consulta', () => {
    const usuario = novoUsuario();

    usuariosApi.criar(usuario).then(({ status, body }) => {
      cy.limparAoFinal(() => usuariosApi.excluir(body._id));

      expect(status).to.eq(201);
      expect(body.message).to.eq('Cadastro realizado com sucesso');
      expect(body._id).to.match(/^[a-zA-Z0-9]{16}$/);

      usuariosApi.buscarPorId(body._id).then((consulta) => {
        expect(consulta.status).to.eq(200);
        expect(consulta.body).to.deep.eq({ ...usuario, _id: body._id });
      });
    });
  });

  it('não permite cadastrar dois usuários com o mesmo e-mail', () => {
    cy.criarUsuario().then((existente) => {
      const duplicado = novoUsuario({ email: existente.email });

      usuariosApi.criar(duplicado).then(({ status, body }) => {
        expect(status).to.eq(400);
        expect(body).to.deep.eq({ message: 'Este email já está sendo usado' });
      });

      usuariosApi.listar({ email: existente.email }).then(({ body }) => {
        expect(body.quantidade, 'usuários com o e-mail informado').to.eq(1);
        expect(body.usuarios[0]._id).to.eq(existente._id);
      });
    });
  });

  it('valida os campos obrigatórios no cadastro', () => {
    usuariosApi.criar({}).then(({ status, body }) => {
      expect(status).to.eq(400);
      expect(body).to.deep.eq({
        nome: 'nome é obrigatório',
        email: 'email é obrigatório',
        password: 'password é obrigatório',
        administrador: 'administrador é obrigatório',
      });
    });
  });
});
