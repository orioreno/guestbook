const dir = process.env.DBDIR || "db";
const filename = process.env.DBNAME || "guestbook.db";
const fullpath = dir + '/' + filename;

const knex = require('knex')({
  client: 'sqlite3', // or 'better-sqlite3'
  connection: {
    filename: fullpath
  }
});

module.exports = knex;
