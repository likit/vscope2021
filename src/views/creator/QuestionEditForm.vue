<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">
            Edit Question
          </h1>
        </div>
      </div>
      <div class="columns">
        <div class="column is-9">
          <div class="tile is-ancestor">
            <div class="tile">
              <div class="tile is-parent">
                <div class="tile is-child notification is-light">
                  <canvas ref="imageCanvasEdit" width="800" height="800"></canvas>
                </div>
              </div>
              <div class="tile is-parent">
                <div class="tile is-child notification is-light is-info">
                  <b-field label="คำสั่งหรือคำถาม" type="is-danger" message="required">
                    <b-input v-model="question.title"></b-input>
                  </b-field>
                  <b-field label="คะแนน">
                    <b-numberinput :min="0" type="is-info" v-model="question.point"></b-numberinput>
                  </b-field>
                  <div class="notification is-white">
                    <h1 class="title is-size-5">ใช้ภาพประกอบ</h1>
                    <p class="notification" v-if="media">ชื่อ {{ media.name }}</p>
                    <div class="buttons">
                      <router-link class="button is-info is-outlined"
                                   :to="{ name: 'MediaBrowser', params: { sessionId: sessionId, questionId: questionId }}">
              <span class="icon">
                <i class="far fa-image"></i>
              </span>
                        <span>เลือกรูปภาพ</span>
                      </router-link>
                      <button class="button is-outlined is-danger" :disabled="media === null" @click="removeMedia">
                        เอารูปภาพออก
                      </button>
                    </div>
                    <b-field label="X">
                      <b-input v-model="question.x" :disabled="media === null"></b-input>
                    </b-field>
                    <b-field label="Y">
                      <b-input v-model="question.y" :disabled="media === null"></b-input>
                    </b-field>
                  </div>
                  <div class="notification is-light is-warning">
                    <h1 class="title is-size-5">ตัวเลือก</h1>
                    <b-field>
                      <div class="block">
                        <b-radio v-for="choice in question.choices" :key="choice" v-model="question.answer"
                                 name="choice" :native-value="choice">
                          {{ choice }}
                        </b-radio>
                      </div>
                    </b-field>
                    <b-field>
                      <b-input v-model="newChoice"></b-input>
                    </b-field>
                    <div class="buttons">
                      <button class="button is-success is-light" @click="addChoice" :disabled="newChoice==null">Add
                        Choice
                      </button>
                      <button class="button is-danger is-light" @click="clearChoice"
                              :disabled="question.choices.length==0">Delete Choices
                      </button>
                    </div>
                    <b-field label="คำตอบ">
                      <strong>{{ question.answer }}</strong>
                    </b-field>
                  </div>
                  <div class="buttons is-centered">
                    <button class="button is-light"
                            @click="$router.push({ name: 'SessionInfo', params: { sessionId: $route.params.sessionId }})">
                      <span class="icon">
                        <i class="fas fa-chevron-left"></i>
                      </span>
                      <span>Back</span>
                    </button>
                    <button class="button is-success" @click="saveData">
                      <span class="icon">
                        <i class="far fa-save"></i>
                      </span>
                      <span>Save</span>
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
import {db, auth} from '../../firebase'
import NavMenu from "../../components/navMenu"

export default {
  name: "QuestionEditForm",
  components: {NavMenu},
  data() {
    return {
      isLoggedIn: false,
      questionId: null,
      sessionId: null,
      question: {
        choices: [],
      },
      media: null,
      queue: null,
      stage: null,
      choice: null,
      newChoice: null,
      bmp: null,
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.sessionId = this.$route.params.sessionId
    this.questionId = this.$route.params.questionId
    this.stage = new this.createjs.Stage(this.$refs.imageCanvasEdit);
    this.queue = new this.createjs.LoadQueue(false, null, true);
    this.queue.on('complete', this.handleComplete)
    db.collection('questions').doc(this.questionId).get().then((snapshot) => {
      if (snapshot.exists) {
        self.question = snapshot.data()
        self.choice = self.question.answer
        if (self.$route.params.mediaId) {
          self.question.mediaId = self.$route.params.mediaId
        }
        if (self.question.mediaId) {
          db.collection('media').doc(self.question.mediaId).get().then((snapshot) => {
            if (snapshot.exists) {
              self.media = snapshot.data()
              self.queue.loadFile(
                  {
                    src: self.media.fileUrl,
                    crossOrigin: true,
                    id: "image"
                  }
              )
            }
          })
        }
      }
    })
  },
  methods: {
    addChoice() {
      this.question.choices.push(this.newChoice)
      this.newChoice = null
    },
    clearChoice() {
      this.question.choices = []
      this.choice = null
      this.newChoice = null
      this.question.answer = null
    },
    removeMedia() {
      this.media = null
      this.question.mediaId = null
      this.question.x = null
      this.question.y = null
      this.stage.removeChild(this.bmp)
      this.stage.update()
    },
    saveData() {
      if (this.question.title) {
        db.collection('questions').doc(this.questionId).update(this.question).then(() => {
          this.$buefy.toast.open({
            message: "บันทึกคำถามเรียบร้อย",
            type: "is-success",
          })
        })
      } else {
        this.$buefy.dialog.alert({
          message: 'กรุณากรอกข้อมูลในช่องที่จำเป็น',
          type: 'is-danger',
          hasIcon: true,
          icon: 'times-circle',
          iconPack: 'fa',
          ariaRole: 'alertdialog',
          ariaModal: true
        })
      }
    },
    handleComplete() {
      let image = this.queue.getResult('image')
      this.bmp = new this.createjs.Bitmap(image);
      this.bmp.addEventListener("click", this.handleClick);
      this.stage.addChild(this.bmp);
      this.stage.update();
    },
    handleClick(event) {
      this.question.x = event.localX.toFixed(2);
      this.question.y = event.localY.toFixed(2);
    }
  }
}
</script>

<style scoped>

</style>
