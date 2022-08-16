<template>
  <div>
    <v-card class="mb-3 d-sm-flex text-center justify-center align-center px-7 py-7" flat tile>
        <v-progress-circular
            :rotate="-90"
            :size="150"
            :width="30"
            :value="checkinPercent"
            :color="progressColor"
          >
          {{ checkinPercent }}%
        </v-progress-circular>
        <h2 class="ml-5 mt-3 mt-sm-0 display-1">
          {{ checkinTotal }} guests have checked in
        </h2>
    </v-card>
    <v-card>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="guests"
        :search="search"
        :loading="loading"
        :multi-sort="true"
        loading-text="Loading data"
      ></v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data () {
    return {
      loading: false,
      search: '',
    }
  },
  computed: {
    guests() {
      return this.$store.state.guest.list;
    },
    headers() {
      return this.$store.state.guest.columns;
    },
    checkinTotal() {
      const total = this.guests.reduce((total, row) => { if (row.selected) total++ }, 0);
      return isNaN(total) ? 0 : total;
    },
    checkinPercent() {
      return this.guests.length > 0 ? Math.floor(this.checkinTotal / this.guests.length) : 0;
    },
    progressColor() {
      if (this.checkinPercent > 80) {
        return "green";
      } else if (this.checkinPercent > 60) {
        return "blue";
      } else if (this.checkinPercent > 30) {
        return "orange";
      } else if (this.checkinPercent == 0) {
        return "grey";
      } else {
        return "red";
      }
    }
  }
}
</script>
