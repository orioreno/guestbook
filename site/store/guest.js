export const state = () => ({
  list: [],
  columns: []
})

export const mutations = {
  setList(state, value) {
    state.list = value;
  },
  setColumns(state, value) {
    state.columns = value;
  }
}

export const actions = {
  async load(state) {
    const response = await this.$axios.$get('guest');
    if (response.code == 200) {

      const columns = [];
      const exceptions = ['id', 'created', 'modified'];
      for (const row of response.data) {
        for (const col in row) {
          if (!exceptions.includes(col) && !columns.includes(col)) columns.push(col);
        }
      }

      this.commit('guest/setList', response.data);
      this.commit('guest/setColumns', columns.map(function(col) {
        return {
          value: col,
          text: col.replace('_', ' ').toUpperCase()
        }
      }));
    }
  },

  async import(state, guests) {
    if (guests.length > 0) {
      const response = await this.$axios.$put('guest', guests);
      if (response.code == 200) {
        const errors = [];
        for (const row of response.data) {
          if (typeof row == 'string') errors.push(row);
        }
        return errors.length > 0 ? errors.join("\r\n") : true;
      }
      return response.message;
    }
    return 'Please specify guest';
  },

  async add(state, guest) {
    const response = await this.$axios.$post('guest', guest);
    return response.code == 200 ? true : response.message;
  },

  async edit(state, guest) {
    if (guest.id) {
      const response = await this.$axios.$patch('guest/'+guest.id, guest);
      return response.code == 200 ? true : response.message;
    }
    return 'Please select a guest';
  },

  async delete(state, id) {
    if (id) {
      const response = await this.$axios.$delete('guest/'+id);
      return response.code == 200 ? true : response.message;
    }
  },

  async clone(state, cloneEventId) {
    const response = await this.$axios.$put('guest/clone/'+cloneEventId);
    if (response.code == 200) {
      const errors = [];
      for (const row of response.data) {
        if (typeof row == 'string') errors.push(row);
      }
      return errors.length > 0 ? errors.join("\r\n") : true;
    }
    return response.message;
  },

  async checkIn(state, {checkin_code, manual}) {
    const response = await this.$axios.$post('checkin.php', {_checkin_code: checkin_code, manual: manual ?? false});
    return {
      success: response.data.code == 200,
      data: response.data.code == 200 ? response.data.data : response.data.message
    };
  },

}
