import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faBars, faAngleUp, faAngleDown, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App';

library.add(faSearch, faBars, faAngleUp, faAngleDown, faInfoCircle);
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(BootstrapVue);

new Vue({
    el: '#app',
    render: h => h(App)
});
