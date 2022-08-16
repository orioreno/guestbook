<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :stateless="true"
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
      <v-app-bar-nav-icon @click.stop="$store.commit('navbar/toggleDrawer')" />
      <v-toolbar-title v-text="title" />

      <v-spacer></v-spacer>

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
        <v-list>
          <v-list-item
            v-for="(event, index) in events"
            :key="index"
            @click="$store.dispatch('event/changeSelected', event)"
          >
            <v-list-item-title>
              {{ event.name }}
              <v-icon style="font-size:small" color="primary" v-if="event.selected">mdi-check-circle</v-icon>
            </v-list-item-title>
          </v-list-item>
          <v-list-item class="mt-3">
            <CreateEventDialog />
          </v-list-item>
        </v-list>
      </v-menu>
      <CreateEventDialog :persistent="true" :show="true" v-else></CreateEventDialog>
    </v-app-bar>
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
            items: [
                {
                    icon: "mdi-apps",
                    title: "Dashboard",
                    to: "/"
                },
                {
                    icon: "mdi-account-group",
                    title: "Guests",
                    to: "/guest"
                },
                {
                    icon: "mdi-qrcode-scan",
                    title: "Scan",
                    to: "/scan"
                },
                {
                    icon: "mdi-cog",
                    title: "Setting",
                    to: "/setting"
                }
            ],
        };
    },
    created() {
        this.$store.commit("navbar/loadLocalSettings");
        this.$store.dispatch("event/loadEvents");
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
        title() {
            return this.$store.state.navbar.title;
        },
        events() {
            return this.$store.state.event.list;
        },
    },
    components: { CreateEventDialog, CreateEventDialog }
}
</script>
