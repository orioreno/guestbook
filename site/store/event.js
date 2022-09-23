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
  load(state) {
    this.$axios.$get('event')
      .then((response) => {
        this.commit('event/setList', response);
      })
    this.dispatch('event/loadSelected');
  },
  loadSelected(state) {
    this.$axios.$get('event/selected')
      .then((response) => {
        this.commit('event/setSelected', response);
      })
  },
  createCookie(state, {id, password}) {
    const sha256 = require('crypto-js/sha256');
    const cookie = {
      'id': id,
      'pwd': btoa(sha256(password))
    };
    document.cookie = "evtData=" + JSON.stringify(cookie) + "; expires=" + this.$moment().add(1, 'hour').format('Y-MM-DD HH:mm:ss')+ "; path=/";
  },
}
