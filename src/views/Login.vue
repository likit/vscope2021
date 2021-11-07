<template>
<div>
  <nav-menu></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-one-third is-offset-4 box has-text-centered">
        <h1 class="title">Log In</h1>
        <button @click="login" class="button is-rounded is-outlined is-danger">
          <span class="icon">
            <i class="fab fa-google"></i>
          </span>
          <span>Log In With Google Account</span>
        </button>
      </div>
    </div>
  </section>
</div>
</template>

<script>

import NavMenu from "../components/navMenu";
import {firebase, auth} from "../firebase";

export default {
  name: "Login",
  components: {NavMenu},
  methods: {
    login: function () {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(() => {
          this.$store.dispatch('signIn').then(()=>{
            if (JSON.stringify(this.$store.state.profile) === "{}") {
              this.$router.push({ name: 'ProfileLanding' })
            } else {
              this.$router.push({ name: 'MainPage' })
            }
          })
        })
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.email;
          const credential = error.credential;
          this.$buefy.dialog.alert({
            message: errorMessage,
            title: 'Login Failed',
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fa',
            ariaRole: 'alertdialog',
            ariaModal: true
          })
          console.log(errorCode, errorMessage, email, credential);
        })
    }
  }
}
</script>

<style scoped>

</style>