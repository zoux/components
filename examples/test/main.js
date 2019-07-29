import Vue from 'vue'
import App from './App.vue'

// 全量引入
import components from '~'
Vue.use(components)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
