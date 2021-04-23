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
        path: '/creator/media-browser',
        name: 'MediaBrowser',
        meta: {
            title: 'Media Browser',
            requiresAuth: true
        },
        component: () => import('../views/creator/MediaBrowser.vue')
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
    },
    {
        path: '/creator/lesson/info',
        name: 'LessonInfo',
        meta: {
            title: 'Lesson Info',
            requiresAuth: true
        },
        component: () => import('../views/creator/LessonInfo.vue')
    },
    {
        path: '/creator/lesson/form',
        name: 'LessonEditForm',
        meta: {
            title: 'Lesson Edit Form',
            requiresAuth: true
        },
        component: () => import('../views/creator/LessonEditForm.vue')
    },
    {
        path: '/creator/session/info',
        name: 'SessionInfo',
        meta: {
            title: 'Session Info',
            requiresAuth: true
        },
        component: () => import('../views/creator/SessionInfo.vue')
    },
    {
        path: '/creator/session/edit',
        name: 'SessionEdit',
        meta: {
            title: 'Session Edit',
            requiresAuth: true
        },
        component: () => import('../views/creator/SessionEdit.vue')
    },
    {
        path: '/creator/questions/info',
        name: 'QuestionInfo',
        meta: {
            title: 'Question Info',
            requiresAuth: true
        },
        component: () => import('../views/creator/QuestionInfo.vue')
    },
    {
        path: '/creator/question/edit',
        name: 'QuestionEditForm',
        meta: {
            title: 'Question Edit Form',
            requiresAuth: true
        },
        component: () => import('../views/creator/QuestionEditForm.vue')
    },
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