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

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}

const store = new Vuex.Store({
    state: {
        user: null,
        profile: {},
        sessionId: null,
        recordId: null,
        questions: [],
        answers: [],
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
        setRecordId(state, Id) {
            state.recordId = Id
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
        shuffleQuestions(state) {
            shuffle(state.questions)
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
        }
    },
    actions: {
        async loadQuestion({commit}, sessionId, shuffle=false) {
            console.log(shuffle)
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
                    if (shuffle) {
                        commit('shuffleQuestions')
                        console.log('questions have been shuffled.')
                    } else {
                        commit('sortQuestions')
                    }
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
        setRecordId({commit}, payload) {
            commit('setRecordId', payload)
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