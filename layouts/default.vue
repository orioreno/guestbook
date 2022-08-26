<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <v-list-item @click.stop="$store.commit('navbar/toggleMiniVariant')">
          <v-list-item-action>
            <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="miniVariant ? 'Expand' : 'Collapse'" />
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
    >
      <v-app-bar-nav-icon class="d-lg-none" @click.stop="$store.commit('navbar/toggleDrawer')" />
      <v-icon class="d-none d-lg-inline" left>mdi-package-variant</v-icon>
      <v-toolbar-title v-text="selectedEvent.name" />

      <v-spacer></v-spacer>

      <div v-if="events !== null">
        <v-menu v-if="events.length > 0" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              title="Switch event"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list shaped>
            <v-subheader>
              <v-icon class="mr-2" color="grey">mdi-swap-horizontal</v-icon>
              CHANGE EVENTS
            </v-subheader>
              <v-list-item
                v-for="(event, idx) in events"
                :key="idx"
                :input-value="event.selected"
                @click.stop="passwordDialog = true; changeTo = event"
              >
                <v-list-item-title>
                  {{ event.name }}
                </v-list-item-title>
              </v-list-item>
            <v-divider class="mt-2"></v-divider>
            <v-list-item class="mt-2">
              <CreateEventDialog />
            </v-list-item>
          </v-list>
        </v-menu>
        <CreateEventDialog :persistent="true" :show="true" v-else></CreateEventDialog>
      </div>
    </v-app-bar>

    <!-- Change event password dialog -->
    <v-dialog
      v-model="passwordDialog"
      max-width="400"
    >
      <v-card>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
          @submit.prevent="changeEvent"
        >
          <v-card-title>
            Enter event password
          </v-card-title>
          <v-card-subtitle>
            {{ changeTo.name }}
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="password"
              required
              class="mb-5"
              :rules="[v => !!v || (passwordError ?? 'Password is required')]"
              @keyup="passwordError = null"
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
              Change event
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import CreateEventDialog from '~/components/CreateEventDialog.vue';
export default {
  name: "DefaultLayout",
  data() {
    return {
      passwordDialog: false,
      changeTo: {},
      password: '',
      valid: false,
      passwordVisible: false,
      passwordError: null,
      items: [
        {
          icon: "mdi-apps",
          title: "Dashboard",
          to: "/"
        },
        {
          icon: "mdi-qrcode-scan",
          title: "Scan",
          to: "/scan"
        },
        {
          icon: "mdi-account-group",
          title: "Guests",
          to: "/guest"
        },
        {
          icon: "mdi-cog",
          title: "Settings",
          to: "/settings"
        }
      ],
    };
  },
  methods: {
    async changeEvent() {
      const resp = await this.$store.dispatch('event/changeSelected', {_id: this.changeTo._id, password: this.password});
      if (resp === true) {
        document.cookie = "evtData=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
        window.location.href = '.';
      } else {
        this.password = '';
        this.passwordError = resp;
      }
    }
  },
  async created() {
    await this.$store.commit("navbar/loadLocalSettings");
    await this.$store.dispatch("event/loadSelected");
    await this.$store.dispatch("event/loadEvents");
  },
  computed: {
    drawer: {
      get() {
        return this.$store.state.navbar.drawer;
      },
      set(val) {
        this.$store.commit("navbar/toggleDrawer", val);
      }
    },
    miniVariant: {
      get() {
        return this.$store.state.navbar.miniVariant;
      },
      set(val) {
        this.$store.commit("navbar/toggleMiniVariant", val);
      }
    },
    events() {
      return this.$store.state.event.list;
    },
    selectedEvent() {
      let selected = this.$store.state.event.selected ?? {};
      return selected;
    },
  },
  components: { CreateEventDialog }
}
</script>
