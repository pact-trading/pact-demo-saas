import 'server-only';
import { createPactNodeClient } from '@pactagent/node';

/** Server-only Pact client: the secret key never reaches the browser. */
export const pact = createPactNodeClient({
  apiKey: process.env.PACT_SECRET_KEY!,
  baseUrl: process.env.PACT_API_URL ?? 'https://api.pactagent.app',
});
