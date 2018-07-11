// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Buefy from 'buefy'
// import 'buefy/lib/buefy.css'
import './assets/lib/font-awesome-4.7.0/css/font-awesome.min.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import AsyncComputed from 'vue-async-computed'

Vue.config.productionTip = false
Vue.use(Buefy, {
  defaultIconPack: 'fa'
})
Vue.use(VueAxios, axios)
Vue.use(AsyncComputed)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
