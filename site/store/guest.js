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
  load(state) {
    this.$axios.$get('guest')
      .then((res) => {
        const columns = [];
        const exceptions = ['id', 'created', 'modified'];
        for (const row of res) {
          for (const col in row) {
            if (!exceptions.includes(col) && !columns.includes(col)) columns.push(col);
          }
        }

        this.commit('guest/setList', res);
        this.commit('guest/setColumns', columns.map(function(col) {
          return {
            value: col,
            text: col.replace('_', ' ').toUpperCase()
          }
        }));
      })
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
