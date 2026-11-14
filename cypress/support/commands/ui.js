Cypress.Commands.add('getByTestId', (testId, options) =>
  cy.get(`[data-testid="${testId}"]`, options),
);

/**
 * Autentica pela API e injeta a sessão no navegador, sem passar pela tela de login.
 * Usado pelos testes cujo objetivo não é o login, deixando-os mais rápidos e estáveis.
 */
Cypress.Commands.add('loginViaApi', (usuario) => {
  cy.session(
    usuario.email,
    () => {
      cy.obterToken(usuario).then((token) => {
        cy.visit('/login');
        cy.window().then((win) => {
          win.localStorage.setItem('serverest/userEmail', usuario.email);
          win.localStorage.setItem('serverest/userToken', token);
        });
      });
    },
    {
      validate: () => {
        cy.window()
          .its('localStorage')
          .invoke('getItem', 'serverest/userToken')
          .should('be.a', 'string');
      },
    },
  );
});
