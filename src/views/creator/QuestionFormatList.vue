<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title has-text-centered">
          Question Formats
        </h1>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="panel is-link">
          <div class="panel-block">
            <a>
              MCQ with Images and Videos Support
            </a>
          </div>
          <div class="panel-block">
            <a>
              Ordering
            </a>
          </div>
          <div class="panel-block">
            <router-link :to="{name: 'PhlebotomySimEdit', params: {sessionId: sessionId}}">
              Phlebotomy Simulation Practice
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import {auth} from '../../firebase'
import NavMenu from "../../components/navMenu"

export default {
  name: "QuestionFormatList",
  components: {NavMenu},
  data() {
    return {
      isLoggedIn: false,
      sessionId: null
    }
  },
  mounted() {
    // const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.sessionId = this.$route.params.sessionId
  }
}
</script>

<style scoped>

</style>