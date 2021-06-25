<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-one-third is-offset-4 box">
        <h1 class="title has-text-centered">
          New Lesson
        </h1>
        <p>Program ID: {{ programId }}</p>
        <b-field label="ชื่อ" type="is-danger" message="required">
          <b-input v-model="name"></b-input>
        </b-field>
        <b-field label="วัตถุประสงค์">
          <b-input type="textarea" v-model="objective"></b-input>
        </b-field>
        <div class="buttons is-centered">
          <button class="button is-light" @click="$router.push({ name: 'ProgramInfo', params: { programId: $route.params.programId }})">
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
import {db,auth} from "../../firebase";
import NavMenu from "../../components/navMenu";

export default {
  name: "LessonEditForm",
  components: {NavMenu},
  data() {
    return {
      published: null,
      isLoggedIn: false,
      lessonId: null,
      programId: null,
      objective: null,
      name: null,
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      self.isLoggedIn = true
    }
    self.programId = this.$route.params.programId
    self.lessonId = this.$route.params.lessonId
    if (self.lessonId) {
      db.collection('lessons').doc(self.lessonId).get().then((snapshot)=>{
        if (snapshot.exists) {
          let data = snapshot.data()
          self.name = data.name
          self.objective = data.objective
          self.published = data.published || false
        }
      })
    }
  },
  methods: {
    saveData: function () {
      const self = this
      db.collection('lessons').add({
        programId: self.programId,
        name: self.name,
        objective: self.objective,
        createdAt: new Date()
      }).then(()=>{
        self.$buefy.toast.open({
          message: 'Data saved successfully',
          type: 'is-success'
        })
        self.$router.push({ name: 'ProgramInfo', params: { programId: self.programId} })
      })
    }
  }
}
</script>

<style scoped>

</style>