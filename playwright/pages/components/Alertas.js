/**
 * Componente compartilhado: os alertas de validação têm a mesma marcação em todos os
 * formulários da aplicação (login, cadastro de usuário e cadastro de produto).
 */
export class Alertas {
  constructor(page) {
    this.todos = page.getByRole('alert');
  }

  com(mensagem) {
    return this.todos.filter({ hasText: mensagem });
  }
}
