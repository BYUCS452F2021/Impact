import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
let data = {
  user: null
}
console.log(data);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
