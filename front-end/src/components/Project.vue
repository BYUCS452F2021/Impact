<template>
  <div class="project">
    <div class="title-bar">
      <h1 class="project-title">{{this.project.title}}</h1>
      <p class="remove-project" v-on:click="$emit('delete-project')">-</p>
    </div>
    <Timer
      v-for="timer in timers"
      v-on:start-timer="startTimer(timer)"
      v-on:stop-timer="stopTimer(timer)"
      v-on:delete-timer="deleteTimer(timer)"
      :timer="timer"
      :key="timer._id"
    />
    <div class="add-timer">
      <p class="plus-icon" v-if="!isAddTimer" @click="toggleIsAddTimer()">+</p>
      <form @submit.prevent="addTimer" v-else>
        <input type="text" v-model="timerName" />
        <button type="submit">Add Timer</button>
        <p class="cancel" @click="toggleIsAddTimer()">Cancel</p>
      </form>
    </div>
  </div>
</template>

<script>
import Timer from "@/components/Timer.vue";
import axios from "axios";
export default {
  name: "Project",
  props: {
    project: Object,
  },
  data() {
    return {
      timerName: "",
      isAddTimer: false,
      timers: [],
    };
  },
  created() {
    this.getTimers();
  },
  methods: {
    
    toggleIsAddTimer() {
      this.timerName = "";
      this.isAddTimer = !this.isAddTimer;
    },
    async addTimer() {
      if (this.timerName.length != 0) {
        try {
          await axios.post(`/api/projects/${this.project._id}/timers`, {
            title: this.timerName,
          });
          this.timerName = "";
          this.toggleIsAddTimer();
          await this.getTimers();
        } catch (error) {
          console.log(error);
        }
      }
    },
    async getTimers() {
      try {
        const response = await axios.get(
          `/api/projects/${this.project._id}/timers`
        );
        this.timers = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async startTimer(timer) {
      try {
        await axios.put(
          `/api/projects/${this.project._id}/timers/${timer._id}/start`,
          {}
        );
        await this.getTimers();
      } catch (error) {
        console.log(error);
      }
    },
    async stopTimer(timer) {
      try {
        await axios.put(
          `/api/projects/${this.project._id}/timers/${timer._id}/stop`,
          {}
        );
        await this.getTimers();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteTimer(timer) {
      try {
        await axios.delete(
          `/api/projects/${this.project._id}/timers/${timer._id}`
        );
        await this.getTimers();
      } catch (error) {
        console.log(error);
      }
    },
  },
  components: {
    Timer,
  },
};
</script>

<style scoped>
.project {
  padding: 10px;
  border: 2px solid #ce3d35;
  margin-bottom: 20px;
}

.plus-icon {
  font-size: 30px;
  cursor: pointer;
  width: fit-content;
  margin: 0 auto;
  padding: 0 10px;
  background-color: #5daa5d;
  color: whitesmoke;
}

.add-timer button  {
  margin-left: 10px;
}

.cancel {
  display: inline;
  margin-left: 10px;
}

.title-bar {
  display: grid;
  grid-template: auto / 1fr 1fr;
  margin-bottom: 10px;
  justify-items: center;
}

.remove-project {
  color: whitesmoke;
  font-size: 30px;
  cursor: pointer;
  width: fit-content;
  padding: 0 15px;
  background-color: #ce3d35;
}

</style>