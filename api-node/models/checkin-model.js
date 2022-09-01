module.exports = function(selectedEvent) {
  const knex = require('../plugins/knex.js');
  const moment = require('moment');
  const tableName = 'checkin';

  if (!(selectedEvent && 'id' in selectedEvent)) return false;

  return {
    async add(guest_id, manual) {
      const time = moment().unix();
      const insert = await knex(tableName)
        .insert({
          event_id: selectedEvent.id,
          guest_id: guest_id,
          time: time,
          manual: manual ? 1 : 0
        });
      if (insert) return time;
      return false;
    }
  }
}
