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
      <b-navbar-item v-if="$store.state.user!=null">
        <span class="icon">
          <i class="fas fa-user-circle"></i>
        </span>
        <span>
          {{ $store.state.user.displayName }}
        </span>
      </b-navbar-item>
      <b-navbar-item tag="div">
        <div class="buttons">
          <router-link class="button is-info" :to="{ name: 'LogIn' }" v-if="$store.state.user==null">
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
      auth.signOut()
    }
  }
}
</script>

<style scoped>

</style>