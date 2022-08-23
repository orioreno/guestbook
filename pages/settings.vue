<template>
  <v-expansion-panels v-model="panel">
    <v-expansion-panel>
      <v-expansion-panel-header>General</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-form
          class="mt-2"
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="saveChanges"
        >
          <v-text-field
            label="Event name *"
            required
            :rules="[v => !!v || 'Event name is required']"
            v-model="event.name"
            class="mb-1"
          ></v-text-field>
          <v-textarea
            label="Scan success message"
            v-model="event.scan_message"
            hint="{column name} will be replaced by column value"
            class="mb-1"
          ></v-textarea>
          <v-btn type="submit" color="primary">Save changes</v-btn>
        </v-form>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header color="error">Deactivate</v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-form
          class="mt-2"
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="deactivate"
        >
          <v-text-field
            label="Enter event name for confirmation"
            required
            :rules="[v => !!v || 'Please enter current event name', v => v == defaultEventName || 'Event name does not match']"
            v-model="deactivationCode"
            class="mb-1"
          ></v-text-field>
          <v-btn type="submit" color="error">Deactivate current event</v-btn>
        </v-form>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  head: {
    title: 'Settings'
  },
  data() {
    return {
      panel: 0,
      valid: false,
      deactivationCode: ""
    }
  },
  methods: {
    saveChanges() {
      this.$store.dispatch('event/updateEvent', this.event);
    },
    deactivate() {
      if (confirm("Are you sure want to delete event " + this.event.name+ "?")) {
        this.$store.dispatch('event/deleteEvent', this.event);
      }
    }
  },
  computed: {
    event() {
      return {...this.$store.state.event.selected};
    },
    defaultEventName() {
      return this.$store.state.event.selected.name;
    }
  }
}
</script>
