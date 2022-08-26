<template>
  <div>
    <PasswordVerification>
      <v-expansion-panels v-model="panel" v-if="event">
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

              <v-text-field
                v-model="event.password"
                required
                :rules="[v => !!v || 'Password is required']"
                :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                :type="passwordVisible ? 'text' : 'password'"
                label="Password *"
                hint="Authentication to open guest and setting page"
                @click:append="passwordVisible = !passwordVisible"
              ></v-text-field>

              <div class="mt-5">
                <v-btn type="submit" color="primary">Save changes</v-btn>
              </div>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>Check in configuration</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-form
              class="mt-2"
              ref="form"
              v-model="valid"
              lazy-validation
              @submit.prevent="saveChanges"
            >
              <v-textarea
                label="Check in success message"
                v-model="event.checkin_success_message"
                hint="{column name} will be replaced by column value"
                class="mb-1"
              ></v-textarea>

              <div class="row">
                <div class="col-sm-6">
                  <div class="d-flex">

                    <v-file-input
                      accept="image/png, image/jpeg, image/jpg, image/bmp"
                      placeholder="Pick a background image"
                      prepend-icon="mdi-image"
                      v-model="fileBackgroundImage"
                      label="Background image"
                    ></v-file-input>
                  </div>
                </div>
                <div class="col-sm-6 preview">
                  <img :src="tempBackgroundImage ?? event.checkin_background_image" style="max-width:100%;max-height:200px">
                </div>
              </div>

              <div class="row">
                <div class="col-sm-6">
                  <v-file-input
                    accept="audio/*"
                    placeholder="Pick a success sound"
                    prepend-icon="mdi-music"
                    v-model="fileSuccessAudio"
                    label="Check in success audio"
                  ></v-file-input>
                </div>

                <div class="col-sm-6 preview">
                  <audio controls ref="success_audio">
                    <source v-bind:src="tempSuccessAudio ?? event.checkin_success_audio">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>


              <div class="row">
                <div class="col-sm-6">
                  <v-file-input
                    accept="audio/*"
                    placeholder="Pick a failed sound"
                    prepend-icon="mdi-music"
                    v-model="fileFailedAudio"
                    label="Check in failed audio"
                  ></v-file-input>
                </div>
                <div class="col-sm-6 preview">
                  <audio controls ref="failed_audio">
                    <source v-bind:src="tempFailedAudio ?? event.checkin_failed_audio">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>

              <div class="mt-5">
                <v-btn type="submit" color="primary">Save changes</v-btn>
              </div>
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
              <div class="mt-5">
                <v-btn type="submit" color="error">Deactivate current event</v-btn>
              </div>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </PasswordVerification>
  </div>
</template>

<style>
.preview {
  position:relative;
}
.preview-remove {
  position:absolute;
  top:0;
}
</style>

<script>
import PasswordVerification from '~/components/PasswordVerification.vue';
export default {
    name: "SettingsPage",
    head: {
        title: "Settings"
    },
    data() {
        return {
            panel: 0,
            valid: false,
            deactivationCode: "",
            passwordVisible: false,
            fileBackgroundImage: null,
            fileSuccessAudio: null,
            fileFailedAudio: null,
            tempBackgroundImage: null,
            tempSuccessAudio: null,
            tempFailedAudio: null
        };
    },
    methods: {
        async saveChanges() {
            if (this.tempBackgroundImage)
                this.event.checkin_background_image = this.tempBackgroundImage;
            if (this.tempSuccessAudio)
                this.event.checkin_success_audio = this.tempSuccessAudio;
            if (this.tempFailedAudio)
                this.event.checkin_failed_audio = this.tempFailedAudio;
            const resp = await this.$store.dispatch("event/updateEvent", this.event);
            if (resp === true) {
                window.location.reload(true);
            }
            else {
                alert(resp);
            }
        },
        async deactivate() {
            if (confirm("Are you sure want to delete event " + this.event.name + "?")) {
                const resp = await this.$store.dispatch("event/deleteEvent", this.event);
                if (resp === true) {
                    window.location.reload(true);
                }
                else {
                    alert(resp);
                }
            }
        },
        async getEventData() {
        }
    },
    watch: {
        async fileBackgroundImage(val) {
            this.tempBackgroundImage = val ? await this.$toBase64(val) : null;
        },
        async fileSuccessAudio(val) {
            this.tempSuccessAudio = val ? await this.$toBase64(val) : null;
            this.$refs.success_audio.load();
        },
        async fileFailedAudio(val) {
            this.tempFailedAudio = val ? await this.$toBase64(val) : null;
            this.$refs.failed_audio.load();
        }
    },
    computed: {
        event() {
            return { ...this.$store.state.event.selected };
        },
        defaultEventName() {
            return this.$store.state.event.selected.name;
        }
    },
    components: { PasswordVerification }
}
</script>
