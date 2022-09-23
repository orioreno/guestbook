<template>
  <div>
    <PasswordVerification :verified="loadEvents">
      <EventList></EventList>
    </PasswordVerification>
  </div>
</template>

<script>
export default {
  name: "EventsPage",
  head: {
    title: "Events",
  },
  methods: {
    loadEvents() {
      this.$store.dispatch("event/load");
    }
  }
}
</script>
