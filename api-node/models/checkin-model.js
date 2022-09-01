module.exports = function(selectedEvent) {
  const knex = require('../plugins/knex.js');
  const moment = require('moment');
  const tableName = 'checkin_config';
  const convert = {
    'font_color': 'json',
    'box_input_color': 'json',
    'text_input_color': 'json',
    'success_overlay_color': 'json',
    'failed_overlay_color': 'json',
    'background_image': 'blob',
    'success_audio': 'blob',
    'failed_audio': 'blob'
  };

  if (!(selectedEvent && 'id' in selectedEvent)) return false;

  return {
    async getConfig() {
      let row = await knex(tableName)
        .first()
        .where('event_id', '=', selectedEvent.id);

      if (row) {
        for (key in convert) {
          if (row[key]) {
            if (convert[key] == 'json') {
              try {
                const parsed = JSON.parse(row[key]);
                row[key] = parsed;
              } catch (e) {
              }
            } else if (convert[key] == 'blob') {
              row[key] = atob(row[key]);
            }
          }
        }
      }

      return row;
    },

    async saveConfig(input) {
      const columns = await knex(tableName).columnInfo();

      const exception = ['event_id', 'created', 'modified'];
      for (key in input) {
        if (!columns[key] || exception.includes(key)) delete input[key];
      }

      for (key in convert) {
        if (input[key]) {
          if (convert[key] == 'json') {
            input[key] = JSON.stringify(input[key]);
          } else if (convert[key] == 'blob') {
            input[key] = btoa(input[key]);
          }
        }
      }

      const existing = await this.getConfig();
      if (existing) {
        input.modified = moment().unix();
        const update = await knex(tableName)
          .where('event_id', '=', selectedEvent.id)
          .update(input);
        if (update) return true;
      } else {
        input.event_id = selectedEvent.id;
        input.created = moment().unix();
        const insert = await knex(tableName)
          .insert(input);
        if (insert) return true;
      }
      return false;
    }
  }

}
