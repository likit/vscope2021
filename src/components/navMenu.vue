<template>
  <b-navbar type="is-light">
    <template #brand>
    </template>
    <template #start>
      <b-navbar-item :to="{ name: 'MainPage' }" tag="router-link">
        Home
      </b-navbar-item>
      <b-navbar-dropdown label="Programs">
        <b-navbar-item href="#">
          Main Page
        </b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-dropdown label="Creator">
        <b-navbar-item :to="{ name:  'CreatorMain'}" tag="router-link">
          Main Page
        </b-navbar-item>
      </b-navbar-dropdown>
    </template>

    <template #end>
      <b-navbar-item tag="div">
        <div class="buttons">
          <a class="button is-primary">
            <strong>Sign up</strong>
          </a>
          <router-link class="button is-info" :to="{ name: 'LogIn' }" v-if="!isLoggedIn">
            Log in
          </router-link>
          <button class="button is-danger" @click="logout" v-else>
            Log Out
          </button>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
import {auth} from '../firebase'

export default {
  name: "navMenu",
  props: ['isLoggedIn'],
  methods: {
    logout: function () {
      let self = this
      auth.signOut()
        .then(function() {
          self.$buefy.toast.open({
            message: 'Logged out successfully',
            type: 'is-success'
          })
          self.$emit('logout')
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