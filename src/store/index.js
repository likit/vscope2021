import Vuex from 'vuex'
import {db} from '../firebase'
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
        questions: []
    },
    mutations: {
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
                .get().then((snapshot)=>{
                snapshot.docs.forEach((q)=>{
                    commit('addQuestion', {
                        id: q.id,
                        data: q.data()
                    })
                })
            })
        }
    }
})

export default store;