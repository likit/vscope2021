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
          <div class="has-text-centered">
            <button class="button is-primary"
                    @click="$router.push({ name: 'LessonEditForm', params: { lessonId: lessonId, programId: lesson.programId }})">
            <span class="icon">
              <i class="fas fa-edit"></i>
            </span>
              <span>แก้ไขข้อมูล</span>
            </button>
          </div>
        </div>
        <b-table :data="sessions" :loading="isLoading">
          <b-table-column field="name" label="ชื่อ" v-slot="props">
            {{ props.row.data.name }}
          </b-table-column>
          <b-table-column field="id" width="40" v-slot="props">
            <a class="button is-small is-info is-outlined is-rounded"
               @click="$router.push({ name: 'SessionInfo', params: { sessionId: props.row.id }})">
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
                  @click="$router.push({ name: 'ProgramInfo', params: { programId: lesson.programId } })">
          <span class="icon">
            <i class="fas fa-chevron-left"></i>
          </span>
            <span>Back</span>
          </button>
          <router-link class="button is-success"
                       :to="{ name: 'SessionEdit', params: { lessonId: lessonId }}">
          <span class="icon">
            <i class="fas fa-plus-circle"></i>
          </span>
            <span>เพิ่มชุดแบบฝึก</span>
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
  name: "LessonInfo",
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
        self.sessions.push({
          id: d.id,
          data: d.data()
        })
      })
      this.isLoading = false
    })
  }
}
</script>

<style scoped>

</style>