export const state = () => ({
  drawer: false,
  miniVariant: false,
})

export const mutations = {
  toggleDrawer(state, value) {
    state.drawer = value ?? !state.drawer;
    if (!value) this.commit('navbar/saveLocalSettings');
  },
  toggleMiniVariant(state, value) {
    state.miniVariant = value ?? !state.miniVariant;
    if (!value) this.commit('navbar/saveLocalSettings');
  },
  saveLocalSettings(state) {
    var jsonData = {
      drawer: state.drawer,
      miniVariant: state.miniVariant
    };
    localStorage.setItem("navbar", JSON.stringify(jsonData));
  },
  loadLocalSettings(state) {
    if (process.browser){
      var settings = JSON.parse(localStorage.getItem("navbar"));
      if (settings) {
        if (settings.drawer) state.drawer = settings.drawer;
        if (settings.miniVariant) state.miniVariant = settings.miniVariant;
      }
    }
  }
}
