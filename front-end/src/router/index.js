import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Graphs from '../views/Graphs.vue'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/graphs',
    name: 'Graphs',
    component: Graphs
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
