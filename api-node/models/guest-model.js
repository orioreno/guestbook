module.exports = function(selectedEvent) {
  const knex = require('../plugins/knex.js');
  const moment = require('moment');
  const tableName = 'guest';

  if (!(selectedEvent && 'id' in selectedEvent)) return false;

  function generateCheckinCode() {
    let result = '';
    const length = 6;
    const characters = '123456789ABCDEFGHJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  function reformatInput(name, additional) {
    checkinCode = additional.checkin_code ?? generateCheckinCode();
    keyTobeRemoved = ['id', 'name', 'checkin_code', 'created', 'modified'];
    for (key in additional) {
      if (keyTobeRemoved.includes(key)) {
        delete additional[key];
      }
    }

    return {
      name: name,
      checkin_code: checkinCode,
      misc: JSON.stringify(additional)
    }
  }

  function reformatRow(row) {
    if (row) {
      let miscObj = {};
      if ('misc' in row) {
        miscObj = JSON.parse(row.misc);
        delete row.misc;
      }

      return {
        ...row,
        ...miscObj
      }
    }
    return row;
  }

  return {
    async getRow(id) {
      let row = await knex(tableName)
        .first(['id', 'name', 'checkin_code', 'misc', 'created', 'modified'])
        .where('id', '=', id)
        .andWhere('event_id', '=', selectedEvent.id);

      return reformatRow(row);
    },

    async getData() {
      let data = await knex(tableName)
        .select(['id', 'name', 'checkin_code', 'misc', 'created', 'modified'])
        .orderBy(id, 'asc')
        .where('event_id', '=', selectedEvent.id);

      for (let row of data) {
        row = reformatRow(row);
      }

      return data;
    },

    async add(name, additional) {
      let row = reformatInput(name, additional);
      row.event_id = selectedEvent.id;
      row.created = moment().unix();

      const insert = await knex(tableName)
        .insert(row);

      if (insert) {
        return insert[0];
      }

      return 'Unable to add guest';
    },

    async edit(id, data) {
      if (data) {
        const existing = await this.getRow(id);
        if (existing) {
          data = reformatInput(data.name ?? existing.name, data);
          data.modified = moment().unix();

          const update = await knex(tableName)
            .where('id', '=', id)
            .update(data);

          return update ? true : 'Unable to edit guest';
        }
      }
      return false;
    },

    async delete(id) {
      const existing = await this.getRow(id);

      if (existing) {
        await knex(tableName)
          .where('id', id)
          .del();

        await knex('checkin')
          .where('guest_id', id)
          .del();

        return true;
      }

      return false;
    },
  }

}
