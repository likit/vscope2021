<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title has-text-centered">
          Phlebotomy Simulation
        </h1>
        <b-field label="Title">
          <b-input v-model="title"></b-input>
        </b-field>
        <b-field label="Arm with no tourniquet">
          <b-select placeholder="Select an image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="Arm with tourniquet">
          <b-select placeholder="Select Arm with tourniquet">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
      <button class="button is-success" @click="saveData">Save</button>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import {db, auth} from '../../firebase'
import NavMenu from "../../components/navMenu"

export default {
  name: "PhlebotomySimEdit",
  components: {NavMenu},
  data() {
    return {
      questionFormat: "PhlebotomySim",
      title: "",
      isLoggedIn: false,
      armWithTourniquetMediaId: null,
      armWithTouriquetMedia: null,
      armWithOutTourniquetMediaId: null,
      armWithOutTouriquetMedia: null,
      mediaList: [],
    }
  },
  methods: {
    saveData () {
      db.collection('questions').add({
        format: this.questionFormat,
        title: this.title,
        sessionId: this.sessionId,
        armWithTourniquetMediaId: this.armWithTourniquetMediaId,
        armWithOutTourniquetMediaId: this.armWithOutTourniquetMediaId,
        creator: auth.currentUser.email,
        updatedAt: new Date()
      }).then(()=>{
        this.$buefy.toast.open({
          message: "บันทึกคำถามเรียบร้อย",
          type: "is-success",
        })
      })
    },
  },
  mounted() {
    this.stage = new this.createjs.Stage(this.$refs.imageCanvas);
    this.queue = new this.createjs.LoadQueue(false, null, true);
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    const self = this
    db.collection('media').orderBy('uploaded_at', 'desc')
      .get().then((snapshot)=>{
      snapshot.docs.forEach((d)=>{
        self.mediaList.push({
          id: d.id,
          data: d.data()
        })
      })
      self.isLoading = false
    })
  }
}
</script>

<style scoped>

</style>