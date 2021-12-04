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
        <h2 class="subtitle" v-if="$store.getters.isUserLoggedIn">You're {{ displayName }}
          <a @click="logout">(Not you?)</a>
        </h2>
        <h3 class="title is-size-5" v-if="$store.state.isAdmin === true">You are an admin.</h3>
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-centered">
        <div class="buttons is-centered">
          <a class="button is-light">About</a>
          <router-link class="button is-primary" :to="{name: 'UserProgramList'}">
              <span class="icon">
                <i class="fas fa-play-circle"></i>
              </span>
            <span>Programs</span>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import NavMenu from "../components/navMenu"
import {auth} from '../firebase'
import {mapGetters} from "vuex";

export default {
  name: "Main",
  components: {NavMenu},
  computed: {
    ...mapGetters(['displayName'])
  },
  methods: {
    logout: function () {
      let self = this
      auth.signOut().catch(function(error) {
        self.$buefy.toast.open(
            {
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