<template>
  <div class="timer">
    <div
      class="timer-toggle"
      v-on:click="toggleTimer()"
      v-bind:style="[timer.active ? { 'background-color': '#ce3d35' } : { 'background-color': '#5daa5d' }]"
    >
      <p>{{ timerText }}</p>
    </div>
    <div class="timer-title">
      <p>{{ timer.title }}</p>
    </div>
    <div class="timer-total">
      <p>{{ timerTime }} min</p>
    </div>
    <div class="timer-remove" v-on:click="$emit('delete-timer')">
      <p>X</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Timer",
  computed: {
    timerText() {
      if (this.timer.active) return "STOP";

      return "START";
    },
    timerTime() {
      return Math.round(this.timer.time * 100) / 100;
    },
  },
  props: {
    timer: Object,
  },
  methods: {
    toggleTimer() {
      if (this.timer.active) {
        this.$emit("stop-timer");
        return;
      }

      this.$emit("start-timer");
    },
  },
};
</script>

<style scoped>
.timer {
  display: grid;
  grid-template: 50px / 1fr 2fr 1fr 1fr;
  border-style: solid;
  border-width: 1px;
  align-items: center;
  justify-items: center;
  margin-bottom: 10px;
}

.timer-toggle, .timer-remove {
  width: 100%;
  height: 100%;
  display: grid;
  align-items: center;
  cursor: pointer;
  
}

.timer-toggle p, .timer-remove p {
  width: fit-content;
  margin: 0 auto;
  color: whitesmoke;
}

.timer-remove {
  background-color: #ce3d35;
}

.timer-toggle:hover , .timer-remove:hover {
  filter: opacity(0.8);
}

</style>
