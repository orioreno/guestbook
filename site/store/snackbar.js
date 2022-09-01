export const state = () => ({
  text: "",
  color: "primary",
  timeout: 3,
})

export const mutations = {
  show(state, payload) {
    state.text = payload.text;
    state.color = payload.color ?? "primary";
    state.timeout = payload.timeout ?? 3000;
  },
}

export const actions = {
  show({ commit }, payload) {
    commit("show", payload);
  },
}
