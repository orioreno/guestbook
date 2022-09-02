export const state = () => ({
  config: null,
  list: null
})

export const mutations = {
  setList(state, value) {
    state.list = value;
  },
  setConfig(state, value) {
    state.config = value;
  }
}

export const actions = {
  load(state) {
    this.$axios.$get('checkin')
      .then((res) => {
        this.commit('checkin/setList', res);
      });
  },

  submit(state, {checkin_code, manual}) {
    let value = {
      success: false,
      data: {
        message: '',
        time:0
      }
    }
    this.$axios.$post('checkin', {checkin_code: checkin_code, manual: manual ?? false})
      .then((res) => {
        value.success = true;
        value.data.message = res.message;
        value.data.time = res.time;
      })
      .catch((err) => {
        value.message = err.response.data;
      })
      .then(() => {
        value.data.message = value.data.message.replace(/(?:\r\n|\r|\n)/g, '<br>');
        return value;
      });
  },

  byGuest(state, guestId) {
    this.$axios.$get('checkin/'+guestId)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return {};
      });
  },

  // CONFIG
  loadConfig(state) {
    this.$axios.$get('checkin/config')
      .then((res) => {

        if (!res.font_color) res.font_color = {r:255, g:255, b:255, a:1};
        if (!res.box_input_color) res.box_input_color = {r:255, g:255, b:255, a:1};
        if (!res.text_input_color) res.text_input_color = {r:0, g:0, b:0, a:1};
        if (!res.success_overlay_color) res.success_overlay_color = {r:76, g:175, b:80, a:0.7};
        if (!res.failed_overlay_color) res.failed_overlay_color = {r:244, g:67, b:54, a:0.7};

        this.commit('checkin/setConfig', res);
      });
  }
}
