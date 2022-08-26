<template>
  <div>
    <div id="scan" v-if="event" :style="{'background-image': 'url(' + (this.event.checkin_background_image ?? '') + ')'}">
      <audio ref="successAudio" v-if="event.checkin_success_audio">
        <source :src="event.checkin_success_audio">
      </audio>
      <audio ref="failedAudio" v-if="event.checkin_failed_audio">
        <source :src="event.checkin_failed_audio">
      </audio>
      <div class="d-flex justify-center align-center" style="height:100vh;" :class="checkin_background">
        <div class="text-center">
            <!-- SUCCESS -->
            <div v-if="checkinSuccess === true">
              <h1 class="display-3" v-html="checkinData._checkin_message.replace(/(?:\r\n|\r|\n)/g, '<br>')"></h1>
              <div class="mt-5" style="opacity:0.75">
                {{ $moment.unix(checkinData._checkin_log[0].time).format('D MMM Y HH:mm:ss') }}
              </div>
            </div>

            <!-- FAILED -->
            <div v-else-if="checkinSuccess == false">
              <h1 class="text-center display-3">{{ checkinData }}</h1>
            </div>

            <!-- SCAN -->
            <div v-else>
                <h1 class="display-1 mb-5">Scan QR code or type check in code</h1>
                <div class="d-flex">
                    <div v-for="i in charNum" v-bind:key="i" class="typed-character">
                        {{ typed[i-1] ? typed[i-1] : '&nbsp;' }}
                    </div>
                </div>
                <div class="mt-3" style="opacity:0.75;font-size:0.8em">
                    {{ clearTypedCounter > 0 && clearTypedCounter <= 3 ? 'Clearing in ' + clearTypedCounter + ' second...' : '&nbsp;' }}
                </div>
            </div>
        </div>
        <v-btn
          fab
          large
          dark
          @click.stop="toggleFullscreen"
          id="btnFullscreen"
          :title="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        >
          <v-icon>{{ fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .bg-success {
    background-color: rgba(76, 175, 80, 0.5);
  }
  .bg-danger {
    background-color: rgba(244, 67, 54, 0.5);
  }
  #btnFullscreen {
    opacity:0.5;
    position :fixed;
    right:2em;
    bottom:2em;
  }
  #btnFullscreen:hover {
    opacity:1;
  }
  #scan {
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
  .typed-character {
    background-color: white;
    text-align:center;
    width:1em;
    color: black;
    margin: auto 5px;
    border-radius:5px;
    font-size:6em;
  }
</style>

<script>
export default {
  name: "ScanPage",
  head: {
    title: "Scan",
  },
  data() {
    return {
      typed: '',
      checkinSuccess: null,
      checkinData: null,
      fullscreen: false,
      clearTyped: null,
      clearTypedCounter: 0,
      successTimeout: null,
      charNum: 6
    }
  },
  methods: {
    showMessage(success, data) {
      clearTimeout(this.successTimeout);
      this.checkinSuccess = success;
      this.checkinData = data;
    },
    onKeydown(e) {
      if (this.$refs.successAudio) {
        this.$refs.successAudio.pause();
        this.$refs.successAudio.currentTime = 0;
      }
      if (this.$refs.failedAudio) {
        this.$refs.failedAudio.pause();
        this.$refs.failedAudio.currentTime = 0;
      }
      var startCounter = true;
      this.checkinSuccess = null;
      if (e.keyCode == 13 && this.typed.length > 0) {
        startCounter = false;
        this.submit(this.typed);
      } else if (e.key.length == 1 && /[a-zA-Z0-9]/.test(e.key) && this.typed.length < this.charNum) {
        this.typed += e.key.toUpperCase();
      } else if (e.keyCode == 8) {
        this.typed = this.typed.slice(0, -1);
      }

      // if (this.typed.length >= 6) {
      //   this.submit(this.typed.substring(0, 6));
      // }

      this.clearTypedCounter = 0;
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
    async submit(code) {
      let checkin = await this.$store.dispatch('guest/checkIn', {'checkin_code': code});
      this.showMessage(checkin.success, checkin.data);
      this.typed = "";
    },
    async toggleFullscreen(execute) {
      if (this.fullscreen) {
        await document.exitFullscreen();
      } else {
        var element = document.querySelector("#scan");
        await element.requestFullscreen();
      }
      document.activeElement.blur();
    }
  },
  watch: {
    checkinSuccess() {
      if (this.checkinSuccess !== null) {
        let duration = 3; // in second

        if (this.checkinSuccess && this.$refs.successAudio) {
            duration = this.$refs.successAudio.duration;
            this.$refs.successAudio.play();
        }

        if (!this.checkinSuccess && this.$refs.failedAudio) {
          duration = this.$refs.failedAudio.duration;
          this.$refs.failedAudio.play();
        }

        this.successTimeout = setTimeout(() => {
          this.checkinSuccess = null;
          this.message = '';
        }, duration*1000);
      }
    }
  },
  mounted() {
    addEventListener( "keydown", this.onKeydown );
    addEventListener('fullscreenchange', (e) => {
      this.fullscreen = !this.fullscreen;
    });
  },
  computed: {
    event() {
      return this.$store.state.event.selected;
    },
    bodyStyle() {
      var style = {};
      if (this.event) {
        style['background-image'] = "url(" + this.event.checkin_background_image + ")";
      }
      return style;
    },
    checkin_background() {
      if (this.checkinSuccess === true) {
        return 'bg-success';
      } else if (this.checkinSuccess === false) {
        return 'bg-danger';
      }
      return '';
    }
  }
}
</script>
