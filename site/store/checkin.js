export const state = () => ({
  config: null,
  list: null
})

export const mutations = {
  setConfig(state, value) {
    state.config = value;
  },
  setList(state, value) {
    state.list = value;
  },
}

export const actions = {
  async loadConfig(state) {
    const response = await this.$axios.$get('checkin/config');
    if (response.code == 200) this.commit('checkin/setConfig', response.data ?? {});
  },

  async saveConfig(state, config) {
    const response = await this.$axios.$post('checkin/config', config);
    return response.code == 200 ? true : response.message;
  }
}
