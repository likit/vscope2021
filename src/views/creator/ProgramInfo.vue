<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title">
          Program: {{ program.name }}
        </h1>
        <button class="button"
                @click="$router.push({ name: 'ProgramEditForm', params: { programId: program.id }})">
          <span class="icon">
            <i class="fas fa-edit"></i>
          </span>
          <span>edit</span>
        </button>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import {db, auth} from '../../firebase'
import NavMenu from "../../components/navMenu";

export default {
  name: "ProgramInfo",
  components: {NavMenu},
  data() {
    return {
      program: null,
      programId: null,
      isLoggedIn: false
    }
  },
  beforeMount() {
    let self = this
    if (auth.currentUser) {
      self.isLoggedIn = true
    }
    self.programId = this.$route.params.programId
    db.collection('programs').doc(self.programId).get().then((snapshot)=>{
      if (snapshot.exists) {
        self.program = snapshot.data()
      }
    })
  }
}
</script>

<style scoped>

</style>