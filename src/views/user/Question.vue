<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">
            ข้อที่ {{ question.no }}) {{ question.title }}
          </h1>
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
      <div class="columns">
        <div class="column">
          <div class="tile is-ancestor">
            <div class="tile">
              <div class="tile is-parent is-vertical">
                <div class="tile is-child">
                  <span v-if="question.videoLink" v-html="question.videoLink"></span>
                </div>
                <div class="tile is-child notification is-light"
                     v-if="question.x && question.y">
                  <canvas ref="imageCanvasEdit" width="800" height="800"></canvas>
                </div>
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box">
                  {{ question.point }} point(s)
                  <div class="notification is-light is-warning">
                    <h1 class="title is-size-5">ตัวเลือกคำตอบ</h1>
                    <b-field>
                      <div class="block">
                        <b-radio v-for="choice in question.choices" :key="choice" v-model="answer"
                                 name="choice" :native-value="choice">
                          {{ choice }}
                        </b-radio>
                      </div>
                    </b-field>
                  </div>
                  <div class="buttons is-centered">
                    <button class="button is-danger" @click="endSession">
                      <span class="icon">
                         <i class="far fa-times-circle"></i>
                      </span>
                      <span>End</span>
                    </button>
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
                </div>
              </div>
            </div>
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
  name: "UserQuestion",
  components: {NavMenu},
  data() {
    return {
      isLoggedIn: false,
      questionId: null,
      questionNo: null,
      question: {
        choices: [],
      },
      answer: null,
      media: null,
      queue: null,
      stage: null,
      bmp: null,
      pin: null,
    }
  },
  computed: {
    ...mapState(['questions', 'answers']),
  },
  watch: {
    '$route.params.questionNo': function () {
      this.loadData()
    },
    'answer': function (val) {
      this.answer = val
      this.answers[this.questionNo] = {
        'answer': val,
        'updatedAt': new Date(),
        'questionId': this.questionId,
        'key': this.question.answer
      }
    }
  },
  mounted() {
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.loadData()
  },
  methods: {
    endSession () {
      const self = this
      self.$buefy.dialog.confirm({
        message: 'ท่านต้องการสิ้นสุดชุดทดสอบนี้และเริ่มชุดทดสอบใหม่ใช่หรือไม่',
        title: 'End the current session',
        type: 'is-warning',
        ariaRole: 'alertdialog',
        ariaModal: true,
        cancelText: "ยกเลิก",
        confirmText: "ยืนยัน",
        onConfirm: () => {
          db.collection('records')
              .where('sessionId', '==', self.$store.state.sessionId)
              .orderBy('start', 'desc')
              .get().then(snapshot=>{
            let ref = snapshot.docs[0]
            db.collection('records').doc(ref.id).update({
              end: new Date()
            }).then(()=>{
              self.$buefy.toast.open({
                message: "The session has ended.",
                type: "is-success"
              })
              self.$store.dispatch('setSessionId', null)
              self.$router.push({ name: 'MainPage' })
            })
          })
        }
      })
    },
    loadData () {
      const self = this
      self.questionNo = parseInt(self.$route.params.questionNo)
      self.question = self.questions[self.questionNo].data
      self.questionId = self.questions[self.questionNo].id
      if (self.answers[self.questionNo] !== undefined) {
        self.answer = self.answers[self.questionNo].answer
      }
      try {
        self.question.updatedAt = self.question.updatedAt.toDate()
      } catch (err) {
        console.log('pass')
      }
      if (self.$route.params.mediaId) {
        self.question.mediaId = self.$route.params.mediaId
      }
      if (self.question.mediaId) {
        db.collection('media').doc(self.question.mediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            self.media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: self.media.fileUrl,
                    crossOrigin: true,
                    id: "image"
                  },
                  {
                    src: "https://firebasestorage.googleapis.com/v0/b/virtual-microscope-b0953.appspot.com/o/assets%2Fpin2.png?alt=media&token=6e87c161-32b6-411c-9c0d-df9adf275709",
                    crossOrigin: true,
                    id: 'pin'
                  }
                ]
            )
          }
        })
      }
      this.stage = new this.createjs.Stage(this.$refs.imageCanvasEdit);
      this.queue = new this.createjs.LoadQueue(false, null, true);
      this.queue.on('complete', this.handleComplete)
    },
    prevQuestion() {
      const self = this
      let prev = self.questionNo > 0 ? self.questionNo - 1 : 0
      console.log(prev)
      this.$buefy.toast.open({
        message: "บันทึกคำถามเรียบร้อย",
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
      const self = this
      let next = self.questionNo + 1
      db.collection('records')
          .where('sessionId', '==', self.$store.state.sessionId)
          .orderBy('start', 'desc').get().then(snapshot => {
        if (snapshot.docs.length > 0) {
          db.collection('records').doc(snapshot.docs[0].id).update({
            answers: self.answers
          }).then(() => {
            self.$buefy.toast.open({
              message: "บันทึกคำถามเรียบร้อย",
              type: "is-success",
            })
          })
        }
      })
      if (next < self.questions.length) {
        this.$router.push({
          name: 'Question',
          params: {
            lessonId: this.$route.params.lessonId, programId: this.$route.params.programId,
            sessionId: this.$route.params.sessionId, questionNo: next.toString()
          }
        })
      } else {
        this.$store.dispatch('setSessionId', null)
        this.$buefy.toast.open({
          message: "จบแบบทดสอบ",
          type: "is-success",
        })
        this.$router.push({
          name: 'UserSessionList',
          params: {
            lessonId: this.$route.params.lessonId,
            programId: this.$route.params.programId,
          }
        })
      }
    },
    handleComplete() {
      let image = this.queue.getResult('image')
      let pin = this.queue.getResult('pin')
      this.bmp = new this.createjs.Bitmap(image);
      this.pin = new this.createjs.Bitmap(pin)
      this.stage.addChild(this.bmp)
      if (this.question.x && this.question.y) {
        this.pin.x = this.question.x - 30
        this.pin.y = this.question.y - 62
        this.stage.addChild(this.pin)
      }
      this.stage.update()
    }
  }
}
</script>

<style scoped>

</style>