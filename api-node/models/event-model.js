var knex = require('../plugins/knex.js');
var moment = require('moment');
const tableName = 'event';

module.exports = {
  async getRow(id) {
    const row = await knex(tableName)
      .first(['id', 'name', 'created', 'modified'])
      .where('id', '=', id);
    return row;
  },

  async getSelected() {
    const row = await knex(tableName)
      .first(['id', 'name', 'created', 'modified'])
      .where('selected', '=', 1);
    return row;
  },

  async add(name, password) {
    name = name.trim();

    const existingName = await knex(tableName).first('id').where('name', '=', name);
    if (existingName) return 'Event ' + name + ' already exists';

    const insert = await knex(tableName)
      .insert({
        name: name,
        password: password,
        selected: 0,
        created: moment().unix()
      });

    return insert ? insert[0] : 'Unable to add event';
  },

  async edit(id, data) {
    if (data) {
      const existing = await knex(tableName)
        .select(['name', 'password'])
        .first('id')
        .where('id', '=', id);

      if (existing) {
        // field verification
        for (key in data) {
          if (key == 'id' || !(key in existing)) delete data[key];
        }

        // check name
        if ('name' in data) {
          data.name = data.name.trim();

          const existingName = await knex(tableName).first('id').where('name', '=', data.name).andWhere('id', '<>', id);
          if (existingName) return 'Event ' + data.name + ' already exists';
        }

        // fill modified field
        data.modified = moment().unix();

        const update = await knex(tableName)
          .where('id', '=', id)
          .update(data);

        return update ? true : 'Unable to edit event';
      }
    }

    return false;
  },

  async delete(id) {
    const existing = await knex(tableName)
      .select(['name', 'password'])
      .first('id')
      .where('id', '=', id);

    if (existing) {
      knex(tableName)
        .where('id', id)
        .del();

      knex('checkin_config')
        .where('event_id', id)
        .del();

      knex('guest')
        .where('event_id', id)
        .del();

      knex('checkin')
        .where('event_id', id)
        .del();

      return true;
    }

    return false;
  }
}
