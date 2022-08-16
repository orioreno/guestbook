export const state = () => ({
  selected: null,
  list: []
})

export const mutations = {
  setList(state, value) {
    state.list = value;
  },
  setSelected(state, value) {
    state.selected = value;
  }
}

export const actions = {
  async loadEvents(state) {
    var response = await this.$axios.$get('event.php');
    if (response.code == 200) {
      this.commit('event/setList', response.data);
      response.data.forEach((row) => {
        if (row.selected) {
          this.commit('event/setSelected', row);
          this.commit('navbar/setTitle', row.name);
        }
      })
    }
  },

  async changeSelected(state, {_id}) {
    if (_id) {
      var response = await this.$axios.$patch('event.php', {id: _id});
      if (response.code == 200) {
        window.location.reload(true);
      } else {
        alert(response.message);
      }
    }
  },

  async addEvent(state, name) {
    if (name) {
      var response = await this.$axios.$post('event.php', {name: name});
      if (response.code == 200) {
        window.location.reload(true);
      } else {
        alert(response.message);
      }
    }
  },

  async updateEvent(state, event) {
    if (event._id) {
      var response = await this.$axios.$put('event.php', event);
      if (response.code == 200) {
        window.location.reload(true);
      } else {
        alert(response.message);
      }
    } else {
      alert('No event selected');
    }
  },


  async deleteEvent(state, {_id}) {
    if (_id) {
      var response = await this.$axios.$delete('event.php?id='+_id);
      if (response.code == 200) {
        window.location.reload(true);
      } else {
        alert(response.message);
      }
    } else {
      alert('No event selected');
    }
  }
}
