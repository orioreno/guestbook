export const state = () => ({
  list: [],
  columns: []
})

export const mutations = {
  setList(state, value) {
    state.list = value;
  },
  setColumns(state, value) {
    state.columns = value;
  }
}

export const actions = {
  async loadGuests(state) {
    var response = await this.$axios.$get('guest.php');
    if (response.code == 200) {

      let columns = [];

      for (let col in response.data.columns) {
        columns.push({
          value: col,
          text: response.data.columns[col]
        });
      }

      this.commit('guest/setList', response.data.rows);
      this.commit('guest/setColumns', columns);
    }
  },

  async importGuests(state, guests) {
    if (guests.length > 0) {
      var response = await this.$axios.$put('guest.php', guests);
      if (response.code == 200) {
        return true;
      } else {
        alert(response.message);
      }
    }
  },

  async addGuest(state, guest) {
    var response = await this.$axios.post('guest.php', guest);
    if (response.data.code == 200) {
      return true;
    } else {
      alert(response.message);
    }
  },

  async editGuest(state, guest) {
    if (guest._id) {
      var response = await this.$axios.patch('guest.php', guest);
      if (response.data.code == 200) {
        return true;
      } else {
        alert(response.data.message);
      }
    }
  },

  async deleteGuest(state, {_id}) {
    if (_id) {
      var response = await this.$axios.delete('guest.php?id='+_id);
      if (response.data.code == 200) {
        return true;
      } else {
        alert(response.data.message);
      }
    }
  },

  async cloneGuests(state, param) {
    var response = await this.$axios.$post('clone_guest.php', param);
    if (response.code == 200) {
      return true;
    } else {
      alert(response.message);
    }
  },

  async checkIn(state, code) {
    var response = await this.$axios.post('checkin.php', {code: code});
    console.log(response);
    if (response.data.code == 200) {
      return true;
    } else {
      alert(response.data.message);
    }
  }

}
