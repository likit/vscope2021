<template>
<div>
  <nav-menu></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column has-text-centered">
        <img src="../assets/microscope.png" width="200">
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-centered">
        <h1 class="title">Welcome to Virtual Microscope Platform</h1>
        <h2 class="subtitle" v-if="isLoggedIn">You're {{ displayName }}
          <a @click="logout">(Not you?)</a>
        </h2>
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-centered">
        <div class="buttons is-centered">
          <a class="button is-light">About</a>
          <a class="button is-primary" @click="$router.push({ name: 'UserProgramList'})">
              <span class="icon">
                <i class="fas fa-play-circle"></i>
              </span>
            <span>Programs</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import NavMenu from "../components/navMenu"
import {auth} from '../firebase'

export default {
  name: "Main",
  components: {NavMenu},
  data() {
    return {
      displayName: null,
      isLoggedIn: false
    }
  },
  methods: {
    logout: function () {
      let self = this
      auth.signOut()
          .then(function() {
            self.$buefy.toast.open({
              message: 'Logged out successfully',
              type: 'is-success'
            })
            self.$router.push({ name: 'LogIn' })
          })
          .catch(function(error) {
            self.$buefy.toast.open({
              message: error.toString(),
              type: 'is-danger'
            })
          });
    }
  }
}
</script>

<style scoped>

</style>