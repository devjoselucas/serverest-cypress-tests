/**
 * Aguarda a resposta de uma chamada que a tela faz à API. É o equivalente ao
 * `cy.intercept` + `cy.wait('@alias')` do Cypress: sincroniza pelo evento de rede, e não
 * por tempo. Deve ser chamada ANTES da ação que dispara a requisição.
 */
export const respostaDe = (page, metodo, caminho) =>
  page.waitForResponse(
    (resposta) =>
      resposta.request().method() === metodo && new URL(resposta.url()).pathname === caminho,
  );
