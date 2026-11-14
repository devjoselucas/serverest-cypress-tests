/**
 * Componente compartilhado: os alertas de validação têm a mesma marcação em todos os
 * formulários da aplicação (login, cadastro de usuário e cadastro de produto).
 */
class Alertas {
  todos() {
    return cy.get('[role="alert"]');
  }

  com(mensagem) {
    return cy.contains('[role="alert"]', mensagem);
  }
}

export default new Alertas();
