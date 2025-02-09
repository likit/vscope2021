<template>
  <div>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">
            ข้อที่ {{ questionNo + 1 }}) {{ question.title }}
          </h1>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <div class="tile is-ancestor">
            <div class="tile">
              <div class="tile is-parent is-vertical" v-if="question.videoUrl || hasMedia || imageUrl">
                <div class="tile is-child">
                  <video :src="video.fileUrl" v-if="video.fileUrl" controls></video>
                  <iframe v-if="question.videoUrl" width="560" height="315" :src="question.videoUrl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                  <b-image :src="imageUrl" v-if="imageUrl"></b-image>
                </div>
                <div class="tile is-child notification is-light" v-if="isMediaMissing === false">
                  <canvas id="imageCanvas" ref="imageCanvasEdit" width="800" height="800"></canvas>
                </div>
                <div class="tile is-child notification is-light" v-else>
                  <span class="icon">
                    <i class="far fa-image"></i>
                  </span>
                  <span>
                    Media is missing...
                  </span>
                </div>
                <b-loading v-model="isMediaLoading" :can-cancel="false"></b-loading>
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box">
                  {{ question.point }} point(s)
                  <div class="notification is-light is-warning">
                    <h1 class="title is-size-5">ตัวเลือกคำตอบ</h1>
                    <b-field>
                      <div class="block">
                        <b-radio v-for="choice in question.choices"
                                 :key="choice" v-model="answer"
                                 name="choice" :native-value="choice">
                          {{ choice }}
                        </b-radio>
                      </div>
                    </b-field>
                  </div>
                  <div class="buttons is-centered">
                    <button class="button is-light" @click="$router.back()">
                      <span class="icon">
                        <i class="fas fa-chevron-left"></i>
                      </span>
                      <span>Back</span>
                    </button>
                    <button class="button is-success" @click="nextQuestion">
                      <span>Next</span>
                      <span class="icon">
                        <i class="fas fa-chevron-right"></i>
                      </span>
                    </button>
                  </div>
                  <div class="buttons is-centered">
                    <button class="button is-danger" @click="endSession">
                      <span class="icon">
                         <i class="far fa-times-circle"></i>
                      </span>
                      <span>Cancel</span>
                    </button>
                    <button class="button is-info" @click="submit">
                      <span class="icon">
                        <i class="fas fa-paper-plane"></i>
                      </span>
                      <span>Finish</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 class="subtitle has-text-centered is-size-6" v-if="question.updatedAt">
            <span>โดย {{ question.creator }}</span>
            &ensp;
            <span class="icon">
              <i class="far fa-clock"></i>
            </span>
            <span>{{ question.updatedAt.toLocaleString() }}</span>
          </h2>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {db} from "../../firebase";
import {mapState} from "vuex";
import Swal from "sweetalert2";

export default {
  name: "UserQuestion",
  data() {
    return {
      isMediaLoading: false,
      isMediaMissing: false,
      questionId: null,
      questionNo: null,
      question: {
        choices: [],
      },
      imageUrl: null,
      session: null,
      queue: null,
      stage: null,
      bmp: null,
      pin: null,
      answer: null,
      video: {},
      hasMedia: false,
    }
  },
  computed: {
    ...mapState(['questions', 'answers', 'score']),
  },
  watch: {
    '$route.params.questionNo': function () {
      this.loadData(false)
    },
    'answer': function (val) {
      this.answer = val
      this.answers[this.questionNo] = {
        'answer': val,
        'updatedAt': new Date(),
        'questionId': this.questionId,
        'key': this.question.answer,
        'point': this.question.point
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    endSession () {
      this.$buefy.dialog.confirm({
        message: 'ท่านต้องการสิ้นสุดชุดทดสอบนี้และเริ่มชุดทดสอบใหม่ใช่หรือไม่',
        title: 'End the current session',
        type: 'is-warning',
        ariaRole: 'alertdialog',
        ariaModal: true,
        cancelText: "ยกเลิก",
        confirmText: "ยืนยัน",
        onConfirm: () => {
          db.collection('records')
              .doc(this.$store.state.recordId)
              .update({ end: new Date() }).then(()=>{
                this.$buefy.toast.open({
                  message: "The session has ended.",
                  type: "is-success"
                })
            this.$store.dispatch('setSessionId', null)
            this.$store.dispatch('clearAnswers')
            this.$router.push({ name: 'UserProgramList' })
          })
        }
      })
    },
    submit () {
      const self = this
      if (self.answers.length === 0) {
        self.$buefy.dialog.alert('คุณยังไม่ได้เริ่มทำชุดคำถามนี้ หากต้องการยกเลิกให้คลิกที่ปุ่ม End')
        return
      }
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
                answers: self.answers,
                end: submittedAt,
                submittedAt: submittedAt
              }
          ).then(()=>{
            // this.$buefy.toast.open({
            //   message: "ระบบได้บันทึกคำตอบเรียบร้อยแล้ว",
            //   type: "is-success"
            // })
            let srs = 0
            let totalScore = self.answers.filter((d) => d.answer === d.key && d.point > 0)
            // console.log(`Total score is ${totalScore.length}`, self.question.sessionId)
            db.collection('session_records')
                .where('sessionId', '==', self.question.sessionId)
                .where('email', '==', self.$store.state.user.email)
                .get().then((querySnapshot)=>{
                  querySnapshot.docs.forEach((snapshot)=>{
                    let data = snapshot.data()
                    srs = data.attempts + 1
                    // console.log(`Total score ${totalScore}`)
                    let pass = totalScore.length >= self.session.passingScore ? true : false
                    // console.log(`Pass result ${pass}`)
                    db.collection('session_records').doc(snapshot.id).update({attempts: data.attempts + 1, pass: pass})
                  })
                }).then(() => {
                  if (self.$store.state.profile.group == "กลุ่มลำดับเลขคี่") {
                    let diff = (submittedAt.getTime() - self.$store.state.lessonStartDateTime.getTime())/1000
                    diff /= 60
                    let srt = Math.round(diff) 
                    let timeMessage = ""
                    let evalMessage = ""
                    let tet = self.$store.state.tet
                    let tes = self.$store.state.tes
                    let set = self.$store.state.setAnswer
                    let ses = self.$store.state.sesAnswer
                    let svs = self.$store.state.svsAnswer
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
                      <h1 class="title is-size-4">Score</h1>
                      <p>${totalScore.length}</p>
                      <h1 class="title is-size-4">Time Management</h1>
                      <p>${timeMessage}</p>
                      <h1 class="title is-size-4">Performance</h1>
                      <p>${evalMessage}</p>
                      `
                    }).then(()=>{
                        self.$router.push({ name: 'UserProgramList' })
                    })
                  } else {
                    Swal.fire({
                      title: `Feedback`,
                      html: `
                      <h1 class="title is-size-4">Score</h1>
                      <p>${totalScore.length} คะแนน</p>
                      `
                    }).then(()=>{
                        self.$router.push({ name: 'UserProgramList' })
                    })
                  }
                  self.$store.dispatch('setSessionId', null)
                  self.$store.dispatch('clearAnswers')
                })
          })
        }
      })
    },
    loadData () {
      this.isMediaLoading = true
      this.questionNo = parseInt(this.$route.params.questionNo)
      this.question = this.questions[this.questionNo].data
      this.questionId = this.questions[this.questionNo].id
      this.stage = new this.createjs.Stage('imageCanvas');
      this.queue = new this.createjs.LoadQueue(false, null, true);
      this.queue.on('complete', this.handleComplete)
      if (this.answers[this.questionNo] !== undefined) {
        this.answer = this.answers[this.questionNo].answer
      }
      try {
        this.question.updatedAt = this.question.updatedAt.toDate()
      } catch (err) {
        console.log('pass')
      }
      db.collection('sessions').doc(this.question.sessionId).get().then((snapshot) => {
        this.session = snapshot.data()
      })
      if (this.question.videoId) {
        db.collection('video').doc(this.question.videoId).get().then((snapshot) => {
          if (snapshot.exists) {
            this.video = snapshot.data()
            this.hasMedia = true
          }
        })
      }
      if (this.question.mediaId) {
        db.collection('media').doc(this.question.mediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            this.hasMedia = true
            this.imageUrl = snapshot.data().fileUrl
            this.queue.loadManifest(
                [
                  {
                    src: this.imageUrl,
                    crossOrigin: true,
                    id: "image",
                    type: "image"
                  },
                  {
                    src: "https://firebasestorage.googleapis.com/v0/b/virtual-microscope-b0953.appspot.com/o/assets%2Fpin2.png?alt=media&token=6e87c161-32b6-411c-9c0d-df9adf275709",
                    crossOrigin: true,
                    id: 'pin',
                    type: "image"
                  }
                ]
            )
          } else {
            this.isMediaLoading = false
            this.isMediaMissing = true
          }
        })
      } else {
        this.isMediaLoading = false
      }
    },
    prevQuestion() {
      this.answer = null
      let prev = this.questionNo > 0 ? this.questionNo - 1 : 0
      this.$buefy.toast.open({
        message: "บันทึกคำตอบเรียบร้อย",
        type: "is-success",
      })
      this.$router.push({
        name: 'Question',
        params: {
          lessonId: this.$route.params.lessonId, programId: this.$route.params.programId,
          sessionId: this.$route.params.sessionId, questionNo: prev.toString()
        }
      })
    },
    nextQuestion() {
      let next = this.questionNo + 1
      if (this.answer === null) {
        this.answers[this.questionNo] = {
          'answer': '',
          'updatedAt': new Date(),
          'questionId': this.questionId,
          'key': this.question.answer
        }
      }
      db.collection('records')
          .doc(this.$store.state.recordId).update({
        answers: this.answers
      }).then(() => {
        this.$buefy.toast.open({
          message: "บันทึกคำตอบเรียบร้อย",
          type: "is-success",
        })
      }).catch(e=>{
        this.$buefy.toast.open({
              message: e.toString(),
              type: "is-danger"
          })
      })
      if (next < this.questions.length) {
        this.answer = null
        this.$router.push({
          name: 'Question',
          params: {
            lessonId: this.$route.params.lessonId, programId: this.$route.params.programId,
            sessionId: this.$route.params.sessionId, questionNo: next.toString()
          }
        })
      } else {
        this.$store.dispatch('setSessionId', null)
        this.$buefy.dialog.confirm({
          title: "End of the session",
          message: "ท่านทำมาถึงข้อสุดท้ายแล้ว กรุณากดส่งคำตอบเพื่อจบกิจกรรมนี้",
          type: "is-success",
          ariaRole: 'alertdialog',
          ariaModal: true,
          cancelText: "ทำต่อ",
          confirmText: "ส่งคำตอบ",
          onConfirm: ()=>{
            this.submit()
          }
        })
      }
    },
    giveFeedback () {
    },
    handleComplete() {
      let image = this.queue.getResult('image')
      let pin = this.queue.getResult('pin')
      this.bmp = new this.createjs.Bitmap(image);
      this.pin = new this.createjs.Bitmap(pin)
      this.stage.addChild(this.bmp)
      if (this.question.x !== null && this.question.y != null) {
        this.pin.x = this.question.x - 30
        this.pin.y = this.question.y - 62
      } else {
        this.pin.visible = false
      }
      this.stage.addChild(this.pin)
      this.stage.update()
      this.isMediaLoading = false
    }
  }
}
</script>

<style scoped>

</style>