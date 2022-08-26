export const state = () => ({
  selected: null,
  list: null
})

export const mutations = {
  setList(state, value) {
    state.list = value;
  },
  setSelected(state, value) {
    state.selected = value;
  },
}

export const actions = {
  async loadEvents(state) {
    const response = await this.$axios.$get('event.php');
    if (response.code == 200) {
      this.commit('event/setList', response.data);
    }
  },

  async changeSelected(state, {_id, password}) {
    if (_id) {
      const response = await this.$axios.$patch('event.php', {_id: _id, password: password});
      return response.code == 200 ? true : response.message;
    }
    return 'Unable to change event';
  },

  async addEvent(state, {name, password}) {
    if (name && password) {
      const response = await this.$axios.$post('event.php', {name: name, password: password});
      return response.code == 200 ? true : response.message;
    }
    return 'Please specify name and password';
  },

  async updateEvent(state, event) {
    if (event._id) {
      const response = await this.$axios.$put('event.php', event);
      return response.code == 200 ? true : response.message;
    }
    return 'No event selected';
  },


  async deleteEvent(state, {_id}) {
    if (_id) {
      const response = await this.$axios.$delete('event.php?_id='+_id);
      return response.code == 200 ? true : response.message;
    }
    return 'No event selected';
  },

  async loadSelected(state) {
    const response = await this.$axios.$get('event.php?selected');
    if (response.code == 200) {
      this.commit('event/setSelected', response.data);
    }
  }
}
