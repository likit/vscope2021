<template>
  <div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-three-fifths is-offset-2">
        <div v-if="lesson !== null">
          <h1 class="title has-text-centered">
            บทเรียน
          </h1>
          <h2 class="subtitle has-text-centered">
            ชื่อ {{ lesson.name }}
          </h2>
        </div>
        <b-table :data="sessions" :loading="isLoading">
          <b-table-column field="name" label="ชื่อ" v-slot="props">
            {{ props.row.data.name }}
          </b-table-column>
          <b-table-column field="objective" label="วัตถุประสงค์" v-slot="props">
            {{ props.row.data.objective }}
          </b-table-column>
          <b-table-column field="createdAt" label="เพิ่มเมื่อ" v-slot="props">
            {{ props.row.data.createdAt.toDate().toLocaleString() }}
          </b-table-column>
          <b-table-column field="id" width="40" v-slot="props">
            <a class="button is-info is-rounded"
               @click="$router.push({ name: 'UserQuestionList', params: { programId:$route.params.programId,
                                             lessonId:$route.params.lessonId, sessionId: props.row.id }})">
            <span class="icon">
                    <i class="fas fa-chevron-circle-right"></i>
            </span>
              <span>Go</span>
            </a>
          </b-table-column>
        </b-table>
      </div>
    </div>
    <div class="columns">
      <div class="column is-three-fifths is-offset-2">
        <div class="buttons is-centered">
          <button class="button is-light"
                  @click="$router.push({ name: 'UserLessonList', params: { programId: lesson.programId } })">
            <span class="icon">
              <i class="fas fa-chevron-left"></i>
            </span>
            <span>Back</span>
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
  name: "UserSessionList",
  components: {NavMenu},
  data() {
    return {
      lesson: null,
      lessonId: null,
      sessions: [],
      isLoggedIn: false,
      isLoading: true
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.lessonId = this.$route.params.lessonId
    db.collection('lessons').doc(this.lessonId).get().then((snapshot)=>{
      if (snapshot.exists) {
        self.lesson = snapshot.data()
      }
    })
    db.collection('sessions')
        .where('lessonId', '==', self.lessonId).get().then((snapshot)=>{
      snapshot.docs.forEach((d)=>{
        if (d.data().published === true) {
          self.sessions.push({
            id: d.id,
            data: d.data()
          })
        }
      })
      this.isLoading = false
    })
  }
}
</script>

<style scoped>

</style>