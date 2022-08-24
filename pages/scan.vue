<template>
  <div>
      <div class=" d-flex align-items-center justify-content-center" :class="success === true ? 'bg-success' : (success === false ? 'bg-danger' : '')" style="height:100vh">
          <div class="text-white text-center" v-if="success === null">
              <h2>Scan your QR code or type your check in code</h2>
              <div class="mt-3" style="min-width:600px">
                  <h1 class="bg-light bg-opacity-25 rounded p-3 text-uppercase display-1">
                      {{ typed ? typed : '&nbsp;' }}
                  </h1>
                  <div style="height:20px">
                      {{ clearTypedCounter > 0 && clearTypedCounter <= 3 ? 'Clearing in ' + clearTypedCounter + ' second...' : '' }}
                  </div>
              </div>
          </div>
          <h1 v-else class="text-center display-2" v-html="message"></h1>
      </div>

      <div class="sticky-bottom w-100 text-center p-3 text-white" v-if="!fullscreen">
          <button type="button" class="btn btn-primary btn-sm" @click.stop="enterFullscreen">Set to fullscreen</button>
      </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      typed: '',
      success: null,
      message: '',
      fullscreen: false,
      clearTyped: null,
      clearTypedCounter: 0,
      successTimeout: null
    }
  },
  methods: {
    showMessage(success, message) {
      clearTimeout(this.successTimeout);
      this.success = success;
      this.message = message;
    },
    onKeydown(e) {
      var startCounter = true;
      this.success = null;
      if (e.keyCode == 13 && this.typed.length > 0) {
        startCounter = false;
        this.submit(this.typed);
      } else if (e.key.length == 1 && /[a-zA-Z0-9]/.test(e.key)) {
        this.typed += e.key;
      } else if (e.keyCode == 8) {
        this.typed = this.typed.slice(0, -1);
      }

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
      let checkin = await this.$store.dispatch('attendance/checkIn', code);
      this.showMessage(checkin.success, checkin.message);
      this.typed = "";
    },
    enterFullscreen() {
        this.$store.commit('navbar/toggleDrawer', false);
        var element = document.querySelector("#app");

        element.requestFullscreen()
        .then(() => {
            this.fullscreen = true;
            // element has entered fullscreen mode successfully
        })
        .catch(function(error) {
            // element could not enter fullscreen mode
            // error message
            console.log(error.message);
        });
    },
    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen()
                .then(() => this.fullscreen = false)
                .catch((err) => console.error(err))
        }
    }
  },
  watch: {
    success() {
      if (this.success !== null) {
        this.successTimeout = setTimeout(() => {
          this.success = null;
          this.message = '';
        }, 3000);
      }
    }
  },
  mounted:function() {
    window.addEventListener( "keydown", this.onKeydown );
    document.onclick = (event) => {
      this.exitFullscreen();
    };
  }
}
</script>
