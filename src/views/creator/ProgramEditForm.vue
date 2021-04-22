<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column has-text-centered">
        <h1 class="title">New Program</h1>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-third is-offset-4 box">
        <b-field label="ชื่อ" type="is-danger" message="required">
          <b-input v-model="name"></b-input>
        </b-field>
        <b-field label="สาขา" type="is-danger" message="required">
          <b-select placeholder="เลือกสาขา" v-model="discipline">
            <option v-for="option in disciplines" :value="option" :key="option">
              {{ option }}
            </option>
          </b-select>
        </b-field>
        <div class="buttons is-centered">
          <button class="button is-light" @click="$router.push({ name: 'ProgramList' })">
            <span class="icon">
              <i class="fas fa-chevron-left"></i>
            </span>
            <span>Back</span>
          </button>
          <button class="button is-success" @click="saveData">
            <span class="icon">
              <i class="far fa-save"></i>
            </span>
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import NavMenu from "../../components/navMenu";
import {auth, db} from "../../firebase";

export default {
  name: "ProgramEditForm",
  components: {NavMenu},
  data() {
    return {
      name: null,
      discipline: null,
      disciplines: [],
      isLoggedIn: false
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    db.collection('disciplines').get().then((snapshot)=>{
      snapshot.docs.forEach((d)=>{
        self.disciplines.push(d.data().discipline)
      })
    })
  },
  methods: {
    saveData: function () {
      const self = this
      if (self.name && self.discipline) {
        db.collection('programs')
            .where('name', '==', this.name)
            .where('discipline', '==', self.discipline)
            .get().then((snapshot)=>{
          if (snapshot.docs.length == 0) {
            db.collection('programs').add({
              name: self.name,
              creator: auth.currentUser.email,
              createdAt: new Date(),
              discipline: self.discipline,
            }).then(()=>{
              self.$buefy.toast.open({
                message: 'Data saved successfully',
                type: 'is-success'
              })
              self.$router.push({ name: 'ProgramList' })
            }).catch((error)=>{
              self.$buefy.toast.open({
                message: error.toString(),
                type: 'is-success'
              })
            })
          } else {
            self.$buefy.dialog.alert({
              message: 'ชื่อโปรแกรมนี้ถูกใช้แล้วในสาขานี้',
              type: 'is-danger',
              hasIcon: true,
              icon: 'times-circle',
              iconPack: 'fa',
              ariaRole: 'alertdialog',
              ariaModal: true
            })
          }
        })
      } else {
        self.$buefy.dialog.alert({
          message: 'กรุณากรอกข้อมูลให้ครบ',
          type: 'is-danger',
          hasIcon: true,
          icon: 'times-circle',
          iconPack: 'fa',
          ariaRole: 'alertdialog',
          ariaModal: true
        })
      }
    }
  }
}
</script>

<style scoped>

</style>