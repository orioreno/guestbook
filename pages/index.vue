<template>
  <div>
    <v-card class="mb-3">
      <v-card-text class="text-sm">
        <small>Last update: {{ last_update }} (data automatically reloaded every {{ refresh_rate }} second{{ refresh_rate > 1 ? 's' : '' }})</small>
      </v-card-text>
    </v-card>
    <div class="row">
      <div class="col-md-6">
        <v-card class="mb-3">
          <v-card-title class="d-block text-center">Check In Progress</v-card-title>
          <v-card-subtitle class="text-center">
            {{ totalCheckin }} of {{ guests.length }} guest(s) have checked in
          </v-card-subtitle>
          <v-card-text class="py-8 text-center">
            <v-progress-circular
                :rotate="-90"
                :size="270"
                :width="50"
                :value="checkinPercent"
                :color="progressColor"
              >
              {{ checkinPercent.toFixed(2) }}%
            </v-progress-circular>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mb-3">
          <v-card-title class="d-block text-center">10 Latest Check In</v-card-title>
          <v-card-text>
            <v-simple-table
              fixed-header
              height="340px"
            >
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Time
                    </th>
                    <th class="text-left">
                      Name
                    </th>
                    <th class="text-left">
                      Check In Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in checkin_log.slice(0,10)"
                    :key="item._id"
                  >
                    <td>{{ $moment.unix(item.time).format('Y-MM-DD HH:mm:ss') }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.checkin_code }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <v-card class="mb-3">
      <v-card-title class="text-center">
        Not checked in yet
      </v-card-title>
      <v-card-subtitle>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-subtitle>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="guests.filter((val) => { return !val._checkin_time})"
          :search="search"
          :loading="loading"
          sort-by="_checkin_time"
          :sort-desc="true"
          loading-text="Loading data"
        >
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-card class="mb-3">
      <v-card-title class="text-center">
        Have checked in
      </v-card-title>
      <v-card-subtitle>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-subtitle>
      <v-card-text>
        <v-data-table
          :headers="headersCheckIn"
          :items="guests.filter((val) => { return val._checkin_time})"
          :search="search"
          :loading="loading"
          sort-by="_checkin_time"
          :sort-desc="true"
          loading-text="Loading data"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="showHistory(item)"
              title="Show check in history"
            >
              mdi-history
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="historyDialog"
      :eager="true"
      max-width="400"
    >
      <v-card>
        <v-card-title>
          {{ historyData.name }}
        </v-card-title>
        <v-card-subtitle>
          {{ historyData._checkin_code }}
        </v-card-subtitle>
        <v-card-text>
          <v-simple-table
              fixed-header
            >
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Time
                    </th>
                    <th class="text-left">
                      Manual Check In
                    </th>
                  </tr>
                </thead>
                <tbody v-if="historyData._checkin_log">
                  <tr
                    v-for="item in historyData._checkin_log"
                    :key="item._id"
                  >
                    <td>{{ $moment.unix(item.time).format('Y-MM-DD HH:mm:ss') }}</td>
                    <td><v-icon v-if="item.manual">mdi-check-circle</v-icon></td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  name: "IndexPage",
  head: {
    title: "Dashboard"
  },
  data() {
    return {
      loading: false,
      search: "",
      last_update: null,
      refresh_rate: 5,
      historyDialog: false,
      historyData: {}
    };
  },
  methods: {
    async loadGuests() {
      await this.$store.dispatch("guest/loadGuests");
      this.last_update = this.$moment().format("Y-MM-DD HH:mm:ss");
    },
    async manualCheckIn(guest) {
      if (confirm("Manual check in for " + guest.name + " (" + guest._checkin_code + "). Proceed?")) {
          let checkin = await this.$store.dispatch("guest/checkIn", { checkin_code: guest._checkin_code, manual: true });
          console.log(checkin);
          if (checkin.success !== true) {
              alert(checkin.message);
          }
          this.loadGuests();
      }
    },
    showHistory(item) {
      this.historyDialog = true;
      this.historyData = item;
    }
  },
  created() {
    this.loadGuests();
    setInterval(() => this.loadGuests(), this.refresh_rate * 1000);
  },
  computed: {
    guests() {
      var data = this.$store.state.guest.list;
      for (let row of data) {
        if (row._checkin_log) {
          row._checkin_time = this.$moment.unix(row._checkin_log[0].time).format("Y-MM-DD HH:mm:ss");
        }
      }
      return data;
    },
    totalCheckin() {
      return this.guests.reduce((total, row) => {
        if (row._checkin_time)
          total++;
        return total;
      }, 0);
    },
    checkinPercent() {
      return this.guests.length > 0 ? (this.totalCheckin / this.guests.length) * 100 : 0;
    },
    checkin_log() {
      var data = [];
      for (let row of this.guests) {
        if (row._checkin_log) {
          for (let checkin of row._checkin_log) {
            data.push({
              "time": checkin.time,
              "manual": checkin.manual,
              "name": row.name,
              "checkin_code": row._checkin_code
            });
          }
        }
      }
      data.sort((a, b) => {
        return b.time - a.time;
      });
      return data;
    },
    progressColor() {
      if (this.checkinPercent > 80) {
        return "green";
      }
      else if (this.checkinPercent > 60) {
        return "blue";
      }
      else if (this.checkinPercent > 30) {
        return "orange";
      }
      else if (this.checkinPercent == 0) {
        return "grey";
      }
      else {
        return "red";
      }
    },
    headers() {
      var columns = [...this.$store.state.guest.columns];
      columns.push({
        text: "Check In Code",
        value: "_checkin_code"
      });
      return columns;
    },
    headersCheckIn() {
      let columns = [...this.headers];
      columns.push({
        text: "Last Check In Time",
        value: "_checkin_time"
      });
      columns.push({
        text: "Actions",
        value: "actions",
        sortable: false
      });
      return columns;
    },
  },
}
</script>
