import firebase from '@firebase/app'
import '@firebase/firestore'
import '@firebase/storage'
import '@firebase/auth'

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

export {
    firebase,
    db,
    auth,
    storage,
}
