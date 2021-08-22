import firebase from '@firebase/app'
import '@firebase/firestore'
import '@firebase/storage'
import '@firebase/auth'
import {ToastProgrammatic} from "buefy";
import router from './router'
import store from "./store";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCFIMoAcQPRExSaFxQVK_L8NfwSUnaRKV0",
    authDomain: "virtual-microscope-b0953.firebaseapp.com",
    projectId: "virtual-microscope-b0953",
    storageBucket: "virtual-microscope-b0953.appspot.com",
    messagingSenderId: "59731035628",
    appId: "1:59731035628:web:7525f9b1beff69d4bcacc9",
    measurementId: "G-V90E251XQX"
};

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()
const auth = firebase.auth()
const storage = firebase.storage()

auth.onAuthStateChanged(user=>{
    if (user) {
        ToastProgrammatic.open({
            message: "You have logged in.",
            type: "is-success"
        })
    } else {
        store.dispatch('signOut').then(()=>{
            ToastProgrammatic.open({
                message: "You have logged out.",
            })
            router.push({ name: 'MainPage'})
        })
    }
});

export {
    firebase,
    db,
    auth,
    storage,
}
