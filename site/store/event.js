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
  async load(state) {
    const response = await this.$axios.$get('event');
    if (response.code == 200) {
      this.commit('event/setList', response.data);
    }
  },

  async select(state, {id, password}) {
    if (id) {
      const verified = await this.dispatch('event/verifyPassword', {id: id, password: password});
      if (verified) {
        const response = await this.$axios.$patch('event/select/'+id);
        return response.code == 200 ? true : response.message;
      }
      return 'Invalid password';
    }
    return 'Unable to change event';
  },

  async add(state, {name, password}) {
    if (name && password) {
      const response = await this.$axios.$post('event', {name: name, password: password});
      return response.code == 200 ? true : response.message;
    }
    return 'Please specify name and password';
  },

  async update(state, data) {
    const response = await this.$axios.$patch('event', data);
    return response.code == 200 ? true : response.message;
  },


  async delete(state) {
    const response = await this.$axios.$delete('event');
    return response.code == 200 ? true : response.message;
  },

  async selected(state) {
    const response = await this.$axios.$get('event/selected');
    if (response.code == 200) {
      this.commit('event/setSelected', response.data);
    }
  },

  async verifyPassword(state, {id, password}) {
    const response = await this.$axios.$post(id ? 'event/verify/'+id : 'event/selected/verify', {password: password});
    return response.code == 200;
  }
}
