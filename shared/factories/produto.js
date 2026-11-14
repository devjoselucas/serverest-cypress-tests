import { faker } from '@faker-js/faker';
import massa from '../massa.json';

export const novoProduto = (overrides = {}) => ({
  nome: `${massa.prefixoProduto}${faker.string.uuid()}`,
  preco: faker.number.int({ min: 10, max: 5000 }),
  descricao: faker.commerce.productDescription(),
  quantidade: faker.number.int({ min: 10, max: 100 }),
  ...overrides,
});
