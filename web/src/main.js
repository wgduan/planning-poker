import Vue from 'vue'
import App from './App.vue'
import './plugins/iview'
import router from './plugins/router'
import './libs/array-polyfill'
import 'promise-polyfill/src/polyfill';

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')