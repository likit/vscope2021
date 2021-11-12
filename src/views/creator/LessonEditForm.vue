<template>
<div>
  <nav-menu></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-one-third is-offset-4 box">
        <h1 class="title has-text-centered">
          Lesson Form
        </h1>
        <b-field label="ชื่อบทเรียน" type="is-danger" message="required">
          <b-input v-model="name"></b-input>
        </b-field>
        <b-field label="วัตถุประสงค์">
          <b-input type="textarea" v-model="objective"></b-input>
        </b-field>
        <b-field label="เผยแพร่">
          <b-switch v-model="published"></b-switch>
        </b-field>
        <div class="buttons is-centered">
          <button class="button is-light" @click="$router.push({ name: 'ProgramInfo', params: { programId: $route.params.programId }})">
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
import {db} from "../../firebase";
import NavMenu from "../../components/navMenu";

export default {
  name: "LessonEditForm",
  components: {NavMenu},
  data() {
    return {
      published: false,
      isLoggedIn: false,
      lessonId: null,
      programId: null,
      objective: null,
      name: null,
    }
  },
  computed: {
    isFormValid () {
      return this.name !== '' && this.name !== null
    }
  },
  mounted() {
    this.programId = this.$route.params.programId
    this.lessonId = this.$route.params.lessonId || null
    if (this.lessonId !== null) {
      db.collection('lessons').doc(this.lessonId).get().then((snapshot)=>{
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
      if (this.lessonId === null) {
        db.collection('lessons').add({
          programId: this.programId,
          name: this.name,
          published: this.published,
          objective: this.objective,
          createdAt: new Date()
        }).then(()=>{
          this.$buefy.toast.open({
            message: 'Data saved successfully',
            type: 'is-success'
          })
          this.$router.push({
            name: 'ProgramInfo',
            params: {
              programId: this.programId
            }
          })
        })
      } else {
        db.collection('lessons').doc(this.lessonId).update({
          name: this.name,
          published: this.published,
          objective: this.objective
        }).then(()=>{
          this.$buefy.toast.open({
            message: 'Data saved successfully',
            type: 'is-success'
          })
          this.$router.push({
            name: 'ProgramInfo',
            params: {
              programId: this.programId
            }
          })
        })
      }
    }
  }
}
</script>

<style scoped>

</style>