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
    this.$axios.$get('event/selected')
      .then((response) => {
        this.commit('event/setSelected', response);
      })
  }
}
