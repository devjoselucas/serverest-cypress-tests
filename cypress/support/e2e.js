import { register as registrarGrep } from '@cypress/grep';
import './commands/dados';
import './commands/ui';
import { executarLimpeza } from './cleanup';

// Habilita a seleção de testes por tag (ex.: npm run test:smoke).
registrarGrep();

// Remove a massa criada pelo teste, independentemente de ele ter passado ou falhado.
afterEach(() => {
  executarLimpeza();
});
