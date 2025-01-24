<template>
<div>
  <nav-menu></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-one-third is-offset-4 box">
        <h1 class="title has-text-centered">
          Lesson Form
        </h1>
        <b-field label="ลำดับ" type="is-danger" message="required">
          <b-numberinput v-model="number"></b-numberinput>
        </b-field>
        <b-field label="ชื่อบทเรียน" type="is-danger" message="required">
          <b-input v-model="name"></b-input>
        </b-field>
        <b-field label="วัตถุประสงค์">
          <b-input type="textarea" v-model="objective"></b-input>
        </b-field>
        <b-field label="เผยแพร่">
          <b-switch v-model="published"></b-switch>
        </b-field>
        <b-field label="Goal setting question">
          <b-input type="textarea" v-model="ses"></b-input>
        </b-field>
        <b-field label="Time management question">
          <b-input type="textarea" v-model="set"></b-input>
        </b-field>
        <b-field label="TET">
          <b-input type="number" v-model="tet"></b-input>
        </b-field>
        <b-field label="TES">
          <b-input type="number" v-model="tes"></b-input>
        </b-field>
        <b-field label="Prerequisite Session ID">
          <b-input type="textarea" v-model="requiredSessionId"></b-input>
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
import {auth, db} from "../../firebase";
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
      number: null,
      ses: "",
      set: "",
      tes: null,
      tet: null,
      requiredSessionId: null,
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
          this.number = data.number
          this.ses = data.ses || ""
          this.set = data.set || ""
          this.tet = data.tet || null
          this.tes = data.tes || null
          this.requiredSessionId = data.requiredSessionId || null
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
          creator: auth.currentUser.email,
          published: this.published,
          objective: this.objective,
          ses: this.ses,
          set: this.set,
          tes: this.tes,
          tet: this.tet,
          requiredSessionId: this.requiredSessionId,
          number: this.number,
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
          objective: this.objective,
          number: this.number,
          ses: this.ses,
          set: this.set,
          tes: this.tes,
          tet: this.tet,
          requiredSessionId: this.requiredSessionId,
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