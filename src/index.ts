import { Hono } from 'hono';
import { cardController } from './controllers/card.controller';
import { embedController } from './controllers/embed.controller';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) =>
  c.text(
    'GitDventurer ⚔️ — tu perfil de GitHub como carta de aventurero RPG.\n' +
      'SVG:     GET /card/:username        (README, <img>, <object>)\n' +
      'Reverso: GET /card/:username/back   (registro del gremio)\n' +
      'Embed:   GET /card/:username/embed  (iframe: tilt 3D + flip al click)\n' +
      'Opcionales: ?theme=dark-fantasy&demo=1\n',
  ),
);

app.get('/card/:username', cardController('front'));
app.get('/card/:username/back', cardController('back'));
app.get('/card/:username/embed', embedController);

export default app;
