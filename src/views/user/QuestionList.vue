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
              <span>Start</span>
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
              <span>Start</span>
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
import {mapState} from "vuex";

export default {
  name: "UserQuestionList",
  components: {NavMenu},
  data() {
    return {
      sessionId: null,
      session: null,
      isLoggedIn: false,
      isLoading: true,
    }
  },
  computed: {
    ...mapState(['questions'])
  },
  methods: {
    startNew() {
      const self = this
      if (self.$store.state.sessionId != null) {
        db.collection('records')
            .where('sessionId', '==', self.$store.state.sessionId)
            .orderBy('start', 'desc')
            .get().then(snapshot=>{
              let ref = snapshot.docs[0]
              db.collection('records').doc(ref.id).update({
                end: new Date()
              })
        })
      }
      db.collection('records').add({
        email: auth.currentUser.email,
        start: new Date(),
        sessionId: self.$route.params.sessionId,
        answers: [],
      }).then(() => {
        self.$store.dispatch('setSessionId', self.$route.params.sessionId).then(() => {
          self.$router.push({
            name: 'Question',
            params: {
              lessonId: self.session.lessonId,
              programId: self.$route.params.programId,
              sessionId: self.sessionId,
              questionNo: '0'
            }
          })
        })
      })
    },
    start() {
      const self = this
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
        self.$router.push({
          name: 'Question',
          params: {
            lessonId: self.session.lessonId,
            programId: self.$route.params.programId,
            sessionId: self.sessionId,
            questionNo: '0'
          }
        })
      }
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.sessionId = this.$route.params.sessionId
    db.collection('sessions').doc(this.sessionId).get().then((snapshot) => {
      if (snapshot.exists) {
        self.session = snapshot.data()
      }
      self.isLoading = false
    })
    self.$store.dispatch('loadQuestion', this.sessionId)
  }
}
</script>

<style scoped>

</style>