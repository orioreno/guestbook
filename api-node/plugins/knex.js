const knex = require('knex')({
  client: 'sqlite3', // or 'better-sqlite3'
  connection: {
    filename: process.env.DBDIR + '/' + process.env.DBNAME
  }
});

module.exports = knex;
