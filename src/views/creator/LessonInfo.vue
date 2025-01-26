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
            {{ $route.params.lessonId }}
          </h2>
          <div class="has-text-centered" v-if="editable">
            <button class="button is-light is-primary"
                    @click="$router.push({ name: 'LessonEditForm', params: { lessonId: lessonId, programId: lesson.programId }})">
            <span class="icon">
              <i class="fas fa-edit"></i>
            </span>
              <span>แก้ไขข้อมูลบทเรียน</span>
            </button>
          </div>
        </div>
        <b-table :data="sessions" paginated per-page="10" :loading="isLoading">
          <b-table-column field="name" label="Title" v-slot="props">
            {{ props.row.data.name }}
          </b-table-column>
          <b-table-column field="name" label="Objective" v-slot="props">
            {{ props.row.data.objective }}
          </b-table-column>
          <b-table-column field="createdAt" label="Created At" v-slot="props">
            {{ props.row.data.createdAt.toDate().toLocaleString() }}
          </b-table-column>
          <b-table-column width="40" v-slot="props" label="Published">
            <span class="icon" v-if="props.row.data.published">
              <i class="fas fa-check-circle has-text-success"></i>
            </span>
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
  computed: {
    editable () {
      if (this.$store.state.user === null) {
        return false
      } else {
        return this.lesson.creator == auth.currentUser.email
      }
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
        .where('lessonId', '==', self.$route.params.lessonId).get()
        .then((querySnapshot)=>{
          console.log(querySnapshot.empty)
          querySnapshot.docs.forEach((docSnapshot)=>{
            self.sessions.push({
              id: docSnapshot.id,
              data: docSnapshot.data()
            })
        })
      this.isLoading = false
    })
  }
}
</script>

<style scoped>

</style>