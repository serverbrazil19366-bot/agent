import { handle } from '../../lib/handler.mjs';

export default (req) => handle(req);

export const config = { path: '/api/*' };
