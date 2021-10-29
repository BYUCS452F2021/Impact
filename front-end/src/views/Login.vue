<template>
  <div class="login">
    <div class="reg-log-wrap">
      <div class="login-wrap">
        <form class="pure-form">
          <fieldset>
            <legend>Login</legend>
            <input placeholder="username" v-model="usernameLogin" />
            <input
              type="password"
              placeholder="password"
              v-model="passwordLogin"
            />
          </fieldset>
          <fieldset>
            <button
              type="submit"
              class="pure-button pure-button-primary"
              @click.prevent="login"
            >
              Login
            </button>
          </fieldset>
        </form>
      </div>
      <p v-if="errorLogin" class="error">{{ errorLogin }}</p>
      <div class="register-wrap">
        <form class="pure-form">
          <fieldset>
            <legend>Register for an account</legend>
            <input placeholder="company name" v-model="companyName" />
          </fieldset>
          <fieldset>
            <input placeholder="username" v-model="username" />
            <input type="password" placeholder="password" v-model="password" />
          </fieldset>
          <fieldset>
            <button
              type="submit"
              class="pure-button pure-button-primary"
              @click.prevent="register"
            >
              Register
            </button>
          </fieldset>
        </form>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      
    </div>
  </div>
</template>



<script>
import axios from "axios";
export default {
  name: "Login",
  data() {
    return {
      companyName: "",
      username: "",
      password: "",
      usernameLogin: "",
      passwordLogin: "",
      error: "",
      errorLogin: "",
    };
  },
  async created() {
    try {
      let response = await axios.get("/api/companies");
      this.$root.$data.company = response.data.company;
    } catch (error) {
      this.$root.$data.company = null;
    }
  },
  methods: {
    async register() {
      this.error = "";
      this.errorLogin = "";
      console.log("register hit");
      if (!this.companyName || !this.username || !this.password) {
        console.log("returning");
        return;
      }
      try {
        let response = await axios.post("/api/companies", {
          companyName: this.companyName,
          username: this.username,
          password: this.password,
        });
        console.log(response);
        this.$root.$data.company = response.data.company;
        this.$router.push({ name: "Launchpad" });
      } catch (error) {
        this.error = error.response.data.message;
        this.$root.$data.user = null;
      }
    },
    async login() {
      if (!this.usernameLogin || !this.passwordLogin) return;
      try {
        let response = await axios.post("/api/companies/login", {
          username: this.usernameLogin,
          password: this.passwordLogin,
        });
        this.$root.$data.company = response.data.company;
        this.$router.push({ name: "Launchpad" });
      } catch (error) {
        this.errorLogin = "Error: " + error.response.data.message;
        this.$root.$data.user = null;
      }
    },
  },
};
</script>

<style scoped>
.home {
  background-color: white;
  color: #222629;
  width: fit-content;
  margin: 0 auto;
}
.pure-form {
  font-size: 1.5rem;
  padding: 1rem;
  margin: 0 1rem;
}

.reg-log-wrap {
  display: grid;
  grid-template: auto / 1fr 1fr;
}
</style>
