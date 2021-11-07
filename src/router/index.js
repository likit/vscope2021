import Vue from 'vue'
import VueRouter from 'vue-router'
import store from "../store";

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
        path: '/profile-landing',
        name: 'ProfileLanding',
        meta: {
            title: 'Profile Landing',
            requiresAuth: true
        },
        component: () => import('../views/user/ProfileLanding')
    },
    {
        path: '/eqa-profile',
        name: 'EQAProfile',
        meta: {
            title: 'EQA Profile',
            requiresAuth: true
        },
        component: () => import('../views/user/EQAProfile')
    },
    {
        path: '/stud-profile',
        name: 'StudProfile',
        meta: {
            title: 'Student Profile',
            requiresAuth: true
        },
        component: () => import('../views/user/StudProfile')
    },
    {
        path: '/account',
        name: 'Account',
        meta: {
            title: 'Account',
            requiresAuth: true
        },
        component: () => import('../views/user/Account')
    },
    {
        path: '/account/records',
        name: 'Record',
        meta: {
            title: 'Record',
            requiresAuth: true
        },
        component: () => import('../views/user/Record')
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
        path: '/creator/videos',
        name: 'VideoList',
        meta: {
            title: 'Video List',
            requiresAuth: true
        },
        component: () => import('../views/creator/VideoList')
    },
    {
        path: '/creator/videos/upload',
        name: 'VideoUpload',
        meta: {
            title: 'Video Upload',
            requiresAuth: true
        },
        component: () => import('../views/creator/VideoUpload')
    },
    {
        path: '/creator/video-browser',
        name: 'VideoBrowser',
        meta: {
            title: 'Video Browser',
            requiresAuth: true
        },
        component: () => import('../views/creator/VideoBrowser')
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
        path: '/creator/lessons/:lessonId/info',
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
    {
        path: '/user/programs',
        name: 'UserProgramList',
        meta: {
            title: 'Programs',
            requiresAuth: true
        },
        component: () => import('../views/user/ProgramList.vue')
    },
    {
        path: '/user/programs/:programId/lessons',
        name: 'UserLessonList',
        meta: {
            title: 'Lessons',
            requiresAuth: true
        },
        component: () => import('../views/user/LessonList.vue')
    },
    {
        path: '/user/programs/:programId/lessons/:lessonId/sessions',
        name: 'UserSessionList',
        meta: {
            title: 'Sessions',
            requiresAuth: true
        },
        component: () => import('../views/user/SessionList.vue')
    },
    {
        path: '/user/programs/:programId/lessons/:lessonId/sessions/:sessionId/questions',
        name: 'UserQuestionList',
        meta: {
            title: 'Questions',
            requiresAuth: true
        },
        component: () => import('../views/user/QuestionList.vue')
    },
    {
        path: '/user/programs/:programId/lessons/:lessonId/sessions/:sessionId/questions/:questionNo',
        name: 'Question',
        meta: {
            title: 'Question',
            requiresAuth: true
        },
        component: () => import('../views/user/Question.vue')
    },
    {
        path: '/creator/preview/media',
        name: 'MediaPreview',
        meta: {
            title: 'Media Preview',
            requiresAuth: true
        },
        component: () => import('../views/creator/MediaPreview')
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach((to, from , next)=>{
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth)
    if(requiresAuth === true && store.state.user === null) {
        next('/login')
    } else {
        next()
    }
})

export default router