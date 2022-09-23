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


      <EventList loadEventOnMounted v-if="!selectedEvent.id"></EventList>

    </v-app-bar>

    <v-main>
      <v-container>
        <Nuxt v-if="selectedEvent.id"/>
      </v-container>
      <Snackbar></Snackbar>
    </v-main>
  </v-app>
</template>

<script>
import EventList from '~/components/EventList.vue';
export default {
    name: "DefaultLayout",
    data() {
        return {
            items: [
                {
                    icon: "mdi-apps",
                    title: "Dashboard",
                    to: "/"
                },
                {
                    icon: "mdi-qrcode-scan",
                    title: "Check In",
                    to: "/checkin"
                },
                {
                    icon: "mdi-account-group",
                    title: "Guests",
                    to: "/guests"
                },
                {
                    icon: "mdi-cog",
                    title: "Settings",
                    to: "/settings"
                },
                {
                    icon: "mdi-swap-horizontal",
                    title: "Change Event",
                    to: "/events"
                },
            ],
        };
    },
    mounted() {
        this.$store.commit("navbar/loadLocalSettings");
        this.$store.dispatch("event/load");
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
        selectedEvent() {
            let selected = this.$store.state.event.selected ?? {};
            return selected;
        },
    },
    components: { EventList }
}
</script>
