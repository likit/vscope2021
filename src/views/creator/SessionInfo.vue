<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-three-fifths is-offset-2">
        <div v-if="session !== null">
          <h1 class="title has-text-centered">
            ชุดแบบฝึก
          </h1>
          <h2 class="subtitle has-text-centered">
            ชื่อ {{ session.name }}
          </h2>
          <div class="has-text-centered">
            <button class="button is-primary"
                    @click="$router.push({ name: 'LessonEditForm', params: { lessonId: lessonId }})">
          <span class="icon">
            <i class="fas fa-edit"></i>
          </span>
              <span>แก้ไขข้อมูล</span>
            </button>
          </div>
        </div>
        <b-table :data="questions" :loading="isLoading">
          <b-table-column field="name" label="ชื่อ" v-slot="props">
            {{ props.row.data.title }}
          </b-table-column>
          <b-table-column field="id" width="40" v-slot="props">
            <a class="button is-small is-info is-outlined is-rounded"
               @click="$router.push({ name: 'QuestionEditForm', params: {sessionId: props.row.id, questionId: props.row.id }})">
          <span class="icon">
            <i class="fas fa-info-circle"></i>
          </span>
              <span>detail</span>
            </a>
          </b-table-column>
        </b-table>
      </div>
    </div>
    <div class="columns">
      <div class="column is-three-fifths is-offset-2">
        <div class="buttons is-centered">
          <button class="button is-light"
                  @click="$router.push({ name: 'LessonInfo', params: { lessonId: lessonId } })">
        <span class="icon">
          <i class="fas fa-chevron-left"></i>
        </span>
            <span>Back</span>
          </button>
          <router-link class="button is-success" :to="{ name: 'QuestionInfo', params: { sessionId: sessionId}}">
        <span class="icon">
          <i class="fas fa-plus-circle"></i>
        </span>
            <span>เพิ่มคำถาม</span>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import {db, auth} from '../../firebase'
import NavMenu from "../../components/navMenu";

export default {
  name: "SessionInfo",
  components: {NavMenu},
  data() {
    return {
      sessionId: null,
      session: null,
      isLoggedIn: false,
      isLoading: true,
      questions: [],
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.sessionId = this.$route.params.sessionId
    db.collection('sessions').doc(this.sessionId).get().then((snapshot)=>{
      if (snapshot.exists) {
        self.session = snapshot.data()
      }
      self.isLoading = false
    })
    db.collection('questions').get().then((snapshot)=>{
      snapshot.docs.forEach((q)=>{
        self.questions.push({
          id: q.id,
          data: q.data()
        })
      })
    })
  }
}
</script>

<style scoped>

</style>