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
        <div class="buttons is-centered">
          <button class="button is-light"
                  @click="$router.push({ name: 'SessionInfo', params: { sessionId: sessionId }})">
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
    }
  },
  computed: {
    isFormValid () {
      return this.name !== '' && this.name !== null
    }
  },
  mounted () {
    this.sessionId = this.$route.params.sessionId
    this.lessonId = this.$route.params.lessonId
    if (this.sessionId) {
      db.collection('sessions').doc(this.sessionId).get().then((snapshot)=>{
        if (snapshot.exists) {
          let data = snapshot.data()
          this.name = data.name
          this.objective = data.objective
          this.published = data.published || false
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
          createdAt: new Date(),
        }).then(()=>{
          this.$buefy.toast.open({
            message: 'Data saved successfully',
            type: 'is-success'
          })
          this.$router.push({ name: 'SessionInfo', params: { sessionId: this.sessionId }})
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