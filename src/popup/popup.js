import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App';

library.add(faQuestionCircle, faSearch);
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(BootstrapVue);

new Vue({
    el: '#app',
    render: h => h(App)
});
