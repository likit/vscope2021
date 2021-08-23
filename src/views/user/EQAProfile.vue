<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column is-one-third is-offset-4 box">
          <h1 class="title has-text-centered">EQA Profile</h1>
          <b-field label="คำนำหน้า">
            <b-input v-model="profile.title"></b-input>
          </b-field>
          <b-field label="ชื่อ">
            <b-input v-model="profile.firstname"></b-input>
          </b-field>
          <b-field label="นามสกุล">
            <b-input v-model="profile.lastname"></b-input>
          </b-field>
          <b-field label="ตำแหน่ง">
            <b-input v-model="profile.position"></b-input>
          </b-field>
          <b-field label="ห้องปฏิบัติการ">
            <b-input v-model="profile.lab"></b-input>
          </b-field>
          <b-field label="สังกัด">
            <b-input v-model="profile.affiliation" placeholder="เช่น โรงพยาบาล สถานพยาบาล คลินิกแลบ"></b-input>
          </b-field>
          <div class="buttons is-centered">
            <button class="button is-light" @click="$router.push({ name: 'MainPage' })">Cancel</button>
            <button class="button is-success" @click="save">Save</button>
          </div>
          <pre>
            {{ $store.state.profile }}
          </pre>
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
        position: null,
        email: this.$store.state.user.email,
        affiliation: null,
        lab: null,
      }
    }
  },
  methods: {
    save () {
      const self = this
      db.collection('eqa_profile')
          .where('email', '==', self.$store.state.user.email)
          .get().then(snapshot=>{
        if (snapshot.docs.length > 0) {
          db.collection('eqa_profile').doc(snapshot.docs[0].id).update(self.profile).then(()=>{
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
          db.collection('eqa_profile').add(self.profile).then(()=>{
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
      db.collection('eqa_profile')
          .where('email', '==', self.$store.state.user.email)
          .get().then(snapshot=>{
        if (snapshot.docs.length > 0) {
          let data = snapshot.docs[0].data()
          self.profile.affiliation = data.affiliation
          self.profile.lab = data.lab
          self.profile.firstname = data.firstname
          self.profile.lastname = data.lastname
          self.profile.position = data.position
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