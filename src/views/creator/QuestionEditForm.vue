<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">
            Edit Question
          </h1>
          <h2 class="subtitle has-text-centered has-text-info-dark" v-if="question.updatedAt">
            <span>โดย {{ question.creator }}</span>
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
                <div class="tile is-child notification is-light" v-if="isMediaMissing === false">
                  <canvas ref="imageCanvasEdit" width="800" height="800"></canvas>
                  <video :src="video.fileUrl" v-if="video.fileUrl" controls></video>
                </div>
                <div v-else class="tile is-child notification is-light">
                  <span class="icon">
                    <i class="far fa-image"></i>
                  </span>
                  <span>
                    Media is missing...The media might have been removed. Please replace it.
                  </span>
                </div>
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box">
                  <b-field label="คำสั่งหรือคำถาม" type="is-danger" message="required">
                    <b-input v-model="question.title" type="textarea"></b-input>
                  </b-field>
                  <b-field label="ลำดับที่">
                    <b-numberinput v-model="question.no" type="is-info" :min="1"></b-numberinput>
                  </b-field>
                  <b-field label="คะแนน">
                    <b-numberinput :min="0" type="is-info" v-model="question.point"></b-numberinput>
                  </b-field>
                  <div class="notification is-white">
                    <h1 class="title is-size-5">ใช้ภาพประกอบ</h1>
                    <p class="notification" v-if="media">ชื่อ {{ media.name }}</p>
                    <div class="buttons">
                      <router-link class="button is-info is-outlined"
                                   :to="{ name: 'MediaBrowser', params: { questionId: questionId }}">
                        <span class="icon">
                          <i class="far fa-image"></i>
                        </span>
                        <span>เลือกรูปภาพ</span>
                      </router-link>
                      <button class="button is-outlined is-danger" :disabled="media === null" @click="removeMedia">
                        <span class="icon">
                          <i class="far fa-trash-alt"></i>
                        </span>
                        <span>ลบรูปภาพ</span>
                      </button>
                    </div>
                    <b-field label="X">
                      <b-input v-model="question.x" :readonly="true" :disabled="media === null"></b-input>
                    </b-field>
                    <b-field label="Y">
                      <b-input v-model="question.y" :readonly="true" :disabled="media === null"></b-input>
                    </b-field>
                    <button class="button is-danger is-outlined" @click="removePin">
                      <span class="icon">
                        <i class="fas fa-map-pin"></i>
                      </span>
                      <span>ลบเข็มชี้</span>
                    </button>
                  </div>
                  <div class="notification is-white">
                    <h1 class="title is-size-5">ใช้วิดีโอประกอบ</h1>
                    <p class="notification" v-if="video">ชื่อ {{ video.name }}</p>
                    <div class="buttons">
                      <router-link class="button is-info is-outlined"
                                   :to="{ name: 'VideoBrowser', params: { questionId: questionId }}">
                        <span class="icon">
                          <i class="far fa-image"></i>
                        </span>
                        <span>เลือกวิดีโอ</span>
                      </router-link>
                      <button class="button is-outlined is-danger" :disabled="video === null" @click="removeVideo">
                        <span class="icon">
                          <i class="far fa-trash-alt"></i>
                        </span>
                        <span>ลบรูปวิดีโอ</span>
                      </button>
                    </div>
                  </div>
                  <div class="notification is-light is-warning">
                    <h1 class="title is-size-5">ตัวเลือกคำตอบ</h1>
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
                            @click="$router.push({ name: 'SessionInfo', params: { sessionId: question.sessionId }})">
                      <span class="icon">
                        <i class="fas fa-chevron-left"></i>
                      </span>
                      <span>Back</span>
                    </button>
                    <button class="button is-success" @click="saveData" v-if="editable">
                      <span class="icon">
                        <i class="far fa-save"></i>
                      </span>
                      <span>Save</span>
                    </button>
                    <button class="button is-warning" @click="copyData">
                      <span class="icon">
                        <i class="far fa-copy"></i>
                      </span>
                      <span>Save as new</span>
                    </button>
                    <button class="button is-danger" @click="deleteData" v-if="editable">
                      <span class="icon">
                        <i class="far fa-trash-alt"></i>
                      </span>
                      <span>Delete</span>
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
      isMediaMissing: false,
      questionId: null,
      question: {
        choices: [],
      },
      media: {},
      video: {},
      queue: null,
      stage: null,
      choice: null,
      newChoice: null,
      bmp: null,
      pin: null,
    }
  },
  computed: {
    editable: function () {
      if (this.$store.state.user === null) {
        return false
      } else {
        return this.question.creator == this.$store.state.user.email
      }
    },
  },
  mounted() {
    const self = this
    this.questionId = this.$route.params.questionId
    this.stage = new this.createjs.Stage(this.$refs.imageCanvasEdit);
    this.queue = new this.createjs.LoadQueue(false, null, true);
    this.queue.on('complete', this.handleComplete)
    db.collection('questions').doc(this.questionId).get().then((snapshot) => {
      if (snapshot.exists) {
        self.question = snapshot.data()
        self.choice = self.question.answer
        self.question.updatedAt = self.question.updatedAt.toDate()
        if (self.$route.params.videoId) {
          self.question.videoId = self.$route.params.videoId
        }
        if (self.question.videoId) {
          db.collection('video').doc(self.question.videoId).get().then((snapshot) => {
            if (snapshot.exists) {
              self.video = snapshot.data()
            }
          })
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
              this.isMediaMissing = true
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
      this.stage.removeChild(this.pin)
      this.stage.update()
    },
    removeVideo() {
      this.video = null
      this.question.videoId = null
    },
    saveData() {
      if (this.question.title) {
        this.question.updatedAt = new Date()
        db.collection('questions')
            .doc(this.questionId).update(this.question).then(() => {
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
    copyData() {
      const self = this
      if (this.question.title) {
        this.question.creator = auth.currentUser.email
        this.question.updatedAt = new Date()
        this.question.title += "(copy -- edit me!)"
        db.collection("questions").add(this.question).then(() => {
          self.$buefy.toast.open({
            message: "บันทึกคำถามเรียบร้อย",
            type: "is-success",
          })
          self.$router.push({name: "SessionInfo", params: {sessionId: self.question.sessionId}})
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
    deleteData() {
      const self = this
      this.$buefy.dialog.confirm({
        title: "ลบรายการ",
        message: 'ท่านต้องการลบรายการนี้หรือไม่',
        type: 'is-danger',
        onConfirm: () => {
          db.collection('questions').doc(this.questionId).update({
            deleted: true
          }).then(() => {
            self.$buefy.toast.open({
              message: "ลบรายการเรียบร้อย",
              type: "is-success",
            })
            self.$router.push({name: "SessionInfo", params: {sessionId: self.question.sessionId}})
          })
        }
      })
    },
    removePin() {
      this.question.x = null
      this.question.y = null
      this.stage.removeChild(this.pin)
      this.stage.update()
    },
    handleComplete() {
      let image = this.queue.getResult('image')
      let pin = this.queue.getResult('pin')
      this.bmp = new this.createjs.Bitmap(image);
      this.pin = new this.createjs.Bitmap(pin)
      this.bmp.addEventListener("click", this.handleClick);
      this.stage.addChild(this.bmp)
      if (this.question.x && this.question.y) {
        this.pin.x = this.question.x - 30
        this.pin.y = this.question.y - 62
        this.stage.addChild(this.pin)
      }
      this.stage.update()
    },
    handleClick(event) {
      if (this.question.x == null && this.question.y == null) {
        this.stage.addChild(this.pin)
      }
      this.question.x = event.localX.toFixed(2);
      this.question.y = event.localY.toFixed(2);
      if (this.question.x && this.question.y) {
        this.pin.x = this.question.x - 30
        this.pin.y = this.question.y - 62
      }
      this.stage.update()
    }
  }
}
</script>

<style scoped>

</style>
