import Vuex from 'vuex'
import {auth, db} from '../firebase'
import Vue from "vue";

Vue.use(Vuex)

function sortQuestions(a, b) {
    console.log(a.data.no - b.data.no)
    if (a.data.no && b.data.no) {
        return a.data.no - b.data.no
    } else {
        return -1
    }
}

const store = new Vuex.Store({
    state: {
        user: null,
        profile: {},
        questions: []
    },
    mutations: {
        setUser(state, payload) {
            state.user = payload
        },
        setProfile(state, payload) {
            state.profile = payload
        },
        addQuestion(state, question) {
            state.questions.push(question)
        },
        clearQuestions(state) {
            state.questions = []
        },
        sortQuestions(state) {
            state.questions.sort(sortQuestions)
        }
    },
    actions: {
        loadQuestion({commit}, sessionId) {
            commit('clearQuestions')
            db.collection('questions')
                .where('sessionId', '==', sessionId)
                .get().then((snapshot) => {
                snapshot.docs.forEach((q) => {
                    commit('addQuestion', {
                        id: q.id,
                        data: q.data()
                    })
                })
            })
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
            if (data.group == "EQA") {
                await db.collection('eqa_profile')
                    .where('email', '==', auth.currentUser.email)
                    .get().then(snapshot=>{
                    if (snapshot.docs.length > 0) {
                        let data = snapshot.docs[0].data()
                        commit('setProfile', data)
                        console.log(data, 'Store')
                    }
                })
            }
        },
        signOut({commit}) {
            commit('setUser', null)
            commit('setProfile', {})
        }
    }
})

export default store;