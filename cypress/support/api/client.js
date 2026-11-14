export const apiUrl = (path = '') => `${Cypress.expose('apiUrl')}${path}`;

/**
 * Cliente HTTP único da suíte: concentra URL base, autenticação e a política de
 * não falhar em respostas 4xx/5xx, para que os testes possam validar cenários de erro.
 */
export const apiRequest = ({ method = 'GET', path, body, qs, token }) =>
  cy.request({
    method,
    url: apiUrl(path),
    body,
    qs,
    headers: token ? { Authorization: token } : {},
    failOnStatusCode: false,
  });
