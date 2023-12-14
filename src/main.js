import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from './store';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.use(Vuetify);

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
