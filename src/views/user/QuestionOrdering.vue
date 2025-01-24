<template>
  <div>
    <nav-menu></nav-menu>
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
          </div>
          <b-table :data="userAnswers" :loading="isLoading">
            <b-table-column field="image" label="ชื่อ" v-slot="props">
              <b-image :src="props.row.imageUrl"></b-image>
            </b-table-column>
            <b-table-column field="name" label="ขั้นตอน" v-slot="props">
              {{ props.row.title }}
            </b-table-column>
            <b-table-column v-slot="props">
              <div class="buttons">
                <b-button type="is-success is-light" @click="rearrangeUp(props.row.id)">
                  <span class="icon">
                    <i class="far fa-arrow-alt-circle-up"></i>
                  </span>
                </b-button>
                <b-button type="is-light is-info" @click="rearrangeDown(props.row.id)">
                  <span class="icon">
                    <i class="far fa-arrow-alt-circle-down"></i>
                  </span>
                </b-button>
              </div>
            </b-table-column>
          </b-table>
        </div>
      </div>
      <div class="columns">
        <div class="column is-three-fifths is-offset-2">
          <div class="buttons is-centered">
            <button class="button is-light">
              <span class="icon">
                <i class="fas fa-chevron-left"></i>
              </span>
              <span>Cancel</span>
            </button>
            <button class="button is-info"
                    @click="submit">
              <span class="icon">
                <i class="fas fa-play-circle"></i>
              </span>
              <span>Submit</span>
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
      session: null,
      isLoggedIn: false,
      isLoading: true,
      userAnswers: []
    }
  },
  computed: {
    ...mapState(['questions'])
  },
  methods: {
    startNew() {
      console.log('Starting a new record')
      // end the current session
      if (this.$store.state.recordId !== null) {
        db.collection('records')
            .doc(this.$store.state.recordId).update({ end: new Date() })
      }

      // create a new record
      db.collection('records').add({
        email: this.$store.state.user.email,
        start: new Date(),
        sessionId: this.$route.params.sessionId,
        answers: [],
      }).then((recordRef) => {
        this.$store.dispatch('setRecordId', recordRef.id)
        this.$store.dispatch('clearAnswers')
        this.$store.dispatch('setSessionId', this.$route.params.sessionId)
      })
    },
    rearrangeUp(questionId) {
      const self = this
      let index = self.userAnswers.findIndex((q) => q.id == questionId)
      let prevIndex = index - 1
      if (prevIndex >= 0) {
        let prev_question = self.userAnswers[prevIndex]
        let this_question = self.userAnswers[index]
        self.$set(self.userAnswers, prevIndex, this_question)
        self.$set(self.userAnswers, index, prev_question)
      }
    },
    rearrangeDown(questionId) {
      const self = this
      let index = self.userAnswers.findIndex((q) => q.id == questionId)
      let nextIndex = index + 1
      if (nextIndex <= self.userAnswers.length) {
        let next_question = self.userAnswers[nextIndex]
        let this_question = self.userAnswers[index]
        self.$set(self.userAnswers, nextIndex, this_question)
        self.$set(self.userAnswers, index, next_question)
      }
    },
    shuffle(array) {
      const self = this
      let currentIndex = array.length;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {

          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          // And swap it with the current element.
          let currItem = array[currentIndex]
          let randomItem = array[randomIndex]
          self.$set(array, currentIndex, randomItem)
          self.$set(array, randomIndex, currItem)
          // [array[currentIndex], array[randomIndex]] = [
          // array[randomIndex], array[currentIndex]];
      }
    },
    submit () {
      const self = this
      self.$buefy.dialog.confirm({
        message: 'ท่านต้องการส่งคำตอบและสิ้นสุดชุดนี้ใช่หรือไม่',
        title: 'Submit answer and end the session',
        type: 'is-warning',
        ariaRole: 'alertdialog',
        ariaModal: true,
        cancelText: "ยกเลิก",
        confirmText: "ยืนยัน",
        onConfirm: () => {
          let submittedAt = new Date()
          db.collection('records')
              .doc(self.$store.state.recordId).update({
                answers: self.userAnswers.map((a)=>a.answer),
                end: submittedAt,
                submittedAt: submittedAt
              }
          ).then(()=>{
            let srs = 0
            db.collection('session_records')
                .where('sessionId', '==', self.$store.state.sessionId)
                .where('email', '==', self.$store.state.user.email)
                .get().then((querySnapshot)=>{
                  querySnapshot.docs.forEach((snapshot)=>{
                    let data = snapshot.data()
                    srs = data.attempts + 1
                    let pass = self.compareTwoArrays(self.session.orderingAnswersKey, self.userAnswers.map((a)=>a.answer))
                    db.collection('session_records').doc(snapshot.id).update({attempts: data.attempts + 1, pass: pass})
                  })
                }).then(() => {
                  if (self.$store.state.profile.group == "กลุ่มลำดับเลขคี่") {
                    let diff = (submittedAt.getTime() - this.$store.state.lessonStartDateTime.getTime())/1000
                    diff /= 60
                    let srt = Math.round(diff) 
                    let timeMessage = ""
                    let evalMessage = ""
                    let tet = this.$store.state.tet
                    let tes = this.$store.state.tes
                    let set = this.$store.state.setAnswer
                    let ses = this.$store.state.sesAnswer
                    let svs = this.$store.state.svsAnswer
                    console.log(set, srt, tet, srt, srs)
                    if (set - srt >= 0 && tet - srt >= 0) {
                      timeMessage = `คุณควบคุมเวลาได้สมบูรณ์แบบและเรียนจบในเวลาที่ครูคาดหวัง`
                    } else if (set - srt >= 0 && tet - srt < 0) {
                      timeMessage = `คุณควบคุมการเรียนรู้ได้อย่างถูกต้องตามที่คุณคาดหวัง แต่ใช้เวลาการเรียนรู้เกินกว่าที่อาจารย์คาดหมาย โปรดพยายามปรับปรุงประสิทธิภาพในการเรียนรู้ของคุณ`
                    } else if (set - srt < 0 && tet - srt >= 0) {
                      timeMessage = `คุณควบคุมเวลาเรียนได้อย่างสมบูรณ์แบบตามความคาดหวังของครู
      แต่ดูเหมือนว่าเวลาในการเรียนรู้ที่คุณคาดหวังนั้นค่อนข้างมากแตกต่างจากเวลาการเรียนรู้ที่คุณใช้ไป โปรดปรับความคาดหวังของคุณให้ตรงกับความสามารถของคุณ
      `
                    } else if (set - srt < 0 && tet - srt < 0) {
                      timeMessage = `เวลาการเรียนรู้ของคุณช้ากว่าที่ทั้งครูและคุณคาดหวังไว้มาก
      โปรดพยายามปรับปรุงประสิทธิภาพการเรียนรู้ของคุณและค้นหาสาเหตุที่ทำให้เกิดการเรียนรู้ที่ช้า
      `
                    }
                    if (ses - svs > 0 && tes - srs <= 0) {
                      evalMessage = `คุณทำแบบทดสอบได้ดีมาก แต่ดูเหมือนว่าคุณจะไม่รู้สึกมั่นใจ
      ประสิทธิภาพการเรียนรู้ของคุณ พยายามค้นหาปัญหาหรือพูดคุยกับครู
      `
                    } else if (ses - svs > 0 && tes - srs > 0) {
                      evalMessage = `ดูเหมือนว่าคุณไม่รู้สึกมั่นใจเกี่ยวกับการเรียนรู้นี้และ
      ประสิทธิภาพการเรียนรู้ของคุณไม่ดีเท่าที่ควร โปรดศึกษาสื่อการเรียนรู้อีกครั้งและถามอาจารย์เกี่ยวกับสิ่งที่คุณไม่สามารถเข้าใจได้
      `
                    } else if (ses - svs <= 0 && tes - srs <= 0) {
                      evalMessage = `คุณทำข้อสอบได้ดีมาก และรู้สึกมั่นใจกับผลงานของตัวเอง ทำต่อไป!`
                    } else if (ses - svs <= 0 && tes - srs >0) {
                      evalMessage = `ดูเหมือนว่าคุณจะรู้สึกมั่นใจกับการเรียนรู้ของคุณ แต่คุณทำแบบทดสอบได้ไม่ดีนัก โปรดศึกษาสื่อการเรียนรู้อีกครั้งและค้นหาว่าสิ่งใดที่คุณมีความเข้าใจไม่ถูกต้อง`
                    }

                    Swal.fire({
                      title: `Feedback`,
                      html: `
                      <h1 class="title is-size-4">Time Management</h1>
                      <p>${timeMessage}</p>
                      <h1 class="title is-size-4">Performance</h1>
                      <p>${evalMessage}</p>
                      `
                    }).then(()=>{
                        this.$router.push({ name: 'UserProgramList' })
                    })
                  } else {
                        this.$router.push({ name: 'UserProgramList' })
                  }
                  this.$store.dispatch('setSessionId', null)
                  this.$store.dispatch('clearAnswers')
                })
          })
        }
      })
    },
    compareTwoArrays(arr1, arr2) {
      return arr1.every((element, index) => {
        return element == arr2[index]
      })
    }
  },
  mounted() {
    const self = this
    self.sessionId = self.$route.params.sessionId
    self.startNew()
    db.collection('sessions').doc(self.sessionId).get().then((snapshot) => {
      if (snapshot.exists) {
        self.session = snapshot.data()
      }
    }).then(()=>{
      self.$store.dispatch('loadQuestion', self.sessionId).then(function () {
        self.questions.forEach((q)=>{
          let data = q.data
          let mediaUrl = null
          if (data.mediaId) {
            db.collection('media').doc(data.mediaId).get().then((snapshot) => {
              if (snapshot.exists) {
                mediaUrl = snapshot.data().fileUrl
                self.userAnswers.push({
                  id: q.id,
                  answer: data.answer,
                  title: data.title,
                  imageUrl: mediaUrl,
                })
              }
            })
          }
        })
      })
      if (self.session.randomQuestion) {
        self.shuffle(self.userAnswers)
      }
      self.isLoading = false
    })
  }
}
</script>

<style scoped>

</style>