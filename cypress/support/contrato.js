import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

/**
 * Valida uma resposta contra o JSON Schema e, na falha, lista todos os desvios encontrados.
 */
export const validarContrato = (schema, dados) => {
  const valido = ajv.validate(schema, dados);
  expect(valido, `contrato de ${schema.title}: ${valido ? 'ok' : ajv.errorsText()}`).to.eq(true);
};
