import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


export default new Router({
  mode: 'history',
  routes: [{
      name: 'home',
      path: '/',
      meta: {
        title: 'Home'
      },
      component: () => import( /* webpackChunkName: "home" */ '../views/Home.vue')
    },
    {
      name: 'session',
      path: '/:id',
      meta: {
        title: 'Home'
      },
      component: () => import( /* webpackChunkName: "home" */ '../views/Home.vue')
    },

  ]
})

// export default new Router({
//   //mode: 'history',
//   routes: [{
//       path: '/',
//       name: 'home',
//       component: Home
//     },
//     {
//       path: '/about',
//       name: 'about',
//       // route level code-splitting
//       // this generates a separate chunk (about.[hash].js) for this route
//       // which is lazy-loaded when the route is visited.
//       component: () => import( /* webpackChunkName: "about" */ '../views/About.vue')
//     }
//   ]
// })