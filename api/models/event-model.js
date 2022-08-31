var knex = require('../plugins/knex.js');
var moment = require('moment');
const tableName = 'event';

module.exports = {
  async checkNameExist(name) {
    const existing = await knex(tableName)
      .first('id')
      .where('name', '=', name);
    return existing ?? false;
  },
  async add(name, password) {
    name = name.trim();

    const nameExist = await this.checkNameExist(name);
    console.log(nameExist);
    if (nameExist) {
      return 'Event ' + name + ' already exists';
    }

    const resp = await knex(tableName)
      .insert({
        name: name,
        password: password,
        selected: 0,
        created: moment().unix()
      });

    return resp ? resp[0] : 'Unable to add event';
  },
  async edit(id, updates) {
    if (updates) {
      const existing = await knex(tableName)
        .select(['name', 'password'])
        .first('id')
        .where('id', '=', id);

      if (existing) {
        // field verification
        for (key in updates) {
          if (key == 'id' || !(key in existing)) delete updates[key];
        }

        if ('name' in updates) {

        }
      }
    }

    return false;
  }
}
