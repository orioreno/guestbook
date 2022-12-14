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
      <v-card-title class="text-center d-block">
        Check In Frequencies
      </v-card-title>
      <v-card-text>
          <v-sparkline
            :labels="sparklineData.labels"
            :value="sparklineData.values"
            label-size="2.2"
            color="white"
            :gradient="['#F44336', '#3F51B5']"
            gradient-direction="left"
            show-labels
            padding="10"
            smooth="15"
            fill
          ></v-sparkline>
      </v-card-text>
    </v-card>
    <v-card class="mb-3">
      <v-card-title class="text-center d-block">
        Guest list
      </v-card-title>
      <v-card-subtitle>
        <div class="row">
          <div class="col-md-6">
            <v-select
              :items="[{'value' : 'all', 'text': 'Show all'}, {'value' : 'attended', 'text': 'Attended'}, {'value' : 'unattended', 'text': 'Unattended'}]"
              item-text="text"
              item-value="value"
              v-model="guestFilter"
              label="Attendance status"
              outlined
            ></v-select>
          </div>
          <div class="col-md-6">
            <v-text-field
              v-model="searchGuest"
              append-icon="mdi-magnify"
              label="Search"
              outlined
            ></v-text-field>
          </div>
        </div>
      </v-card-subtitle>
      <v-card-text>
        <v-data-table
          :headers="headersGuests"
          :items="filteredGuests"
          :search="searchGuest"
          :loading="loading"
          sort-by="name"
          loading-text="Loading data"
        >
          <template v-slot:item.actions="{ item }">
            <v-btn
              small
              @click="showHistory(item)"
            >
              <v-icon
                left
              >
                mdi-history
              </v-icon>
              Check in history
            </v-btn>
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
          {{ historyData.checkin_code }}
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
              <tbody v-if="historyData.checkin_history">
                <tr
                  v-for="item in historyData.checkin_history"
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

<style>
</style>

<script>
export default {
  name: "DashboardPage",
  head: {
    title: "Dashboard"
  },
  data() {
    return {
      loading: false,
      searchGuest: "",
      guestFilter: "all",
      searchCheckedIn: "",
      searchNotCheckedIn: "",
      last_update: null,
      refresh_rate: 5,
      historyDialog: false,
      historyData: {},
      loadTimer: null
    };
  },
  methods: {
    loadData() {
      this.$store.dispatch("guest/load");
      this.$store.dispatch("checkin/load");
      this.last_update = this.$moment().format("Y-MM-DD HH:mm:ss");
    },
    showHistory(item) {
      this.historyDialog = true;
      this.historyData = item;
    }
  },
  mounted() {
    this.loadData();
    console.log('Timer initiated');
    this.loadTimer = setInterval(() => this.loadData(), this.refresh_rate * 1000);
  },
  beforeDestroy() {
    console.log('Timer cleared');
    clearInterval(this.loadTimer);
  },
  computed: {
    guests() {
      const guests = this.$store.state.guest.list;
      const checkin = this.$store.state.checkin.list;

      if (guests && checkin) {
        let checkinGuestId = {};
        for (let row of checkin) {
          if (row.guest_id in checkinGuestId) {
            checkinGuestId[row.guest_id].push(row);
          } else {
            checkinGuestId[row.guest_id] = [row];
          }
        }

        for (let row of guests) {
          if (checkinGuestId[row.id]) {
            row.last_checkin = this.$moment.unix(checkinGuestId[row.id][0].time).format('Y-MM-DD HH:mm:ss');
            row.checkin_history = checkinGuestId[row.id];
          }
        }
      }

      return guests;
    },
    totalCheckin() {
      if (this.guests) {
        return this.guests.reduce((total, row) => {
          if (row.last_checkin)
            total++;
          return total;
        }, 0);
      }
      return 0;
    },
    checkinPercent() {
      return this.guests.length > 0 ? (this.totalCheckin / this.guests.length) * 100 : 0;
    },
    checkin_log() {
      var data = [];
      for (let row of this.guests) {
        if (row.checkin_history) {
          for (let checkin of row.checkin_history) {
            data.push({
              "time": checkin.time,
              "manual": checkin.manual,
              "name": row.name,
              "checkin_code": row.checkin_code
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
      var columns = this.$store.state.guest.columns;
      return columns;
    },
    headersGuests() {
      const columns = [...this.headers];
      if (columns) {
        columns.push({
          text: "LAST CHECK IN",
          value: "last_checkin"
        });
        columns.push({
          text: "ACTIONS",
          value: "actions",
          sortable: false
        });
      }
      return columns;
    },
    sparklineData() {
      let data = {
        values: [],
        labels: []
      };

      if (this.checkin_log.length > 0) {
        const logs = [...this.checkin_log].reverse();

        const firstTime = logs[0].time - 60;
        const lastTime = logs[logs.length - 1].time + 60;
        const interval = lastTime - firstTime;
        const numOfSection = 10;
        const increment = interval/numOfSection;
        for (let i = 0; i <= numOfSection; i++) {
          const from = firstTime + ((i-1) * increment);
          const until = firstTime + (i * increment);
          data.labels[i] = this.$moment.unix(until).format('YY MMM D HH:mm');
          data.values[i] = logs.reduce((total, row) => {
            if (row.time >= from && row.time < until)
              total++;
            return total;
          }, 0);
        }
      } else {
        data.values = [0, 0];
        data.labels = ['Start', 'End'];
      }

      return data;
    },
    filteredGuests() {
      let filtered = this.guests;
      if (this.guestFilter == "attended") {
        filtered = this.guests.filter((val) => { return val.last_checkin});
      } else if (this.guestFilter == "unattended") {
        filtered = this.guests.filter((val) => { return !val.last_checkin});
      }
      return filtered;
    }
  },
}
</script>
