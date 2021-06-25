<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">
            {{ question.title }}
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
              <div class="tile is-parent">
                <div class="tile is-child notification is-light">
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
                    <button class="button is-light"
                            @click="$router.push({ name: 'UserQuestionList', params: { sessionId: $route.params.sessionId,
                              programId:$route.params.programId, lessonId:$route.params.lessonId }})">
                      <span class="icon">
                        <i class="fas fa-chevron-left"></i>
                      </span>
                      <span>Back</span>
                    </button>
                    <button class="button is-success" @click="nextQuestion">
                      <span class="icon">
                        <i class="far fa-save"></i>
                      </span>
                      <span>Next</span>
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

export default {
  name: "UserQuestion",
  components: {NavMenu},
  data() {
    return {
      isLoggedIn: false,
      questions: [],
      questionId: null,
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
  watch: {
    '$route.params.questionNo': function () {
      this.loadData()
    }
  },
  mounted() {
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.loadData()
  },
  methods: {
    loadData() {
      const self = this
      let questionNo =  parseInt(self.$route.params.questionNo)
      db.collection("questions")
          .where("sessionId", "==", self.$route.params.sessionId)
          .where("no", "==", questionNo)
          .get().then((snapshot) => {
            if (snapshot.docs.length == 0) {
              self.$router.push({ name: 'UserQuestionList', params: { programId: self.$route.params.programId,
                lessonId: self.$route.params.lessonId, sessionId: self.$route.params.sessionId }})
            }
        let doc = snapshot.docs[0]
        self.question = doc.data()
        self.question.updatedAt = self.question.updatedAt.toDate()
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
      })
      this.stage = new this.createjs.Stage(this.$refs.imageCanvasEdit);
      this.queue = new this.createjs.LoadQueue(false, null, true);
      this.queue.on('complete', this.handleComplete)
    },
    nextQuestion() {
      this.$buefy.toast.open({
        message: "บันทึกคำถามเรียบร้อย",
        type: "is-success",
      })
      let questionNo = parseInt(this.$route.params.questionNo)
      questionNo = questionNo + 1
      this.$router.push({
        name: 'Question',
        params: {lessonId: this.$route.params.lessonId, programId: this.$route.params.programId,
          sessionId: this.$route.params.sessionId, questionNo: questionNo.toString()}
      })
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