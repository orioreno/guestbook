export const state = () => ({
  selected: null,
  list: []
})

export const mutations = {
  setList(state, value) {
    state.list = value;
  },
  setSelected(state, value) {
    state.selected = value;
  }
}

export const actions = {
  async loadEvents(state) {
    const response = await this.$axios.$get('event.php');
    if (response.code == 200) {
      this.commit('event/setList', response.data);
      response.data.forEach((row, index) => {
        if (row.selected) {
          row.index = index;
          this.commit('event/setSelected', row);
          this.commit('navbar/setTitle', row.name);
        }
      })
    }
  },

  async changeSelected(state, {_id}) {
    if (_id) {
      const response = await this.$axios.$patch('event.php', {id: _id});
      return response.code == 200 ? true : response.message;
    }
    return 'Unable to change event';
  },

  async addEvent(state, name) {
    if (name) {
      const response = await this.$axios.$post('event.php', {name: name});
      return response.code == 200 ? true : response.message;
    }
    return 'Please specify name';
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
      const response = await this.$axios.$delete('event.php?id='+_id);
      return response.code == 200 ? true : response.message;
    }
    return 'No event selected';
  }
}
