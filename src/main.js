import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import router from './router'
import 'buefy/dist/buefy.css'

const createjs = window.createjs;

Vue.use(Buefy)
Vue.config.productionTip = false
Vue.prototype.createjs = createjs

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
