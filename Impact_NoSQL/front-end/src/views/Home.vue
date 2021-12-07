<template>
  <div class="home">
    <div class="welcome">
        <div class="welcome-box">
          <h1>IMPACT</h1>
          <p>Track your time, make a difference</p>
        </div>
      </div>
    <div class="main-content">
      <form class="add-project-form" @submit.prevent="addProject">
        <input type="text" v-model="projectName" />
        <button type="submit">Add a Project</button>
      </form>
      <Project
        v-for="project in projects"
        v-on:delete-project="deleteProject(project)"
        :project="project"
        :key="project._id"
      />
    </div>
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Project from "@/components/Project.vue";
import axios from "axios";
import Footer from "../components/Footer.vue";
export default {
  name: "Home",
  data() {
    return {
      projectName: "",
      projects: [],
    };
  },
  created() {
    this.getProjects();
  },
  methods: {
    async addProject() {
      if (this.projectName.length != 0) {
        try {
          await axios.post("/api/projects", {
            title: this.projectName,
          });
          this.projectName = "";
          await this.getProjects();
        } catch (error) {
          console.log(error);
        }
      }
    },
    async getProjects() {
      try {
        const response = await axios.get("/api/projects");
        this.projects = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async deleteProject(project) {
      try {
        await axios.delete(`/api/projects/${project._id}`);
        await this.getProjects();
      } catch (error) {
        console.log(error);
      }
    },
  },
  components: {
    Project,
    Footer,
  },
};
</script>

<style scoped>
.main-content {
  width: 90%;
  margin: 0 auto;
}

.add-project-form {
  margin-bottom: 20px;
}

.welcome h1,
.welcome p {
  width: fit-content;
  margin: 0 auto;
  color: whitesmoke;
  font-family: "Nanum Gothic", sans-serif;
}

.welcome h1 {
  letter-spacing: 10px;
  padding-left: 10px;
}

.welcome {
  padding-top: 50px;
  padding-bottom: 50px;
  background-color: #ce3d35;
  margin-bottom: 20px;
}

.welcome-box {
  width: fit-content;
  margin: 0 auto;
  padding: 20px;
  border-width: 2px;
  border-style: solid;
  border-color: whitesmoke;
}
</style>
