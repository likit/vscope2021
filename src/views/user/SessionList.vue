<template>
  <div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
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
import Swal from "sweetalert2";


export default {
  name: "UserSessionList",
  components: {NavMenu},
  data() {
    return {
      lesson: null,
      lessonId: null,
      sessions: [],
      isLoggedIn: false,
      isLoading: true,
      sesAnswer: null,
      setAnswer: null,
      gsRecordId: null,
    }
  },
  methods: {
    ask(ses, set) {
      const self = this
      Swal.fire({
        title: "Set Your Goal",
        html: `
        <p>${ses}</p>
        <div class="field">
          <div class="control">
            <input id="ses" required type="number" class="input">
          </div>
        </div>
        <p>${set}</p>
        <div class="field">
          <div class="control">
            <input id="set" required type="number" class="input">
          </div>
        </div>
        `,
  allowOutsideClick: false,
  allowEscapeKey: false,
  confirmButtonText: "Go",
  showLoaderOnConfirm: true,
  preConfirm: async () => {
    const ses = document.getElementById('ses').value
    const set = document.getElementById('set').value
    if (ses && set) {
      self.$store.dispatch('setLessonId', self.lessonId)
      self.$store.dispatch('setLessonSES', ses)
      self.$store.dispatch('setLessonSET', set)
      self.$store.dispatch('setLessonTET', self.lesson.tet)
      self.$store.dispatch('setLessonTES', self.lesson.tes)
      self.$store.dispatch('setLessonStartDateTime')
    } else {
      Swal.showValidationMessage('You must answer all questions!')
    }
  },
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: `Success`,
      text: `Ok, you can start.`
    });
  }
      })
    },
    start() {
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      self.isLoggedIn = true
    }
    self.lessonId = self.$route.params.lessonId
    db.collection('lessons').doc(self.lessonId).get().then((snapshot)=>{
      if (snapshot.exists) {
        self.lesson = snapshot.data()
        if (self.$store.state.lessonId != self.lessonId && self.$store.state.profile.group === "กลุ่มลำดับเลขคี่") {
          if (self.$store.state.recordId) {
            db.collection('records').doc(self.$store.state.recordId).update({
              end: new Date()
            }).then(()=>self.$store.dispatch("setRecordId", null))
          }
          self.ask(self.lesson.ses, self.lesson.set)
        }
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