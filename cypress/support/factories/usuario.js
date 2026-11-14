import { faker } from '@faker-js/faker';

/**
 * Gera um usuário válido e único. O ambiente do ServeRest é público e compartilhado,
 * por isso o e-mail nunca é fixo: cada teste trabalha com a própria massa.
 */
export const novoUsuario = (overrides = {}) => ({
  nome: faker.person.fullName(),
  email: `qa.${faker.string.uuid()}@teste.com`,
  password: faker.internet.password({ length: 12 }),
  administrador: 'false',
  ...overrides,
});

export const novoAdministrador = (overrides = {}) =>
  novoUsuario({ administrador: 'true', ...overrides });
