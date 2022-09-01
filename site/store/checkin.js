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
  async load(state) {

  },

  async submit(state, {checkin_code, manual}) {
    const response = await this.$axios.$post('checkin', {checkin_code: checkin_code, manual: manual ?? false});
    return {
      success: response.code == 200,
      data: {
        message: response.code == 200 ? response.data.message : response.message,
        time: response.code == 200 ? response.data.time : null
      }
    };
  },

  // CONFIG
  async loadConfig(state) {
    const response = await this.$axios.$get('checkin/config');
    if (response.code == 200) this.commit('checkin/setConfig', response.data ?? {});
  },

  async saveConfig(state, config) {
    const response = await this.$axios.$post('checkin/config', config);
    return response.code == 200 ? true : response.message;
  }
}
