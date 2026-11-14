import { faker } from '@faker-js/faker';
import massa from '../massa.json';

/**
 * Gera um usuário válido e único. O ambiente do ServeRest é público e compartilhado,
 * por isso o e-mail nunca é fixo: cada teste trabalha com a própria massa. O prefixo
 * identifica os dados desta suíte e permite a varredura de resíduos (scripts/limpar-massa.js).
 */
export const novoUsuario = (overrides = {}) => ({
  nome: faker.person.fullName(),
  email: `${massa.prefixoEmail}${faker.string.uuid()}${massa.dominioEmail}`,
  password: faker.internet.password({ length: 12 }),
  administrador: 'false',
  ...overrides,
});

export const novoAdministrador = (overrides = {}) =>
  novoUsuario({ administrador: 'true', ...overrides });
