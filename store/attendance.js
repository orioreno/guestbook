export const state = () => ({
  list: []
})

export const mutations = {
  setList(state, value) {
    state.list = value;
  },
}

export const actions = {
  async loadAttendances(state) {
    const response = await this.$axios.$get('attendance.php');
    if (response.code == 200) {
      this.commit('attendance/setList', response.data);
    }
  },
  async checkIn(state, {checkin_code, manual}) {
    console.log(manual);
    const response = await this.$axios.post('attendance.php', {_checkin_code: checkin_code, manual: manual ?? false});
    return {
      success: response.data.code == 200,
      message: response.data.code == 200 ? response.data.data : response.message
    };
  },

}
