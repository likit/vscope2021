import Vuex from 'vuex'
import {auth, db} from '../firebase'
import Vue from "vue";

Vue.use(Vuex)

function sortQuestions(a, b) {
    if (a.data.no && b.data.no) {
        return parseInt(a.data.no) - parseInt(b.data.no)
    } else {
        return -1
    }
}

const store = new Vuex.Store({
    state: {
        user: null,
        profile: {},
        sessionId: null,
        lessionId: null,
        recordId: null,
        sesAnswer: null,
        setAnswer: null,
        tet: null,
        tes: null,
        svsAnswer: null,
        questions: [],
        answers: [],
        lessonStartDateTime: null,
        isAdmin: false
    },
    getters: {
        isUserLoggedIn: state => {
            return state.user !== null
        },
        displayName: state => {
            return state.user.displayName
        },
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload
        },
        setProfile(state, payload) {
            state.profile = payload
        },
        setSessionId(state, Id) {
            state.sessionId = Id
        },
        setLessonId(state, Id) {
            state.lessonId = Id
        },
        setRecordId(state, Id) {
            state.recordId = Id
        },
        setSesAnswer(state, answer) {
            state.sesAnswer = answer
        },
        setSetAnswer(state, answer) {
            state.setAnswer = answer
        },
        setSvsAnswer(state, answer) {
            state.svsAnswer = answer
        },
        setTet(state, answer) {
            state.tet = answer
        },
        setTes(state, answer) {
            state.tes = answer
        },
        setLessonStartDateTime(state) {
            state.lessonStartDateTime = new Date()
        },
        addQuestion(state, question) {
            state.questions.push(question)
        },
        clearAnswers(state) {
            state.answers = []
        },
        clearQuestions(state) {
            state.questions = []
        },
        sortQuestions(state) {
            state.questions.sort(sortQuestions)
        },
        setAdmin(state, payload) {
            state.isAdmin = payload
        },
        reset(state) {
            state.user = null
            state.profile = {}
            state.sessionId = null
            state.questions = []
            state.answers = []
            state.sesAnswer = null
            state.setAnswer = null
            state.setLessonStartDateTime = null
        }
    },
    actions: {
        async loadQuestion({commit}, sessionId) {
            commit('clearQuestions')
            await db.collection('questions')
                .where('sessionId', '==', sessionId)
                .get().then((snapshot) => {
                    snapshot.docs.forEach((q) => {
                        if (q.data().deleted !== true) {
                            commit('addQuestion', {
                                id: q.id,
                                data: q.data()
                            })
                        }
                    })
                })
        },
        async signIn({commit}) {
            commit('setUser', auth.currentUser)
            let data
            await db.collection('admins')
                .where('email', '==', auth.currentUser.email)
                .get().then(snapshot => {
                    if (!snapshot.empty) {
                        commit('setAdmin', true)
                    } else {
                        commit('setAdmin', false)
                    }
                })
            await db.collection('email_group_pairs')
                .where('email', '==', auth.currentUser.email)
                .get().then(snapshot => {
                    if (snapshot.docs.length > 0) {
                        data = snapshot.docs[0].data()
                    }
                })
            if (data !== undefined)
                if (data.group == "EQA") {
                    await db.collection('eqa_profile')
                        .where('email', '==', auth.currentUser.email)
                        .get().then(snapshot => {
                            if (snapshot.docs.length > 0) {
                                let data = snapshot.docs[0].data()
                                commit('setProfile', data)
                            }
                        })
                } else if (data.group == "student") {
                    await db.collection('student_profile')
                        .where('email', '==', auth.currentUser.email)
                        .get().then(snapshot => {
                            if (snapshot.docs.length > 0) {
                                let data = snapshot.docs[0].data()
                                commit('setProfile', data)
                            }
                        })
                }
        },
        signOut({commit}) {
            commit('setUser', null)
            commit('setProfile', {})
        },
        setSessionId({commit}, sessionId) {
            commit('setSessionId', sessionId)
        },
        setLessonId({commit}, lessonId) {
            commit('setLessonId', lessonId)
        },
        setRecordId({commit}, payload) {
            commit('setRecordId', payload)
        },
        setLessonSES({commit}, answer) {
            commit('setSesAnswer', answer)
        },
        setLessonSET({commit}, answer) {
            commit('setSetAnswer', answer)
        },
        setLessonSVS({commit}, answer) {
            commit('setSvsAnswer', answer)
        },
        setLessonTET({commit}, answer) {
            commit('setTet', answer)
        },
        setLessonTES({commit}, answer) {
            commit('setTes', answer)
        },
        setLessonStartDateTime({commit}) {
            commit('setLessonStartDateTime')
        },
        setProfile({commit}, profile) {
            commit('setProfile', profile)
        },
        clearQuestions({commit}) {
            commit('clearQuestions')
        },
        clearAnswers({commit}) {
            commit('clearAnswers')
        },
        reset({commit}) {
            commit('reset')
        }
    }
})

export default store;