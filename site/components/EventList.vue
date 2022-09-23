<template>
  <div>
    <div class="mx-auto" style="max-width:400px" v-if="events !== null">
      <div v-if="events.length > 0">
        <v-list class="mb-3">
          <v-subheader>Select an event</v-subheader>
          <v-list-item
            v-for="(event, idx) in events"
            :key="idx"
            :input-value="event.selected"
            :title="event.selected ? 'Current event' : 'Change to ' + event.name"
            @click.stop="passwordDialog = true; changeTo = event"
          >
            <v-list-item-title>
              {{ event.name }}
            </v-list-item-title>
            <v-spacer></v-spacer>
            <v-icon v-if="event.selected">mdi-check</v-icon>
          </v-list-item>

          <v-divider class="mt-2"></v-divider>
          <v-list-item class="mt-2">
            <CreateEventDialog :persistent="events !== null" />
          </v-list-item>
        </v-list>
      </div>
      <CreateEventDialog :persistent="true" :show="true" v-else></CreateEventDialog>
    </div>

    <v-dialog
      v-model="passwordDialog"
      max-width="400"
    >
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="changeEvent"
        >
          <v-card-title>
            Enter event password
          </v-card-title>
          <v-card-subtitle>
            {{ changeTo.name }}
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="password"
              required
              class="mb-5"
              :rules="[v => !!v || (passwordError ?? 'Password is required')]"
              @keyup="passwordError = null"
              :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
              :type="passwordVisible ? 'text' : 'password'"
              label="Password"
              @click:append="passwordVisible = !passwordVisible"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :disabled="!valid"
              type="submit"
            >
              Change event
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "EventListComponents",
  props: {
    loadEventOnMounted: {type: Boolean, default: false}
  },
  data() {
    return {
      passwordDialog: false,
      changeTo: {},
      password: '',
      valid: false,
      passwordVisible: false,
      passwordError: null,
    }
  },
  methods: {
    changeEvent() {
      this.$axios.$post('event/verify/'+this.changeTo.id, {password: this.password})
        .then((res) => {
          this.$axios.$patch('/event/select/'+this.changeTo.id)
            .then((res) => {
              this.$store.commit("snackbar/show", {text: "Event changed to " + res.name + "!"});
              this.$store.dispatch('event/createCookie', {id: this.changeTo.id, password: this.password});
              window.location.reload(true);
            })
            .catch((err) => {
              this.$store.commit("snackbar/show", {text: "Failed to change event", color: 'error'});
            })
        })
        .catch((err) => {
          this.password = '';
          this.passwordError = err.response.status == 401 ? 'Password does not match' : err.response.data;
        });
    }
  },
  computed: {
    events() {
      return this.$store.state.event.list;
    },
  },
}
</script>
