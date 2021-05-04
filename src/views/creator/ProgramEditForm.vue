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
        <b-field label="เผยแพร่">
          <b-switch v-model="published"></b-switch>
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
      programId: null,
      name: null,
      originalName: null,
      published: null,
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
    if (this.$route.params.programId) {
      this.programId = this.$route.params.programId
      db.collection('programs').doc(this.programId).get().then((snapshot)=>{
        if (snapshot.exists) {
          let data = snapshot.data()
          self.name = data.name
          self.discipline = data.discipline
          self.published = data.published || false
          self.originalName = data.name
        }
      })
    }
    db.collection('disciplines').get().then((snapshot)=>{
      snapshot.docs.forEach((d)=>{
        self.disciplines.push(d.data().discipline)
      })
    })
  },
  methods: {
    incompleteData() {
      self.$buefy.dialog.alert({
        message: 'กรุณากรอกข้อมูลให้ครบ',
        type: 'is-danger',
        hasIcon: true,
        icon: 'times-circle',
        iconPack: 'fa',
        ariaRole: 'alertdialog',
        ariaModal: true
      })
    },
    existingData() {
      self.$buefy.dialog.alert({
        message: 'ชื่อโปรแกรมนี้ถูกใช้แล้วในสาขานี้',
        type: 'is-danger',
        hasIcon: true,
        icon: 'times-circle',
        iconPack: 'fa',
        ariaRole: 'alertdialog',
        ariaModal: true
      })
    },
    saveData: function () {
      const self = this
      if (self.programId === null) {
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
                published: self.published,
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
              self.existingData()
            }
          })
        } else {
          self.incompleteData()
        }
      } else {
        if (self.name && self.discipline) {
          db.collection('programs')
              .where('name', '==', this.name)
              .where('discipline', '==', self.discipline)
              .get().then((snapshot)=>{
                if (self.originalName == self.name || snapshot.docs.length == 0) {
                  db.collection('programs').doc(self.programId).update({
                    name: self.name,
                    discipline: self.discipline,
                    published: self.published,
                  }).then(()=>{
                    self.$buefy.toast.open({
                      message: 'Updated data successfully',
                      type: 'is-success'
                    })
                  }).catch((e)=>{
                    self.$buefy.toast.open({
                      message: e.toString(),
                      type: 'is-danger'
                    })
                  })
                } else {
                  self.existingData()
                }
          })
        } else {
          self.incompleteData()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>