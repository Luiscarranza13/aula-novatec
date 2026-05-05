const mysql = require('mysql2');
require('dotenv').config();

// Pool compartido — se asigna desde index.js tras crear la BD
let pool = null;

const db = {
  setPool: (p) => { pool = p; },
  execute: (...args) => pool.execute(...args),
  query: (...args) => pool.query(...args),
};

module.exports = db;
