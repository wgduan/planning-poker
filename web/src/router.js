const routers = [{
        name: 'home',
        path: '/',
        meta: {
            title: 'Home'
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    },
    {
        name: 'home',
        path: '/:id',
        meta: {
            title: 'Home'
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    },
    {
        path: '/session/:id',
        meta: {
            title: 'Session'
        },
        component: (resolve) => require(['./views/session.vue'], resolve)
    },
];
export default routers;