<template>
  <div>
    <PasswordVerification :verified="loadGuests">
      <v-card>
        <v-card-title>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                v-bind="attrs"
                v-on="on"
                class="mr-2 mb-2"
                :loading="savingGuest"
              >
                <v-icon left>mdi-upload</v-icon>
                Import guests
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                link
                @click.stop="openImportDialog">
                <v-list-item-title>From XLSX file</v-list-item-title>
              </v-list-item>
              <v-list-item
                link
                @click.stop="openCloneDialog">
                <v-list-item-title>From other event</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn
            v-if="this.headers.length > 0"
            color="primary"
            class="mr-2 mb-2"
            @click.stop="openGuestForm"
          >
            <v-icon left>mdi-plus</v-icon>
            Add guest
          </v-btn>

          <v-menu offset-y v-if="guests.length > 0">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                v-bind="attrs"
                v-on="on"
                class="mr-2 mb-2"
                :loading="downloading"
              >

                <v-icon left>mdi-download</v-icon>
                Download
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                link
                @click.stop="guestListXLSX">
                <v-list-item-title>Guest list (XLSX)</v-list-item-title>
              </v-list-item>
              <v-list-item
                link
                @click.stop="guestCheckinXLSX">
                <v-list-item-title>Guests and check in histories (XLSX)</v-list-item-title>
              </v-list-item>
              <v-list-item
                link
                @click.stop="downloadQr">
                <v-list-item-title>Check in QR codes (ZIP)</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-title>
        <v-card-subtitle>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            outlined
            class="mt-3"
          ></v-text-field>
        </v-card-subtitle>
        <v-data-table
          id="datatable"
          :headers="headersTable"
          :items="guests"
          :search="search"
          sort-by="name"
          :loading="loading"
          loading-text="Loading data"
        >
          <template v-slot:item.actions="{ item }">
            <v-menu>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  small
                >
                  Actions
                  <v-icon
                    right
                    dark
                  >
                    mdi-chevron-down
                  </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="showQr(item)">
                  <v-list-item-title>Show QR code</v-list-item-title>
                </v-list-item>
                <v-list-item @click="manualCheckIn(item)">
                  <v-list-item-title>Manual check in</v-list-item-title>
                </v-list-item>
                <v-list-item @click="showHistory(item)">
                  <v-list-item-title>Check in history</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openGuestForm(item)">
                  <v-list-item-title>Edit guest</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteGuest(item)">
                  <v-list-item-title>Delete guest</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-card>

      <!-- Import dialog -->
      <v-dialog
        v-model="importDialog"
        max-width="400"
        :eager="true"
      >
        <v-card>
          <v-card-title>
            Import guests
          </v-card-title>
          <v-card-text>
            <v-file-input
              accept=".xlsx, .xls"
              label="Select XLSX file"
              v-model="importInput"
              @change="readImportFile"
              :disabled="savingGuest"
            ></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              :disabled="!importData.length > 0"
              :loading="savingGuest"
              @click="uploadImportFile"
            >
              <v-icon>mdi-spinner</v-icon>
              {{ importData.length ? "Import " + importData.length + " row(s)" : "Select a file" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Clone dialog -->
      <v-dialog
        v-model="cloneDialog"
        max-width="400"
        :eager="true"
      >
        <v-form
          class="mt-2"
          ref="form"
          v-model="cloneValid"
          lazy-validation
          @submit.prevent="cloneGuest"
        >
          <v-card>
            <v-card-title>
              Clone guests
            </v-card-title>
            <v-card-text>
              <v-select
                required
                :rules="[v => !!v || 'You haven\'t choose any event']"
                :items="events ? events.filter(event => !event.selected) : []"
                item-text="name"
                item-value="id"
                label="Choose an event"
                v-model="cloneEventId"
                :disabled="savingGuest"
              ></v-select>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                text
                :disabled="cloneEventId === null"
                :loading="savingGuest"
                @click.stop="cloneGuest"
              >
                <v-icon>mdi-spinner</v-icon>
                {{ cloneEventId ? "Start cloning" : "Select an event" }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <!-- QR Preview dialog -->
      <v-dialog
          v-model="qrDialog"
          max-width="500"
          :eager="true"
        >
        <v-card>
          <v-card-title>
            {{ qrData.name }}
          </v-card-title>
          <v-card-subtitle>
            {{ qrData.checkin_code }}
          </v-card-subtitle>
          <v-card-text>
            <div class="text-center" ref="qrcode" id="qrcode"></div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Guest form dialog -->
      <v-dialog
        v-model="guestFormDialog"
        :eager="true"
        max-width="800"
      >
        <v-form
          class="mt-2"
          ref="form"
          v-model="guestFormValid"
          lazy-validation
          @submit.prevent="saveGuest"
        >
          <v-card>
            <v-card-title>
              {{ guestFormData.id ? 'Edit Guest' : 'Add Guest' }}
            </v-card-title>
            <v-card-text>
                <div v-for="(header, idx) in headers"
                    v-bind:key = "idx">
                  <v-text-field
                    :label="header.text"
                    :rules="header.value == 'name' ? [v => !!v || 'Event name is required'] : []"
                    :hint="header.value == 'checkin_code' ? 'Leave empty to generate new code' : ''"
                    v-model="guestFormData[header.value]"
                    class="mb-1"
                  ></v-text-field>
                </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                type="submit"
                color="primary"
                text
                :loading="savingGuest"
              >
                Save Changes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>

      <!-- History dialog -->
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
    </PasswordVerification>
  </div>
</template>

<script>
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import PasswordVerification from '~/components/PasswordVerification.vue';

export default {
  name: "GuestsPage",
  head: {
    title: "Guests",
  },
  data() {
    return {
      importDialog: false,
      importData: [],
      importInput: null,
      savingGuest: false,
      loading: false,
      search: "",
      qrDialog: false,
      qrData: {},
      downloading: false,
      guestFormDialog: false,
      guestFormData: {},
      guestFormValid: false,
      cloneDialog: false,
      cloneValid: false,
      cloneEventId: null,
      historyDialog: false,
      historyData: {},
    };
  },
  methods: {
    loadGuests() {
      this.$store.dispatch("guest/load");
      this.$store.dispatch("checkin/load");
    },
    openImportDialog() {
      this.importInput = null;
      this.importDialog = true;
      this.importData = [];
    },
    readImportFile(e) {
      if (this.importInput) {
        const reader = new FileReader();
        let columns = [];
        this.importData = [];
        reader.onload = (e) => {
          /* Parse data */
          const bstr = e.target.result;
          const wb = this.$xlsx.read(bstr, { type: "binary" });
          /* Get first worksheet */
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const data = this.$xlsx.utils.sheet_to_json(ws, { header: 1 });
          for (let idx in data) {
            const row = data[idx];
            if (idx == 0) {
              columns = row.map(element => {
                return element.trim().toLowerCase();
              });
              if (!columns.includes("name")) {
                this.$store.commit("snackbar/show", {text: "Data should contains column `name`", color: 'error'});
                this.importInput = null;
                return;
              }
            }
            else {
              let newRow = {};
              for (let ridx in row) {
                const key = columns[ridx];
                newRow[columns[ridx]] = row[ridx];
              }
              this.importData.push(newRow);
            }
          }
          if (this.importData.length <= 0)
              this.$store.commit("snackbar/show", {text: "No rows found", color: 'error'});
        };
        reader.readAsBinaryString(this.importInput);
      }
    },
    uploadImportFile() {
      if (this.guests.length <= 0 || confirm("Current data will be replaced and attendance history will be cleared. Are you sure?")) {
        this.savingGuest = true;

        if (this.importData.length > 0) {
          this.$axios.$put('guest', this.importData)
            .then((resp) => {
              const errors = [];
              for (const row of resp) {
                if (typeof row == 'string') errors.push(row);
              }
              if (errors.length > 0) return this.$store.commit("snackbar/show", {text: errors.join("<br/>"), color: 'warning'});
              this.$store.commit("snackbar/show", {text: resp.length + ' guest(s) has been imported'});
              this.importDialog = false;
            })
            .catch((err) => {
              this.$store.commit("snackbar/show", {text: err.response.data});
            })
            .then(() => {
              this.loadGuests();
              this.savingGuest = false;
            });
        }
      }
    },
    guestListXLSX() {
      this.downloading = true;
      var data = [];
      // add header row
      let headerRow = [];
      for (let h of this.headers) {
        if (h.download !== false) {
            headerRow.push(h.text);
        }
      }
      data.push(headerRow);
      // add data rows
      for (let g of this.guests) {
        let row = [];
        for (let h of this.headers) {
          row.push(g[h.value]);
        }
        data.push(row);
      }
      var wb = this.$xlsx.utils.book_new();
      var ws = this.$xlsx.utils.aoa_to_sheet(data);
      this.$xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
      this.downloading = false;
      return this.$xlsx.writeFile(wb, this.$store.state.event.selected.name + " guests list.xlsx");
    },
    async guestCheckinXLSX() {
      this.downloading = true;
      var data = [];
      // add header row
      let headerRow = [];
      for (let h of this.headers) {
        if (h.download !== false) {
          headerRow.push(h.text);
        }
      }
      headerRow.push("LAST CHECK IN");
      headerRow.push("MANUAL CHECK IN");
      data.push(headerRow);
      // add data rows
      for (let g of this.guests) {
        if (g.checkin_history) {
          for (let idx in g.checkin_history) {
            let row = [];

            // add row ordered by headers
            for (let h of this.headers) {
              if (idx == 0) {
                row.push(g[h.value]);
              }
              else {
                row.push("");
              }
            }

            row.push(this.$moment.unix(g.checkin_history[idx].time).format("Y-MM-DD HH:mm:ss"));
            row.push(g.checkin_history[idx].manual);
            data.push(row);
          }
        }
        else {
          let row = [];
          for (let h of this.headers) {
            row.push(g[h.value]);
          }
          data.push(row);
        }
      }
      var wb = this.$xlsx.utils.book_new();
      var ws = this.$xlsx.utils.aoa_to_sheet(data);
      this.$xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
      this.downloading = false;
      return this.$xlsx.writeFile(wb, this.$store.state.event.selected.name + " guests check in.xlsx");
    },
    showQr(guest) {
      this.$refs.qrcode.innerHTML = "";
      this.qrData = guest;
      this.$createQR(this.$refs.qrcode, this.qrData.checkin_code, this.qrData.name, this.qrData.checkin_code);
      this.qrDialog = true;
    },
    downloadQr() {
      this.downloading = true;
      console.log("Generating QR code...");
      setTimeout(() => {
        var zip = new JSZip();
        var count = 0;
        var filename = this.$store.state.event.selected.name + " qr codes.zip";
        for (let guest of this.guests) {
          this.showQr(guest);
          this.qrDialog = false;
          var canvas = document.querySelector("#qrcode canvas");
          var savable = new Image();
          savable.src = canvas.toDataURL();
          zip.file(guest.checkin_code + ".png", savable.src.substr(savable.src.indexOf(",") + 1), { base64: true });
          count++;
          if (count >= this.guests.length) {
            setTimeout(() => {
              console.log("Compressing QR codes...");
              zip.generateAsync({ type: "blob" })
                .then(function (content) {
                saveAs(content, filename);
              });
              this.downloading = false;
            }, 500);
            return;
          }
        }
      }, 500);
    },
    openGuestForm(guest) {
      this.guestFormData = guest ? { ...guest } : {};
      this.guestFormDialog = true;
    },
    deleteGuest(guest) {
      if (confirm("Do you want to remove " + guest.name + " from guest list?")) {
        this.savingGuest = true;
        this.$axios.$delete('guest/'+guest.id)
          .then((res) => {
            this.$store.commit("snackbar/show", {text: guest.name + " has been deleted"});
          })
          .catch((err) => {
            this.$store.commit("snackbar/show", {text: err.response.data, color: 'error'});
          })
          .then(() => {
            this.savingGuest = false;
            this.loadGuests();
          })
      }
    },
    saveGuest() {
      let data = {};
      for (let header of this.headers) {
        data[header.value] = this.guestFormData[header.value];
      }
      if (data) {
        this.savingGuest = true;
        if (this.guestFormData.id) {
          this.$axios.$patch('guest/'+this.guestFormData.id, data)
            .then((res) => {
              this.$store.commit("snackbar/show", {text: res.name + " has been saved"});
              this.guestFormDialog = false;
            })
            .catch((err) => {
              this.$store.commit("snackbar/show", {text: err.response.data, color: 'error'});
            })
            .then(() => {
              this.savingGuest = false;
              this.loadGuests();
            });
        } else {
          this.$axios.$post('guest', data)
            .then((res) => {
              this.$store.commit("snackbar/show", {text: res.name + " has been saved"});
              this.guestFormDialog = false;
            })
            .catch((err) => {
              this.$store.commit("snackbar/show", {text: err.response.data, color: 'error'});
            })
            .then(() => {
              this.savingGuest = false;
              this.loadGuests();
            });
        }
      }
    },
    openCloneDialog() {
      this.cloneEventId = null;
      this.cloneDialog = true;
    },
    cloneGuest() {
      if (this.guests.length <= 0 || confirm("Current guests will be replaced and attendance history will be cleared. Are you sure?")) {
        this.savingGuest = true;
        this.$axios.$put('guest/clone/'+this.cloneEventId)
          .then((resp) => {
            const errors = [];
            for (const row of resp) {
              if (typeof row == 'string') errors.push(row);
            }
            if (errors.length > 0) return this.$store.commit("snackbar/show", {text: errors.join("<br/>"), color: 'warning'});
            this.$store.commit("snackbar/show", {text: resp.length + ' guest(s) has been imported'});
            this.cloneDialog = false;
          })
          .catch((err) => {
            this.$store.commit("snackbar/show", {text: err.response.data});
          })
          .then(() => {
            this.loadGuests();
            this.savingGuest = false;
          });
      }
    },
    manualCheckIn(guest) {
      if (confirm("Manual check in for " + guest.name + " (" + guest.checkin_code + "). Proceed?")) {
        const snackbarData = {
          text: ''
        };
        this.$axios.$post('checkin', {checkin_code: guest.checkin_code, manual: true})
          .then((res) => {
            snackbarData.text = res.message;
          })
          .catch((err) => {
            snackbarData.color = 'error';
            snackbarData.text = err.response.data;
          })
          .then(() => {
            this.$store.commit("snackbar/show", snackbarData);
          });
      }
    },
    showHistory(item) {
      this.historyDialog = true;
      this.historyData = item;
    }
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
    headers() {
      return this.$store.state.guest.columns;
    },
    headersTable() {
      const columns = [...this.headers];
      if (columns.length > 0) {
        columns.push({
          text: "LAST CHECK IN",
          value: "last_checkin"
        });
        columns.push({
          text: "ACTIONS",
          value: "actions",
          sortable: false,
        });
      }
      return columns;
    },
    events() {
      return this.$store.state.event.list;
    },
  },
  components: { PasswordVerification }
}
</script>
