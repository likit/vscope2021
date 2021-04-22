import Vue from 'vue'
import VueRouter from 'vue-router'
import {auth} from '../firebase'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'MainPage',
        meta: {
            title: 'Main Page',
        },
        component: () => import('../views/Main.vue')
    },
    {
        path: '/login',
        name: 'LogIn',
        meta: {
            title: 'Log In Page',
        },
        component: () => import('../views/Login.vue')
    },
    {
        path: '/creator',
        name: 'CreatorMain',
        meta: {
            title: 'Creator Main Page',
            requiresAuth: true
        },
        component: () => import('../views/creator/Main.vue')
    },
    {
        path: '/creator/program-list',
        name: 'ProgramList',
        meta: {
            title: 'Program List',
            requiresAuth: true
        },
        component: () => import('../views/creator/ProgramList.vue')
    },
    {
        path: '/creator/program-info',
        name: 'ProgramInfo',
        meta: {
            title: 'Program Info',
            requiresAuth: true
        },
        component: () => import('../views/creator/ProgramInfo.vue')
    },
    {
        path: '/creator/media',
        name: 'MediaList',
        meta: {
            title: 'Media List',
            requiresAuth: true
        },
        component: () => import('../views/creator/MediaList.vue')
    },
    {
        path: '/creator/media',
        name: 'MediaUpload',
        meta: {
            title: 'Media Upload',
            requiresAuth: true
        },
        component: () => import('../views/creator/MediaUpload.vue')
    },
    {
        path: '/creator/program/form',
        name: 'ProgramEditForm',
        meta: {
            title: 'Program Edit Form',
            requiresAuth: true
        },
        component: () => import('../views/creator/ProgramEditForm.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach((to, from , next)=>{
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth)
    if(requiresAuth === true && auth.currentUser === null) {
        next('/login')
    } else {
        next()
    }
})

export default router