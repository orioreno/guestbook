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
  async loadGuests(state) {
    const response = await this.$axios.$get('guest.php');
    if (response.code == 200) {

      let columns = [];

      for (let col in response.data.columns) {
        columns.push({
          value: col,
          text: response.data.columns[col]
        });
      }

      this.commit('guest/setList', response.data.rows);
      this.commit('guest/setColumns', columns);
    }
  },

  async importGuests(state, guests) {
    if (guests.length > 0) {
      const response = await this.$axios.$put('guest.php', guests);
      return response.code == 200 ? true : response.message;
    }
    return 'Please specify guest';
  },

  async addGuest(state, guest) {
    const response = await this.$axios.post('guest.php', guest);
    return response.data.code == 200 ? true : response.data.message;
  },

  async editGuest(state, guest) {
    if (guest._id) {
      const response = await this.$axios.patch('guest.php', guest);
      return response.data.code == 200 ? true : response.data.message;
    }
    return 'Please select a guest';
  },

  async deleteGuest(state, {_id}) {
    if (_id) {
      const response = await this.$axios.delete('guest.php?id='+_id);
      return response.data.code == 200 ? true : response.data.message;
    }
  },

  async cloneGuests(state, cloneEventId, regenerate) {
    const response = await this.$axios.put('guest.php', {cloneEventId: cloneEventId, regenerate: regenerate});
    return response.data.code == 200 ? true : response.data.message;
  },

  async checkIn(state, {checkin_code, manual}) {
    const response = await this.$axios.post('checkin.php', {_checkin_code: checkin_code, manual: manual ?? false});
    return {
      success: response.data.code == 200,
      data: response.data.code == 200 ? response.data.data : response.data.message
    };
  },

}
