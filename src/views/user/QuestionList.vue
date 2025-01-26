<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column is-three-fifths is-offset-2">
          <div v-if="session !== null">
            <h1 class="title has-text-centered">
              ชุดแบบฝึก {{ session.format }}
            </h1>
            <h2 class="subtitle has-text-centered">
              ชื่อ {{ session.name }}
            </h2>
          </div>
          <hr>
          <h1 class="title has-text-centered">รายการคำถาม</h1>
          <div class="buttons is-centered">
            <button class="button is-light"
                    @click="$router.push({ name: 'UserSessionList', params: { lessonId: session.lessonId, programId: $route.params.programId } })">
              <span class="icon">
                <i class="fas fa-chevron-left"></i>
              </span>
              <span>Back</span>
            </button>
            <button class="button is-info"
                    @click="start">
              <span class="icon">
                <i class="fas fa-play-circle"></i>
              </span>
              <span v-if="sessionId === $store.state.sessionId">Resume</span>
              <span v-else>Start</span>
            </button>
          </div>
          <b-table :data="questions" :loading="isLoading">
            <b-table-column field="no" label="ลำดับ" v-slot="props">
              {{ props.row.data.no }}
            </b-table-column>
            <b-table-column field="name" label="ชื่อ" v-slot="props">
              {{ props.row.data.title }}
            </b-table-column>
            <b-table-column field="name" label="คะแนน" v-slot="props">
              {{ props.row.data.point }}
            </b-table-column>
            <b-table-column field="creator" label="ผู้สร้าง" v-slot="props">
              {{ props.row.data.creator }}
            </b-table-column>
            <b-table-column field="updatedAt" label="แก้ไขเมื่อ" v-slot="props">
              {{ props.row.data.updatedAt.toDate().toLocaleString() }}
            </b-table-column>
          </b-table>
        </div>
      </div>
      <div class="columns">
        <div class="column is-three-fifths is-offset-2">
          <div class="buttons is-centered">
            <button class="button is-light"
                    @click="$router.push({ name: 'UserSessionList', params: { lessonId: session.lessonId, programId: $route.params.programId } })">
              <span class="icon">
                <i class="fas fa-chevron-left"></i>
              </span>
              <span>Back</span>
            </button>
            <button class="button is-info"
                    @click="start">
              <span class="icon">
                <i class="fas fa-play-circle"></i>
              </span>
              <span v-if="sessionId === $store.state.sessionId">Resume</span>
              <span v-else>Start</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";
import {db} from "../../firebase";
import {mapState} from "vuex";
import Swal from "sweetalert2";

export default {
  name: "UserQuestionList",
  components: {NavMenu},
  data() {
    return {
      sessionId: null,
      lessonId: null,
      session: null,
      isLoggedIn: false,
      isLoading: true,
    }
  },
  computed: {
    ...mapState(['questions'])
  },
  methods: {
    ask(svs) {
      const self = this
      Swal.fire({
        title: "Set Your Goal",
        html: `
        <p>${svs}</p>
        <div class="field">
          <div class="control">
            <input id="svs" required type="number" class="input">
          </div>
        </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          const svs = document.getElementById('svs').value
          if (svs) {
            self.$store.dispatch('setLessonSVS', svs)
          } else {
            Swal.showValidationMessage('You must answer the question!')
          }
        },
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: `Success`,
            text: `Ok, you can start.`
          })
        }
        })
    },
    startNew() {
      let self = this
      // end the current session
      if (self.$store.state.recordId !== null) {
        db.collection('records')
            .doc(self.$store.state.recordId).update({ end: new Date() })
      }

      self.ask(self.session.svsQuestion)

      // create a new record
      db.collection('records').add({
        email: self.$store.state.user.email,
        start: new Date(),
        sessionId: self.$route.params.sessionId,
        goals: {
          ses: self.$store.state.sesAnswer,
          set: self.$store.state.setAnswer,
        },
        answers: [],
      }).then((recordRef) => {
        self.$store.dispatch('setRecordId', recordRef.id)
        self.$store.dispatch('clearAnswers')
        self.$store.dispatch('setLessonId', self.session.lessonId)
        self.$store.dispatch('setSessionId', self.$route.params.sessionId).then(() => {
          if (self.session.orderingAnswers) {
            self.$router.push({
              name: 'QuestionOrdering',
              params: {
                lessonId: self.session.lessonId,
                programId: self.$route.params.programId,
                sessionId: self.sessionId,
                recordId: recordRef.id,
                start: self.$store.state.lessonStartDateTime,
                questionNo: '0',
              }
            })
          } else if (self.session.format == "Phlebotomy Simulation") {
            self.$router.push({
              name: 'PhlebotomySimUser',
              params: {
                lessonId: self.session.lessonId,
                programId: self.$route.params.programId,
                sessionId: self.sessionId,
                recordId: recordRef.id,
                questionNo: '0'
              }
            })
          } else {
            self.$router.push({
              name: 'Question',
              params: {
                lessonId: self.session.lessonId,
                programId: self.$route.params.programId,
                sessionId: self.sessionId,
                recordId: recordRef.id,
                questionNo: '0'
              }
            })
          }
        })
      })
    },
    start() {
      let self = this
      if (self.$store.state.sessionId != null && self.$store.state.sessionId !== self.sessionId) {
        self.$buefy.dialog.confirm({
          message: 'ท่านต้องการสิ้นสุดชุดทดสอบนี้และเริ่มชุดทดสอบใหม่ใช่หรือไม่',
          title: 'End the current session',
          type: 'is-warning',
          ariaRole: 'alertdialog',
          ariaModal: true,
          cancelText: "ยกเลิก",
          confirmText: "ยืนยัน",
          onConfirm: self.startNew
        })
      } else if (self.$store.state.sessionId == null) {
        self.$buefy.dialog.confirm({
          message: 'ท่านต้องการเริ่มชุดทดสอบใหม่ใช่หรือไม่',
          title: 'Start a new session',
          type: 'is-success',
          ariaRole: 'alertdialog',
          ariaModal: true,
          cancelText: "ยกเลิก",
          confirmText: "ยืนยัน",
          onConfirm: self.startNew
        })
      } else {
        self.$store.dispatch('setSessionId', self.$route.params.sessionId).then(() => {
          if (self.session.orderingAnswers) {
            self.$router.push({
              name: 'QuestionOrdering',
              params: {
                lessonid: self.session.lessonid,
                programid: self.$route.params.programid,
                sessionid: self.sessionid,
                questionno: '0',
              }
            })
          } else if (self.session.format == "Phlebotomy Simulation") {
            self.$router.push({
              name: 'PhlebotomySimUser',
              params: {
                lessonId: self.session.lessonId,
                programId: self.$route.params.programId,
                sessionId: self.sessionId,
                questionNo: '0'
              }
            })
          } else {
            self.$router.push({
              name: 'Question',
              params: {
                lessonid: self.session.lessonid,
                programid: self.$route.params.programid,
                sessionid: self.sessionid,
                questionno: '0',
              }
            })
          }
        })
      }
    }
  },
  mounted() {
    this.sessionId = this.$route.params.sessionId
    db.collection('sessions').doc(this.sessionId).get().then((snapshot) => {
      if (snapshot.exists) {
        this.session = snapshot.data()
      }
      this.isLoading = false
      this.$store.dispatch('loadQuestion', this.sessionId).then(()=>{
        if (this.session.numberDisplayQuestion && this.session.randomQuestion) {
          this.$store.dispatch('randomAndSliceQuestions', this.session.numberDisplayQuestion)
        }
      })
    })
    db.collection('session_records')
        .where('sessionId', '==', this.$route.params.sessionId)
        .where('email', '==', this.$store.state.user.email)
        .get().then((querySnapshot)=>{
          if(querySnapshot.empty) {
            db.collection('session_records').add({
              email: this.$store.state.user.email,
              sessionId: this.$route.params.sessionId,
              pass: false,
              attempts: 0
            })
          }
        })
  }
}
</script>

<style scoped>

</style>