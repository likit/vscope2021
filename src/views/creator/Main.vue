<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-one-third is-offset-4">
        <h2 class="title">Welcome the creator!</h2>
        <div class="panel">
          <div class="panel-heading">
            Menu
          </div>
          <router-link class="panel-block" :to="{ name: 'ProgramList' }">
            <span class="panel-icon">
              <i class="fas fa-book" aria-hidden="true"></i>
            </span>
            Programs
          </router-link>
          <router-link class="panel-block" :to="{ name: 'MediaList' }">
            <span class="panel-icon">
              <i class="far fa-file-image"></i>
            </span>
            Photos
          </router-link>
          <router-link class="panel-block" :to="{ name: 'VideoList' }">
            <span class="panel-icon">
              <i class="fab fa-youtube"></i>
            </span>
            Videos
          </router-link>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import NavMenu from "../../components/navMenu"
import {auth} from '../../firebase'

export default {
  name: "CreatorMain",
  data() {
    return {
      isLoggedIn: false
    }
  },
  components: {NavMenu},
  mounted() {
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
  }
}
</script>

<style scoped>

</style>