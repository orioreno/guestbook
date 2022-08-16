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
        <div class="ml-5 mt-3 mt-sm-0 text-sm-left">
          <div>
            <span class="display-3 mr-1">{{ checkinTotal }}</span>
            <span class="display-1">of {{ guests.length }}</span>
          </div>
          <div>guest(s) have checked in</div>
        </div>

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
        sort-by="_checkin_time"
        :sort-desc="true"
        :multi-sort="true"
        loading-text="Loading data"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="manualCheckIn(item)"
            title="Manual check in"
            v-if="!item._checkin_time"
          >
            mdi-account-check
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  head: {
    title: 'Dashboard'
  },
  data () {
    return {
      loading: false,
      search: '',
    }
  },
  methods: {
    loadGuests() {
      this.$store.dispatch('guest/loadGuests');
    },
    async manualCheckIn(guest) {
      if (confirm("Manual check in for " + guest.name + " (" + guest._checkin_code + "). Proceed?")) {
        await this.$store.dispatch('guest/checkIn', guest._checkin_code);
        this.loadGuests();
      }
    }
  },
  created() {
    this.loadGuests();
    setInterval(() => this.loadGuests(), 5000);
  },
  computed: {
    guests() {
      return this.$store.state.guest.list;
    },
    headers() {
      var columns = [...this.$store.state.guest.columns];
      columns.push({
        text: 'Check In Code',
        value: '_checkin_code'
      });
      columns.push({
        text: 'Check In Time',
        value: '_checkin_time'
      });
      columns.push({
        text: 'Actions',
        value: 'actions',
        sortable: false
      });
      return columns;
    },
    checkinTotal() {
      const total = this.guests.reduce((total, row) => {
        if (row._checkin_time) total++
        return total;
      }, 0);
      return total;
    },
    checkinPercent() {
      return this.guests.length > 0 ? Math.floor((this.checkinTotal / this.guests.length) * 100) : 0;
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
