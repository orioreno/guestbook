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
        v-model="addEventValid"
        lazy-validation
        @submit.prevent="$store.dispatch('event/addEvent', addEventName)"
      >
        <v-card-title>
          New event
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Event name"
            required
            :rules="[v => !!v || 'Event name is required']"
            v-model="addEventName"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            :disabled="!addEventValid"
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
      addEventValid: false,
      addEventName: '',
    }
  },
  methods: {
    validate () {
      this.$refs.form.validate()
    },
  }
}
</script>
