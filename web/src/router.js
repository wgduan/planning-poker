const routers = [{
        name: 'home',
        path: '/',
        meta: {
            title: 'Home'
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    },
    {
        name: 'session',
        path: '/:id',
        meta: {
            title: 'Home'
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    },

];
export default routers;