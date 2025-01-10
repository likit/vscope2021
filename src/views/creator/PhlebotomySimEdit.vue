<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title has-text-centered">
          Phlebotomy Simulation
        </h1>
        <b-field label="Format">
          <b-input v-model="question.format" readonly></b-input>
        </b-field>
        <b-field label="Title">
          <b-input v-model="question.title"></b-input>
        </b-field>
        <b-field label="Arm with no tourniquet">
          <b-select v-model="question.armWithOutTourniquetMediaId" placeholder="Select an image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="Arm with tourniquet">
          <b-select v-model="question.armWithTourniquetMediaId" placeholder="Select Arm with tourniquet">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <div class="buttons is-centered">
          <button class="button is-light"
                  @click="$router.push({ name: 'SessionInfo', params: { sessionId: question.sessionId }})">
            <span class="icon">
              <i class="fas fa-chevron-left"></i>
            </span>
            <span>Back</span>
          </button>
          <button class="button is-success" @click="saveData">Save</button>
        </div>
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
      isLoggedIn: false,
      question: {
        format: "PhlebotomySim",
        title: "",
        id: null,
        armWithTourniquetMediaId: null,
        armWithTouriquetMedia: null,
        armWithOutTourniquetMediaId: null,
        armWithOutTouriquetMedia: null,
        updatedAt: null,
      },
      mediaList: [],
      sessionId: null
    }
  },
  methods: {
    saveData () {
      let self = this
      if (self.questionId == null) {
        db.collection('questions').add({
          format: self.question.format,
          title: self.title,
          sessionId: self.sessionId,
          armWithTourniquetMediaId: self.armWithTourniquetMediaId,
          armWithOutTourniquetMediaId: self.armWithOutTourniquetMediaId,
          creator: auth.currentUser.email,
          updatedAt: new Date()
        }).then(()=>{
          this.$buefy.toast.open({
            message: "บันทึกคำถามเรียบร้อย",
            type: "is-success",
          })
        })
      } else {
        self.question.updatedAt = new Date()
        db.collection('questions')
            .doc(self.questionId).update(self.question).then(() => {
          this.$buefy.toast.open({
            message: "บันทึกคำถามเรียบร้อย",
            type: "is-success",
          })
        })
      }
    },
  },
  mounted() {
    this.sessionId = this.$route.params.sessionId
    this.questionId = this.$route.params.questionId
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
    db.collection('questions').doc(this.questionId).get().then((snapshot) => {
      if (snapshot.exists) {
        self.question = snapshot.data()
        self.question.updatedAt = self.question.updatedAt.toDate()
      }
    })
  }
}
</script>

<style scoped>

</style>