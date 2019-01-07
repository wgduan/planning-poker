import Vue from 'vue'
import iView from 'iview/dist/iview';
//import { Button } from 'iview'
//import lang from 'iview/dist/locale/en-US'
import {
    locale
} from 'iview'
import 'iview/dist/styles/iview.css'

//Vue.component('Button', Button)
//locale(lang)

Vue.use(iView, {
    locale
});