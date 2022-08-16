<template>
  <div>
    <div class="mb-3">
      <v-dialog
        v-model="importDialog"
        max-width="400"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-upload</v-icon>
            Import guests
          </v-btn>
        </template>
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
import * as XLSX from 'xlsx/xlsx.mjs';
export default {
  name: "GuestPage",
  data () {
    return {
      importDialog: false,
      importData: [],
      importInput: null,
      savingGuest: false,
      loading: false,
      search: '',
    }
  },
  methods: {
    async loadGuests() {
      this.$store.dispatch('guest/loadGuests');
    },
    readImportFile(e) {
      if (this.importInput) {
        const reader = new FileReader();
        let columns = [];
        this.importData = [];

        reader.onload = (e) => {
          /* Parse data */
          const bstr = e.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
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
                alert('Data should contains column name');
                return;
              }
            } else {
              let newRow = {};
              for (let ridx in row) {
                const key = columns[ridx];
                newRow[columns[ridx]] = row[ridx];
              }
              this.importData.push(newRow);
            }
          }

          if (this.importData.length <= 0) alert('No rows found');
        }

        reader.readAsBinaryString(this.importInput);
      }
    },
    async uploadImportFile() {
      if (confirm("Current data will be replaced. Are you sure?")) {
        this.savingGuest = true;
        await this.$store.dispatch('guest/importGuests', this.importData);
        this.importData = [];
        this.importInput = null;
        this.savingGuest = false;
        this.importDialog = false;
        this.loadGuests();
      }
    }
  },
  created() {
    this.loadGuests();
  },
  computed: {
    guests() {
      return this.$store.state.guest.list;
    },
    headers() {
      return this.$store.state.guest.columns;
    }
  }
}
</script>
