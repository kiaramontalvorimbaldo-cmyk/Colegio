'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const base = path.join(__dirname, 'backend');
const env = path.join(base, '.env');
if (!fs.existsSync(env)) {
  fs.writeFileSync(env, fs.readFileSync(path.join(base, '.env.example'), 'utf8') +
    '\nJWT_SECRET=' + randomBytes(48).toString('hex') + '\n', { flag: 'wx' });
}
require('./backend/node_modules/dotenv').config({ path: env });
if (!process.env.JWT_SECRET) throw new Error('Configure JWT_SECRET en backend/.env');
if (!fs.existsSync(path.join(__dirname, 'frontend/dist/frontend/browser/index.html'))) {
  throw new Error('Falta compilar la interfaz. Ejecute npm run build');
}
const app = require('./backend/src/app');
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, '127.0.0.1', () => console.log('Sistema listo: http://localhost:' + port));
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? 'El puerto ya esta ocupado. Cierre la otra instancia o cambie PORT en backend/.env.' : error.message);
  process.exitCode = 1;
});
