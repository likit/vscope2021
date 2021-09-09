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
        questions: [],
        answers: [],
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
        addQuestion(state, question) {
            state.questions.push(question)
        },
        clearQuestions(state) {
            state.questions = []
        },
        sortQuestions(state) {
            state.questions.sort(sortQuestions)
        },
        reset(state) {
            state.user = null
            state.profile = {}
            state.sessionId = null
            state.questions = []
            state.answers = []
        }
    },
    actions: {
        async loadQuestion({commit}, sessionId) {
            commit('clearQuestions')
            await db.collection('questions')
                .where('sessionId', '==', sessionId)
                .get().then((snapshot) => {
                snapshot.docs.forEach((q) => {
                    commit('addQuestion', {
                        id: q.id,
                        data: q.data()
                    })
                })
            })
            await commit('sortQuestions')
        },
        async signIn({commit}) {
            commit('setUser', auth.currentUser)
            let data
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
                        .get().then(snapshot=>{
                        if (snapshot.docs.length > 0) {
                            let data = snapshot.docs[0].data()
                            commit('setProfile', data)
                        }
                    })
                }
                else if (data.group == "student") {
                    await db.collection('student_profile')
                        .where('email', '==', auth.currentUser.email)
                        .get().then(snapshot=>{
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
        setProfile({commit}, profile) {
            commit('setProfile', profile)
        },
        clearQuestions({commit}) {
            commit('clearQuestions')
        },
        reset({commit}) {
            commit('reset')
        }
    }
})

export default store;