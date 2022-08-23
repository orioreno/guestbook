<template>
  <div>
    <div>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            v-bind="attrs"
            v-on="on"
            class="mr-2 mb-2"
            :loading="downloading"
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
            @click.stop="generateXLSX">
            <v-list-item-title>Guest list (XLSX)</v-list-item-title>
          </v-list-item>
          <v-list-item
            link
            @click.stop="downloadQr">
            <v-list-item-title>Check in QR codes (ZIP)</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
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
        id="datatable"
        :headers="headers"
        :items="guests"
        :search="search"
        sort-by="name"
        :loading="loading"
        :multi-sort="true"
        loading-text="Loading data"
      >
        <template v-slot:item._checkin_code="{ item }">
          <v-btn
            class="ma-2"
            outlined
            @click.stop="showQr(item)"
            title="Click to view QR code"
          >
            {{ item._checkin_code }}
          </v-btn>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="openGuestForm(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            @click="deleteGuest(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

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
              :items="events.filter(event => !event.selected)"
              item-text="name"
              item-value="_id"
              label="Choose an event"
              v-model="cloneEventId"
              :disabled="savingGuest"
            ></v-select>

            <v-checkbox
              v-model="cloneRegenerate"
              label="Regenerate new check in code"
              :disabled="savingGuest"
            ></v-checkbox>
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
          {{ qrData._checkin_code }}
        </v-card-subtitle>
        <v-card-text>
          <div class="px-5 py-5 text-center rounded" style="background:white" ref="qrcode" id="qrcode"></div>
        </v-card-text>
      </v-card>
    </v-dialog>

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
            Edit guest
          </v-card-title>
          <v-card-text>
              <div v-for="(header, idx) in headers"
                  v-bind:key = "idx">
                <v-text-field
                  v-if = "header.additional !== true"
                  :label="header.text"
                  :rules="header.value == 'name' ? [v => !!v || 'Event name is required'] : []"
                  v-model="guestFormData[header.value]"
                  class="mb-1"
                ></v-text-field>
              </div>
          </v-card-text>
          <v-card-actions>
            <v-checkbox
              class="ml-2"
              v-if="guestFormData._id"
              v-model="guestFormRegenerate"
              label="Re-generate check in code"
            ></v-checkbox>
            <v-spacer></v-spacer>
            <v-btn
              type="submit"
              color="primary"
              text
              :loading="savingGuest"
              @click.stop="saveGuest"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx/xlsx.mjs';
import * as QRCode from 'easyqrcodejs';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default {
  name: "GuestPage",
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
      guestFormRegenerate: false,
      cloneDialog: false,
      cloneValid: false,
      cloneEventId: null,
      cloneRegenerate: false
    };
  },
  methods: {
    async loadGuests() {
      this.$store.dispatch("guest/loadGuests");
    },
    openImportDialog() {
      this.importInput = false;
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
          const wb = XLSX.read(bstr, { type: "binary" });
          /* Get first worksheet */
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          for (let idx in data) {
            const row = data[idx];
            if (idx == 0) {
              columns = row.map(element => {
                return element.trim().toLowerCase();
              });
              if (!columns.includes("name")) {
                alert("Data should contains column name");
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
            alert("No rows found");
        };
        reader.readAsBinaryString(this.importInput);
      }
    },
    async uploadImportFile() {
      if (confirm("Current data will be replaced. Are you sure?")) {
        this.savingGuest = true;
        await this.$store.dispatch("guest/importGuests", this.importData);
        this.importData = [];
        this.importInput = null;
        this.savingGuest = false;
        this.importDialog = false;
        this.loadGuests();
      }
    },
    async generateXLSX() {
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
      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      this.downloading = false;
      return XLSX.writeFile(wb, this.$store.state.event.selected.name + " guests list.xlsx");
    },
    showQr(guest) {
      this.$refs.qrcode.innerHTML = '';
      this.qrData = guest;
      var options = {
        text: this.qrData._checkin_code,
        title: this.qrData.name,
        titleTop: 15,
        titleFont: "bold 16px sans-serif",
        titleColor: "#000000",
        titleBackgroundColor: "#ffffff",
        titleHeight: 50,
        subTitle: this.qrData._checkin_code,
        subTitleFont: "14px sans-serif",
        subTitleColor: "#000000",
        subTitleTop: 35,
        width: 400,
        height: 400,
        colorDark : "#000000",
        colorLight : "#ffffff",
      }
      // Create new QRCode Object
      new QRCode(this.$refs.qrcode, options);
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
          var canvas = document.querySelector('#qrcode canvas');
          var savable = new Image();
          savable.src = canvas.toDataURL();
          zip.file(guest.name + ' - ' + guest._checkin_code + '.png', savable.src.substr(savable.src.indexOf(',')+1), {base64: true});
          count++;
          if (count >= this.guests.length) {
            setTimeout(() => {
              console.log("Compressing QR codes...");
              zip.generateAsync({type:"blob"})
                .then(function(content) {
                    saveAs(content, filename);
                });
              this.downloading = false;
            }, 500);
            return;
          }
        }
      }, 500)
    },
    openGuestForm(guest) {
      this.guestFormData = guest ? {...guest} : {};
      this.guestFormDialog = true;
      this.guestFormRegenerate = false;
    },
    async deleteGuest(guest) {
      if (confirm("Do you want to remove " + guest.name + " from guest list?")) {
        this.savingGuest = true;
        await this.$store.dispatch("guest/deleteGuest", guest);
        this.savingGuest = false;
        this.loadGuests();
      }
    },
    async saveGuest() {
      let data = {};
      for (let header of this.headers) {
        if (header.additional !== true && this.guestFormData[header.value]) {
          data[header.value] = this.guestFormData[header.value];
        }
      }

      if (data) {
        this.savingGuest = true;
        if (this.guestFormData._id) {
          data._id = this.guestFormData._id;
          data.regenerate = this.guestFormRegenerate;
          await this.$store.dispatch("guest/editGuest", data);
        } else {
          await this.$store.dispatch("guest/addGuest", data);
        }
        this.savingGuest = false;
        this.guestFormDialog = false;
        this.loadGuests();
      }
    },
    openCloneDialog() {
      this.cloneEventId = null;
      this.cloneRegenerate = false;
      this.cloneDialog = true;
    },
    async cloneGuest() {
      if (confirm("Current data will be replaced. Are you sure?")) {
        this.savingGuest = true;
        await this.$store.dispatch("guest/cloneGuests", {_id: this.cloneEventId, regenerate: this.cloneRegenerate});
        this.savingGuest = false;
        this.cloneDialog = false;
        this.loadGuests();
      }
    }
  },
  created() {
    this.loadGuests();
  },
  computed: {
    guests() {
      return [...this.$store.state.guest.list];
    },
    headers() {
      var columns = [...this.$store.state.guest.columns];
      if (columns.length > 0) {
        columns.push({
          text: "Check In Code",
          value: "_checkin_code",
          additional: true
        });
        columns.push({
          text: "Actions",
          value: "actions",
          sortable: false,
          download: false,
          additional: true
        });
      }
      return columns;
    },
    events() {
      return this.$store.state.event.list;
    },
  },
}
</script>
