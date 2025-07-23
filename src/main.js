import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'
import './assets/main.css'
import FontAwesomeIcon from './plugins/fontAwesome'

import { setRouter } from '@/services/api'

const app = createApp(App)

// Set the router for API services
setRouter(router)

app.component('font-awesome-icon', FontAwesomeIcon) // Register FontAwesomeIcon globally
app.use(router)
app.use(VueTelInput) // Register the plugin globally

app.mount('#app')
