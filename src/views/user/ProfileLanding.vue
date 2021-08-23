<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column has-text-centered">
          <h1 class="title">Select Your Group</h1>
        </div>
      </div>
      <div class="columns">
        <div class="column is-one-third is-offset-4">
          <nav class="panel">
            <a class="panel-block" @click="setGroup('student')">
              <span class="panel-icon">
                <i class="fas fa-users"></i>
              </span>
              Student
            </a>
            <a class="panel-block" @click="setGroup('EQA')">
              <span class="panel-icon">
                <i class="fas fa-users"></i>
              </span>
              EQA Members
            </a>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";
import {db} from "../../firebase";

export default {
  name: "ProfileLanding",
  components: {NavMenu},
  methods: {
    setGroup(group) {
      const self = this
      db.collection('email_group_pairs')
          .where('email', '==', self.$store.state.user.email)
          .where('group', '==', group)
          .get().then(snapshot => {
        if (snapshot.docs.length == 0) {
          db.collection('email_group_pairs').add({
            email: self.$store.state.user.email,
            group: group,
          }).then(() => {
            if (group == 'EQA')
              self.$router.push({name: 'EQAProfile'})
            else if (group == 'student')
              self.$router.push({name: 'StudProfile'})
          })
        } else {
          if (group == 'EQA')
            self.$router.push({name: 'EQAProfile'})
          else if (group == 'student')
            self.$router.push({name: 'StudProfile'})
        }
      })
    }
  }
}
</script>

<style scoped>

</style>