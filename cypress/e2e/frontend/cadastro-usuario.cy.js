import Alertas from '../../pages/components/Alertas';
import CadastroPage from '../../pages/CadastroPage';
import HomePage from '../../pages/HomePage';
import { usuariosApi } from '../../support/api';
import { novoUsuario } from '../../../shared/factories';

describe('Frontend - Cadastro de usuário', () => {
  beforeEach(() => {
    CadastroPage.visitar();
  });

  it('cadastra um novo usuário e o direciona para a loja', () => {
    const usuario = novoUsuario();

    CadastroPage.preencher(usuario);
    CadastroPage.enviar().then(({ response }) => {
      cy.limparAoFinal(() => usuariosApi.excluir(response.body._id));
      expect(response.statusCode).to.eq(201);

      // Além da mensagem em tela, confirma na API que o cadastro foi persistido como usuário comum.
      usuariosApi.buscarPorId(response.body._id).its('body').should('include', {
        nome: usuario.nome,
        email: usuario.email,
        administrador: 'false',
      });
    });

    CadastroPage.mensagemDeSucesso().should('be.visible');
    // A aplicação aguarda cerca de 3s exibindo a mensagem antes de redirecionar.
    cy.location('pathname', { timeout: 10000 }).should('eq', '/home');
    HomePage.titulo().should('be.visible');
  });

  it('não permite cadastrar um e-mail já utilizado', () => {
    cy.criarUsuario().then((existente) => {
      CadastroPage.preencher(novoUsuario({ email: existente.email }));
      CadastroPage.enviar().its('response.statusCode').should('eq', 400);

      Alertas.todos()
        .should('have.length', 1)
        .and('contain.text', 'Este email já está sendo usado');
      cy.location('pathname').should('eq', '/cadastrarusuarios');
    });
  });

  it('exige o preenchimento dos campos obrigatórios', () => {
    CadastroPage.enviar().its('response.statusCode').should('eq', 400);

    Alertas.todos().should('have.length', 3);
    ['Nome é obrigatório', 'Email é obrigatório', 'Password é obrigatório'].forEach((mensagem) => {
      Alertas.com(mensagem).should('be.visible');
    });
    cy.location('pathname').should('eq', '/cadastrarusuarios');
  });
});
