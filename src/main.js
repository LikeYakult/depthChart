// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import dateformat from 'dateformat';
import App from './App';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.prototype.$date = dateformat;

Vue.prototype.$dateFormat = {
  default: 'yyyy-mm-dd HH:MM:ss', // 默认日期
  ordersDateFormat: "mm/dd HH:MM", // 订单日期
  years: "yyyy-mm-dd",
  seconds: "HH:MM:ss"
};

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
