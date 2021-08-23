<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column is-one-third is-offset-4 box">
          <h1 class="title has-text-centered">EQA Profile</h1>
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