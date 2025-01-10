<template>
<div>
  <nav-menu></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column has-text-centered">
        <h1 class="title">Session Form</h1>
      </div>
    </div>
    <div class="columns">
      <div class="column is-one-third is-offset-4 box">
        <b-field label="ชื่อ" type="is-danger" message="required">
          <b-input v-model="name"></b-input>
        </b-field>
        <b-field label="วัตถุประสงค์">
          <b-input v-model="objective" type="textarea"></b-input>
        </b-field>
        <b-field label="เผยแพร่">
          <b-switch v-model="published"></b-switch>
        </b-field>
        <b-field label="สุ่มคำถาม">
          <b-switch v-model="randomQuestion"></b-switch>
        </b-field>
        <b-field label="จำนวนคำถามที่แสดง" message="Default is all questions.">
          <b-input v-model="numberDisplayQuestion" type="number"></b-input>
        </b-field>
        <b-field label="เรียงคำถามให้ถูกต้องตามลำดับ">
          <b-switch v-model="orderingAnswers"></b-switch>
        </b-field>
        <b-field label="เฉลยการเรียงลำดับ">
          <b-taginput v-model="orderingAnswersKey" icon="label" placeholder="เพิ่มรายการ"></b-taginput>
        </b-field>
        <div class="buttons is-centered">
          <button class="button is-light"
                  @click="$router.push({ name: 'LessonInfo', params: { lessonId: lessonId }})">
          <span class="icon">
            <i class="fas fa-chevron-left"></i>
          </span>
            <span>Back</span>
          </button>
          <b-button :disabled="!isFormValid" class="button is-success" @click="saveData">
          <span class="icon">
            <i class="far fa-save"></i>
          </span>
            <span>Save</span>
          </b-button>
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
  name: "SessionEdit",
  components: {NavMenu},
  data() {
    return {
      name: null,
      objective: null,
      lessonId: null,
      published: false,
      randomQuestion: false,
      numberDisplayQuestion: null,
      orderingAnswers: null,
      orderingAnswersKey: [],
    }
  },
  computed: {
    isFormValid () {
      return this.name !== '' && this.name !== null
    }
  },
  mounted () {
    this.sessionId = this.$route.params.sessionId || null
    this.lessonId = this.$route.params.lessonId
    if (this.sessionId !== null) {
      db.collection('sessions').doc(this.sessionId).get().then((snapshot)=>{
        if (snapshot.exists) {
          let data = snapshot.data()
          this.name = data.name
          this.objective = data.objective
          this.published = data.published || false
          this.randomQuestion = data.randomQuestion || false
          this.numberDisplayQuestion = data.numberDisplayQuestion || null
          this.orderingAnswers = data.orderingAnswers
          this.orderingAnswersKey = data.orderingAnswersKey
        }
      })
    }
  },
  methods: {
    saveData: function () {
      if (this.sessionId === null) {
        db.collection('sessions').add({
          name: this.name,
          lessonId: this.lessonId,
          objective: this.objective,
          published: this.published,
          creator: auth.currentUser.email,
          randomQuestion: this.randomQuestion,
          numberDisplayQuestion: this.numberDisplayQuestion,
          orderingAnswers: this.orderingAnswers,
          orderingAnswersKey: this.orderingAnswersKey,
          createdAt: new Date(),
        }).then((docRef)=>{
          this.$buefy.toast.open({
            message: 'Data saved successfully',
            type: 'is-success'
          })
          this.$router.push({ name: 'SessionInfo', params: { sessionId: docRef.id }})
        }).catch((error)=>{
          this.$buefy.toast.open({
            message: error.toString(),
            type: 'is-danger'
          })
        })
      } else {
        db.collection('sessions').doc(this.sessionId).update({
          name: this.name,
          objective: this.objective,
          published: this.published,
          randomQuestion: this.randomQuestion,
          numberDisplayQuestion: this.numberDisplayQuestion,
          orderingAnswers: this.orderingAnswers,
          orderingAnswersKey: this.orderingAnswersKey,
        }).then(()=>{
          this.$buefy.toast.open({
            message: 'Data updated successfully',
            type: 'is-success'
          })
          this.$router.push({ name: 'SessionInfo', params: { sessionId: this.sessionId }})
        }).catch((error)=>{
          this.$buefy.toast.open({
            message: error.toString(),
            type: 'is-danger'
          })
        })
      }
    }
  }
}
</script>

<style scoped>

</style>