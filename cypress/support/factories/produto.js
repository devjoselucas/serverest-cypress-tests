import { faker } from '@faker-js/faker';

export const novoProduto = (overrides = {}) => ({
  nome: `Produto QA ${faker.string.uuid()}`,
  preco: faker.number.int({ min: 10, max: 5000 }),
  descricao: faker.commerce.productDescription(),
  quantidade: faker.number.int({ min: 10, max: 100 }),
  ...overrides,
});
