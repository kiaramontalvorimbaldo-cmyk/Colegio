'use strict';
require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const driver = process.env.DB_DRIVER || 'sqlite';
if (!['sqlite', 'postgres'].includes(driver)) throw new Error('DB_DRIVER debe ser sqlite o postgres');
module.exports = require(driver === 'postgres' ? './db-postgres' : './db-local');
