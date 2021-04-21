<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn"></nav-menu>
  <section class="section">
    <h2 class="title">Welcome the creator!</h2>
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