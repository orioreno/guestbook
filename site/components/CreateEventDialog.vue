<template>
  <v-dialog
    v-model="addEventDialog"
    max-width="400"
    :persistent="persistent"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        color="primary"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon>mdi-plus</v-icon>
        Add new event
      </v-btn>
    </template>
    <v-card>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="save"
      >
        <v-card-title>
          New event
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Event name"
            required
            class="mb-5"
            :rules="[v => !!v || 'Event name is required']"
            v-model="name"
          ></v-text-field>
          <v-text-field
            v-model="password"
            required
            class="mb-5"
            :rules="[v => !!v || 'Password is required']"
            :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
            :type="passwordVisible ? 'text' : 'password'"
            label="Password *"
            hint="Authentication to open guest and setting page"
            @click:append="passwordVisible = !passwordVisible"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            :disabled="!valid"
            type="submit"
          >
            Create Event
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CreateEventDialog',
  props: {
    persistent: {type: Boolean, default: false},
    show: {type: Boolean, default: false}
  },
  data () {
    return {
      addEventDialog: this.show,
      valid: false,
      name: '',
      password: '',
      passwordVisible: false
    }
  },
  methods: {
    async save() {
      this.$axios.$post('event', {name: this.name, password: this.password})
        .then((resp) => {
          this.$store.commit("snackbar/show", {text: 'New event ' + this.name + ' created!'});
          this.$store.dispatch('event/createCookie', {id: resp.id, password: this.password});
          window.location.reload(true);
        })
        .catch((err) => {
          this.$store.commit("snackbar/show", {text: err, color: 'error'});
        });
    }
  }
}
</script>
