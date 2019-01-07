import Vue from 'vue'
import iView from 'iview/dist/iview';
//import { Button } from 'iview'
import locale from 'iview/dist/locale/en-US'

import 'iview/dist/styles/iview.css'

//Vue.component('Button', Button)
//locale(lang)

Vue.use(iView, {
    locale
});