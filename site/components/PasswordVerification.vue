<template>
  <div>
    <slot v-if="manualVerification || verified"></slot>
    <div v-else style="height:80vh" class="d-flex justify-center align-center">
      <div class="text-center">
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
import sha256 from 'crypto-js/sha256';

export default {
  name: 'VerificationDialog',
  data () {
    return {
      manualVerification: false,
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
        const cookie = {
          'id': this.event._id,
          'pwd': btoa(sha256(this.password))
        };
        document.cookie = "evtData=" + JSON.stringify(cookie) + "; expires=" + this.$moment().add(1, 'hour').format('Y-MM-DD HH:mm:ss')+ "; path=/";
        this.manualVerification = true;
      } else {
        this.passwordError = true;
        this.password = '';
      }
    }
  },
  computed: {
    event() {
      return this.$store.state.event.selected;
    },
    verified() {
      if (this.event) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; evtData=`);
        if (parts.length === 2) {
          const cookie = JSON.parse(parts.pop().split(';').shift());
          if (this.event._id == cookie.id && atob(cookie.pwd) == sha256(this.event.password)) {
            this.show = false;
            this.manualVerification = true;
            return true;
          }
        }
      }
      return false;
    },
  }
}
</script>
