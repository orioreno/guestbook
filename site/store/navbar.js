export const state = () => ({
  drawer: false,
  miniVariant: false,
  snackbar: false,
  snackbarText: '',
  snackbarColor: 'primary',
  snackbarDuration: 3
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
  },
  showSnackbar(state, value) {
    if (typeof value == 'string') {
      state.snackbarText = value;
    } else {
      state.snackbarText = value.text ?? '';
      state.snackbarDuration = value.duration ?? 3;
      state.snackbarColor = value.color ?? 'primary';
    }
    state.snackbar = value;
  },
}
