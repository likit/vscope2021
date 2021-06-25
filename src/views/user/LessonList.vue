<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column is-three-fifths is-offset-2">
          <div v-if="program !== null">
            <h1 class="title has-text-centered">
              โปรแกรม
            </h1>
            <h2 class="subtitle has-text-centered">
              ชื่อ {{ program.name }}
            </h2>
          </div>
          <b-table :data="lessons" :loading="isLoading">
            <b-table-column field="name" label="ชื่อบทเรียน" v-slot="props">
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
                 @click="$router.push({ name: 'UserSessionList',
                   params: {programId: programId, lessonId: props.row.id}})">
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
            <button class="button is-light" @click="$router.push({ name: 'UserProgramList' })">
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
import {db, auth} from '../../firebase'
import NavMenu from "../../components/navMenu";

export default {
  name: "UserLessonList",
  components: {NavMenu},
  data() {
    return {
      program: null,
      programId: null,
      lessons: [],
      isLoggedIn: false,
      isLoading: true
    }
  },
  computed: {
  },
  beforeMount() {
    let self = this
    if (auth.currentUser) {
      self.isLoggedIn = true
    }
    self.programId = self.$route.params.programId
    db.collection('programs').doc(self.programId).get().then((snapshot)=>{
      if (snapshot.exists) {
        self.program = snapshot.data()
      }
    })
    // TODO: add a filter for published lesson only
    db.collection('lessons')
        .where('programId', '==', self.programId).get().then((snapshot)=>{
      snapshot.docs.forEach((d)=>{
        self.lessons.push({
          id: d.id,
          data: d.data()
        })
      })
      self.isLoading = false
    })
  },
}
</script>

<style scoped>

</style>