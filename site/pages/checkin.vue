<template>
  <div>
    <div id="scan" v-if="event" :style="bodyStyle" style="position:relative">
      <audio ref="successAudio">
        <source :src="event.checkin_success_audio ?? defaultSuccessAudio">
      </audio>
      <audio ref="failedAudio">
        <source :src="event.checkin_failed_audio ?? defaultFailedAudio">
      </audio>
      <div class="d-flex justify-center align-center" style="height:100vh;" :style="checkinBackgroundStyle">
        <div class="text-center">
          <!-- SUCCESS -->
          <div v-if="checkinSuccess === true">
            <h1 class="display-3" v-html="checkinMessage"></h1>
            <div class="mt-5" style="opacity:0.75">
              {{ $moment.unix(checkinTime).format('D MMM Y HH:mm:ss') }}
            </div>
          </div>

          <!-- FAILED -->
          <div v-else-if="checkinSuccess == false">
            <h1 class="text-center display-3" v-html="checkinMessage"></h1>
          </div>

          <!-- SCAN -->
          <form @submit.prevent="submit" v-show="checkinSuccess === null">
            <h1 class="mb-3">ENTER CHECK IN CODE</h1>
            <input type="text" v-model="typed" id="checkin_code" class="text-uppercase" ref="inpCheckinCode" :style="boxInputStyle" @keyup="onKeyup">
            <div class="mt-3" style="opacity:0.75;font-size:0.8em">
                {{ clearTypedCounter > 0 && 3 >= clearTypedCounter ? 'Clearing in ' + clearTypedCounter + ' second...' : '&nbsp;' }}
            </div>
          </form>
        </div>
        <v-btn-toggle
          multiple
          class="actions"
          rounded
        >
          <v-btn
            @click.stop="toggleCamera"
            :title="camera ? 'Close camera' : 'Open camera'">
            <v-icon left>{{ camera ? 'mdi-camera-off' : 'mdi-camera' }}</v-icon>
            Open camera
          </v-btn>
          <v-btn
            @click.stop="toggleFullscreen"
            :title="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'">
            <v-icon left>{{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
            Enter fullscreen
          </v-btn>
        </v-btn-toggle>
        <div class="camera-wrapper">
          <div id="camera" class="mr-3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .actions {
    opacity:0.5;
    position :absolute;
    right:2em;
    bottom:2em;
  }
  .actions:hover {
    opacity:1;
  }
  #scan {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
  #checkin_code {
    background:white;
    border-radius:20px;
    border:none;
    font-size:3rem;
    font-weight:bold;
    font-family: "Montserrat";
    text-align:center;
    max-width:300px;
    letter-spacing:5px;
  }
  .camera-wrapper {
    touch-action: none;
    user-select: none;
    box-sizing: border-box;
    position:absolute;
  }
</style>

<script>
// To use Html5Qrcode (more info below)
import {Html5Qrcode} from "html5-qrcode"
import interact from 'interactjs'
import successAudio from '~/assets/default_success.mp3'
import failedAudio from '~/assets/default_failed.mp3'

export default {
  name: "CheckInPage",
  head: {
    title: "Check In",
  },
  data() {
    return {
      typed: '',
      checkinSuccess: null,
      checkinMessage: null,
      checkinTime: null,
      fullscreen: false,
      clearTyped: null,
      clearTypedCounter: 0,
      successTimeout: null,
      charNum: 6,
      camera: false,
      moveCamera: false,
      qrcodeCameraScanner: null,
      cameraPosition: { x: 0, y: 0 },
      defaultSuccessAudio: successAudio,
      defaultFailedAudio: failedAudio,
    }
  },
  methods: {
    showMessage(success, data, customDuration) {
      clearInterval(this.clearTyped);
      this.clearTypedCounter = 0;
      this.typed = "";

      clearTimeout(this.successTimeout);
      this.checkinSuccess = success;
      this.checkinMessage = data.message.replace(/(?:\r\n|\r|\n)/g, '<br>');
      this.checkinTime = data.time;

      let duration = 3;

      this.stopAudio();

      if (this.checkinSuccess && this.$refs.successAudio) {
        duration = 5;
        this.$refs.successAudio.play();
      } else if (!this.checkinSuccess && this.$refs.failedAudio) {
        duration = 3;
        this.$refs.failedAudio.play();
      }

      if (!isNaN(parseFloat(customDuration))) duration = customDuration;

      this.successTimeout = setTimeout(() => {
        this.checkinSuccess = null;
        this.message = '';
        this.stopAudio();
      }, duration*1000);
    },
    onKeyup(e) {
      var startCounter = true;

      this.clearTypedCounter = 0;
      this.typed = this.typed.toUpperCase();

      if (startCounter) {
        clearInterval(this.clearTyped);
        if (this.typed.length > 0) {
          this.clearTypedCounter = 5;
          this.clearTyped = setInterval(() => {
            this.clearTypedCounter--;
            if (this.clearTypedCounter <= 0) {
              this.typed = '';
            }
          }, 1000);
        }
        return;
      }
    },
    submit(duration) {
      if (this.typed.length > 0) {
        let success = false;
        const data = {
          message: '',
          time:0
        }
        const checkin_code = this.typed + '';
        this.typed = '';
        this.$axios.$post('checkin', {checkin_code: checkin_code})
          .then((res) => {
            success = true;
            data.message = res.message;
            data.time = res.time;
          })
          .catch((err) => {
            data.message = err.response.data;
          })
          .then(() => {
            this.showMessage(success, data, duration);
          });
      }
    },
    toggleFullscreen() {
      if (this.fullscreen) {
        document.exitFullscreen();
      } else {
        var element = document.querySelector("#scan");
        element.requestFullscreen();
      }
      document.activeElement.blur();
    },
    toggleCamera() {
      if (!this.qrcodeCameraScanner) {
        this.qrcodeCameraScanner = new Html5Qrcode("camera");
        interact('.camera-wrapper').draggable({
          listeners: {
            move: (event) => {
              this.cameraPosition.x += event.dx
              this.cameraPosition.y += event.dy

              event.target.style.transform =
                `translate(${this.cameraPosition.x}px, ${this.cameraPosition.y}px)`
            },
          }
        });
      }

      if (this.camera === true) {
        this.qrcodeCameraScanner.stop().then((ignore) => {
          this.camera = false;
        });
      } else {
        this.qrcodeCameraScanner.start({ facingMode: "user" }, { fps: 10, qrbox: {width: 350, height: 350}}, (decodedText, decodedResult) => {
          if (this.checkinSuccess === null) {
            this.typed = decodedText;
            this.submit(1.5);
          }
        }).then((ignore) => {
          this.camera = true;
        });
      }
    },
    stopAudio() {
      if (this.$refs.successAudio) {
        this.$refs.successAudio.pause();
        this.$refs.successAudio.currentTime = 0;
      }
      if (this.$refs.failedAudio) {
        this.$refs.failedAudio.pause();
        this.$refs.failedAudio.currentTime = 0;
      }
    },
    onKeydown(e) {
      if (document.activeElement.tagName == 'BODY') this.$refs.inpCheckinCode.focus();
      this.checkinSuccess = null;
      this.stopAudio();
    },
    fullscreenChange(e) {
      this.fullscreen = !this.fullscreen;
    },
    onMouseMove(e) {
      if (this.moveCamera) {
        this.cameraScannerX = e.clientX;
        this.cameraScannerY = e.clientY;
      }
    }
  },
  mounted() {
    addEventListener( "keydown", this.onKeydown);
    addEventListener('fullscreenchange', this.fullscreenChange);
    addEventListener('onmousemove', this.onMouseMove);
    this.$store.dispatch("checkin/loadConfig");
  },
  beforeDestroy() {
    removeEventListener( "keydown", this.onKeydown);
    removeEventListener('fullscreenchange', this.fullscreenChange);
    removeEventListener('onmousemove', this.onMouseMove);
  },
  computed: {
    event() {
      return this.$store.state.event.selected;
    },
    checkinConfig() {
      return this.$store.state.checkin.config;
    },
    bodyStyle() {
      var style = {};
      if (this.checkinConfig) {
        if (this.checkinConfig.background_image) style['background-image'] = "url(" + this.checkinConfig.background_image + ")";
        if (this.checkinConfig.font_color) style['color'] = 'rgba(' + this.checkinConfig.font_color.r + ',' + this.checkinConfig.font_color.g + ',' + this.checkinConfig.font_color.b + ',' + this.checkinConfig.font_color.a + ')';
      }
      return style;
    },
    boxInputStyle() {
      var style = {};
      if (this.checkinConfig) {
        if (this.checkinConfig.box_input_color) style['background-color'] =  'rgba(' + this.checkinConfig.box_input_color.r + ',' + this.checkinConfig.box_input_color.g + ',' + this.checkinConfig.box_input_color.b + ',' + this.checkinConfig.box_input_color.a + ')';
        if (this.checkinConfig.text_input_color) style['color'] =  'rgba(' + this.checkinConfig.text_input_color.r + ',' + this.checkinConfig.text_input_color.g + ',' + this.checkinConfig.text_input_color.b + ',' + this.checkinConfig.text_input_color.a + ')';
      }
      return style;
    },
    checkinBackgroundStyle() {
      var style = {};
      if (this.checkinConfig) {
        if (this.checkinSuccess === true) {
          style['background-color'] = this.checkinConfig.success_overlay_color ? 'rgba(' + this.checkinConfig.success_overlay_color.r + ',' + this.checkinConfig.success_overlay_color.g + ',' + this.checkinConfig.success_overlay_color.b + ',' + this.checkinConfig.success_overlay_color.a + ')' : 'rgba(76,175,80,0.7)';
        } else if (this.checkinSuccess === false) {
          style['background-color'] = this.checkinConfig.failed_overlay_color ? 'rgba(' + this.checkinConfig.failed_overlay_color.r + ',' + this.checkinConfig.failed_overlay_color.g + ',' + this.checkinConfig.failed_overlay_color.b + ',' + this.checkinConfig.failed_overlay_color.a + ')' : 'rgba(244,67,54,0.7)';
        }
      }
      return style;
    }
  }
}
</script>
