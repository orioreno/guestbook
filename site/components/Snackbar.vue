<template>
  <div name="snackbars">
    <v-snackbar v-model="show" :color="color" :timeout="timeout">
      <div v-html="text.replace(/(?:\r\n|\r|\n)/g, '<br>')"></div>

      <template v-slot:action="{ attrs }">
        <v-btn dark text v-bind="attrs" @click="show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "snackbar/show") {
        this.text = state.snackbar.text;
        this.color = state.snackbar.color;
        this.timeout = state.snackbar.timeout;
        this.show = true;
      }
    });
  },
  data() {
    return {
      show: false,
      color: "primary",
      text: "",
      timeout: -1,
    };
  },
};
</script>
