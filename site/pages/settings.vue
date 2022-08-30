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
                      :rules="[value => !value || value.size < imageMaxSize || 'File size should be less than ' + (imageMaxSize/1000000) + ' MB!',]"
                      show-size
                      :hint="'PNG/JPEG/JPG/BPM file less than ' + (imageMaxSize/1000000) + 'MB'"
                      persistent-hint
                      label="Background image"
                    ></v-file-input>
                  </div>
                </div>
                <div class="col-sm-5 preview">
                  <img v-if="tempBackgroundImage" :src="tempBackgroundImage" style="max-width:100%;max-height:200px">
                  <div v-else class="pa-5 bg-secondary">No background image</div>
                </div>
                <div class="col-sm-1">
                  <v-btn
                    v-if="tempBackgroundImage !== null"
                    class="my-3"
                    fab
                    x-small
                    color="red"
                    title="Remove background"
                    @click.stop="tempBackgroundImage = null"
                  >
                    <v-icon dark>
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-6">
                  <v-file-input
                    accept="audio/ogg, audio/mp3, audio/wav"
                    placeholder="Pick a success sound"
                    prepend-icon="mdi-music"
                    v-model="fileSuccessAudio"
                    :rules="[value => !value || value.size < audioMaxSize || 'File size should be less than ' + (audioMaxSize/1000) + ' KB!',]"
                    show-size
                    :hint="'OGG/MP3/WAV file less than ' + (audioMaxSize/1000) + 'KB'"
                    persistent-hint
                    label="Check in success audio"
                  ></v-file-input>
                </div>

                <div class="col-sm-5 preview">
                  <audio controls ref="success_audio">
                    <source :src="tempSuccessAudio ?? defaultSuccessAudio">
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <div class="col-sm-1">
                  <v-btn
                    v-if="tempSuccessAudio !== null"
                    class="my-3"
                    fab
                    x-small
                    color="red"
                    title="Change to default"
                    @click.stop="tempSuccessAudio = null; fileSuccessAudio = null; $refs.success_audio.load();"
                  >
                    <v-icon dark>
                      mdi-redo-variant
                    </v-icon>
                  </v-btn>
                </div>
              </div>


              <div class="row">
                <div class="col-sm-6">
                  <v-file-input
                    accept="audio/ogg, audio/mp3, audio/wav"
                    placeholder="Pick a failed sound"
                    prepend-icon="mdi-music"
                    v-model="fileFailedAudio"
                    :rules="[value => !value || value.size < audioMaxSize || 'File size should be less than ' + (audioMaxSize/1000) + ' KB!',]"
                    show-size
                    :hint="'OGG/MP3/WAV file less than ' + (audioMaxSize/1000) + 'KB'"
                    persistent-hint
                    label="Check in failed audio"
                  ></v-file-input>
                </div>
                <div class="col-sm-5 preview">
                  <audio controls ref="failed_audio">
                    <source :src="tempFailedAudio ?? defaultFailedAudio">
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <div class="col-sm-1">
                  <v-btn
                    v-if="tempFailedAudio !== null"
                    class="my-3"
                    fab
                    x-small
                    color="red"
                    title="Change to default"
                    @click.stop="tempFailedAudio = null; fileFailedAudio = null; $refs.failed_audio.load();"
                  >
                    <v-icon dark>
                      mdi-redo-variant
                    </v-icon>
                  </v-btn>
                </div>
              </div>

              <div class="row">
                <div class="col-lg-4 col-sm-6">
                  <label>Font color</label>
                  <v-color-picker v-model="event.font_color"></v-color-picker>
                </div>
                <div class="col-lg-4 col-sm-6">
                  <label>Box input color</label>
                  <v-color-picker v-model="event.box_input_color"></v-color-picker>
                </div>
                <div class="col-lg-4 col-sm-6">
                  <label>Text input color</label>
                  <v-color-picker v-model="event.text_input_color"></v-color-picker>
                </div>
                <div class="col-lg-4 col-sm-6">
                  <label>Success overlay color</label>
                  <v-color-picker v-model="event.success_overlay_color"></v-color-picker>
                </div>
                <div class="col-lg-4 col-sm-6">
                  <label>Failed overlay color</label>
                  <v-color-picker v-model="event.failed_overlay_color"></v-color-picker>
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
import defaultSuccessAudio from '~/assets/default_success.mp3'
import defaultFailedAudio from '~/assets/default_failed.mp3'
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
      tempFailedAudio: null,
      imageMaxSize: 2000000,
      audioMaxSize: 200000,
      defaultSuccessAudio: defaultSuccessAudio,
      defaultFailedAudio: defaultFailedAudio
    };
  },
  methods: {
    async saveChanges() {
      if (this.tempBackgroundImage !== this.event.checkin_background_image)
        this.event.checkin_background_image = this.tempBackgroundImage;
      if (this.tempSuccessAudio !== this.event.checkin_success_audio)
        this.event.checkin_success_audio = this.tempSuccessAudio;
      if (this.tempFailedAudio !== this.event.checkin_failed_audio)
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
  },
  watch: {
    async fileBackgroundImage(val) {
      if (val && val.size < this.imageMaxSize) {
        this.tempBackgroundImage = val ? await this.$toBase64(val) : null;
      } else {
        this.tempBackgroundImage = this.event.checkin_background_image;
      }
    },
    async fileSuccessAudio(val) {
      console.log(val);
      if (val && val.size < this.audioMaxSize) {
        this.tempSuccessAudio = val ? await this.$toBase64(val) : null;
      } else {
        this.tempSuccessAudio = this.event.checkin_success_audio;
      }
      this.$refs.success_audio.load();
    },
    async fileFailedAudio(val) {
      if (val && val.size < this.audioMaxSize) {
        this.tempFailedAudio = val ? await this.$toBase64(val) : null;
      } else {
        this.tempFailedAudio = this.event.checkin_failed_audio;
      }
      this.$refs.failed_audio.load();
    }
  },
  computed: {
    event() {
      let row = { ...this.$store.state.event.selected };
      if (!row.font_color) row.font_color = {r:255, g:255, b:255, a:1};
      if (!row.box_input_color) row.box_input_color = {r:255, g:255, b:255, a:1};
      if (!row.text_input_color) row.text_input_color = {r:0, g:0, b:0, a:1};
      if (!row.success_overlay_color) row.success_overlay_color = {r:76, g:175, b:80, a:0.7};
      if (!row.failed_overlay_color) row.failed_overlay_color = {r:244, g:67, b:54, a:0.7};
      if (row.checkin_background_image) this.tempBackgroundImage = row.checkin_background_image;
      if (row.checkin_success_audio) this.tempSuccessAudio = row.checkin_success_audio;
      if (row.checkin_failed_audio) this.tempFailedAudio = row.checkin_failed_audio;
      return row;
    },
    defaultEventName() {
      return this.$store.state.event.selected.name;
    },
  },
  components: { PasswordVerification }
}
</script>
