<template>
  <div>
    <slot v-if="show"></slot>
    <div v-else style="height:80vh" class="d-flex justify-center align-center">
      <div>
        <v-card>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit.prevent="verify"
          >
            <v-card-title>
              Enter password to access this page
            </v-card-title>
            <v-card-subtitle>
              {{ event ? event.name : ''  }}
            </v-card-subtitle>
            <v-card-text>
              <v-text-field
                v-model="password"
                required
                class="mb-5"
                :rules="[v => !!v || (passwordError ? 'Invalid password' : 'Password is required')]"
                @keyup="passwordError = false"
                :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                :type="passwordVisible ? 'text' : 'password'"
                label="Password"
                @click:append="passwordVisible = !passwordVisible"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                :disabled="!valid"
                type="submit"
              >
                Verify
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerificationDialog',
  props: {
    verified: Function
  },
  data () {
    return {
      manualVerified: false,
      valid: false,
      password: '',
      passwordVisible: false,
      passwordHint: '',
      passwordError: false
    }
  },
  methods: {
    async verify() {
      if (this.password == this.event.password) {
        this.$store.dispatch('event/createCookie', {id: this.event.id, password: this.password});
        this.manualVerified = true;
      } else {
        this.passwordError = true;
        this.password = '';
      }
    }
  },
  mounted() {
    if (this.show && this.verified) {
      this.verified();
    }
  },
  computed: {
    event() {
      return this.$store.state.event.selected;
    },
    cookieVerified() {
      if (this.event) {
        const sha256 = require('crypto-js/sha256');
        const value = `; ${document.cookie}`;
        const parts = value.split(`; evtData=`);
        if (parts.length === 2) {
          const cookie = JSON.parse(parts.pop().split(';').shift());
          if (this.event.id == cookie.id && atob(cookie.pwd) == sha256(this.event.password)) {
            return true;
          }
        }
      }
      return false;
    },
    show() {
      return this.manualVerified || this.cookieVerified;
    }
  },
}
</script>
