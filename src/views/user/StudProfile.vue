<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column is-one-third is-offset-4 box">
          <h1 class="title has-text-centered">Student Profile</h1>
          <b-field label="คำนำหน้า">
            <b-input v-model="profile.title"></b-input>
          </b-field>
          <b-field label="ชื่อ">
            <b-input v-model="profile.firstname"></b-input>
          </b-field>
          <b-field label="นามสกุล">
            <b-input v-model="profile.lastname"></b-input>
          </b-field>
          <b-field label="รหัสนักศึกษา">
            <b-input v-model="profile.studentId"></b-input>
          </b-field>
          <b-field label="ชั้นเรียน">
            <b-input v-model="profile.classroom"></b-input>
          </b-field>
          <b-field label="สถาบัน">
            <b-input v-model="profile.affiliation"></b-input>
          </b-field>
          <div class="buttons is-centered">
            <button class="button is-light" @click="$router.push({ name: 'MainPage' })">Cancel</button>
            <button class="button is-success" @click="save">Save</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {db} from '../../firebase'
import NavMenu from "../../components/navMenu";

export default {
  name: "EQAProfile",
  components: {NavMenu},
  data () {
    return {
      profile: {
        firstname: null,
        lastname: null,
        studentId: null,
        email: this.$store.state.user.email,
        affiliation: null,
        classroom: null,
      }
    }
  },
  methods: {
    save () {
      const self = this
      db.collection('student_profile')
          .where('email', '==', self.$store.state.user.email)
          .get().then(snapshot=>{
        if (snapshot.docs.length > 0) {
          db.collection('student_profile').doc(snapshot.docs[0].id).update(self.profile).then(()=>{
            self.$store.dispatch('setProfile', self.profile)
            self.$buefy.toast.open({
              message: "Data has been saved",
              type: "is-success"
            })
          }).catch(e=>{
            self.$buefy.toast.open({
              message: e.toString(),
              type: "is-danger"
            })
          })
        } else {
          db.collection('student_profile').add(self.profile).then(()=>{
            self.$store.dispatch('setProfile', self.profile)
            self.$buefy.toast.open({
              message: "Data has been added",
              type: "is-success"
            })
          }).catch(e=>{
            self.$buefy.toast.open({
              message: e.toString(),
              type: "is-danger"
            })
          })
        }
      })
    },
    load () {
      const self = this
      db.collection('student_profile')
          .where('email', '==', self.$store.state.user.email)
          .get().then(snapshot=>{
        if (snapshot.docs.length > 0) {
          let data = snapshot.docs[0].data()
          self.profile.affiliation = data.affiliation
          self.profile.classroom = data.lab
          self.profile.firstname = data.firstname
          self.profile.lastname = data.lastname
          self.profile.studentId = data.position
          self.profile.title = data.title
        }
      })
    }
  },
  mounted() {
    this.load()
  }
}
</script>

<style scoped>

</style>
