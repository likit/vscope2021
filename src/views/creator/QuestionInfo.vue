<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title has-text-centered">
          New Question
        </h1>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="tile is-ancestor">
          <div class="tile">
            <div class="tile is-parent">
              <div class="tile is-child notification">
                <video :src="video.fileUrl" v-if="video.fileUrl" controls></video>
                <iframe v-if="question.videoURL" width="560" height="315" :src="question.videoURL" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                <canvas ref="imageCanvas" width="800" height="800"></canvas>
              </div>
            </div>
            <div class="tile is-parent">
              <div class="tile is-child box">
                <b-field label="คำสั่งหรือคำถาม" type="is-danger" message="required">
                  <b-input v-model="title" type="textarea"></b-input>
                </b-field>
                <b-field label="คะแนน">
                  <b-numberinput :min="0" type="is-info" v-model="point"></b-numberinput>
                </b-field>
                <div class="notification is-white">
                  <h1 class="title is-size-5">ใช้ภาพประกอบ</h1>
                  <p class="notification" v-if="media">ชื่อ {{ media.name }}</p>
                  <div class="buttons">
                    <router-link class="button is-info is-outlined" :to="{ name: 'MediaBrowser', params: { sessionId: sessionId }}">
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
                    <b-input v-model="x" :readonly="true" :disabled="media === null"></b-input>
                  </b-field>
                  <b-field label="Y">
                    <b-input v-model="y" :readonly="true" :disabled="media === null"></b-input>
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
                  <b-field label="Video URL">
                    <b-input v-model="videoUrl"></b-input>
                  </b-field>
                  <div class="buttons">
                    <router-link class="button is-info is-outlined"
                                 :to="{ name: 'VideoBrowser', params: { sessionId: sessionId }}">
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
                  <h1 class="title is-size-5">ตัวเลือก</h1>
                  <b-field>
                    <div class="block">
                      <b-radio v-for="choice in choices" :key="choice" v-model="answer" name="choice" :native-value="choice">
                        {{ choice }}
                      </b-radio>
                    </div>
                  </b-field>
                  <b-field>
                    <b-input v-model="newChoice"></b-input>
                  </b-field>
                  <div class="buttons">
                    <button class="button is-success is-light" @click="addChoice" :disabled="newChoice==null">Add Choice</button>
                    <button class="button is-danger is-light" @click="clearChoice" :disabled="choices.length==0">Delete Choices</button>
                  </div>
                  <b-field label="คำตอบ">
                    <strong>{{ answer }}</strong>
                  </b-field>
                </div>
                <div class="buttons is-centered">
                  <button class="button is-outlined"
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
import {db,auth} from '../../firebase'
import NavMenu from "../../components/navMenu"

export default {
  name: "QuestionInfo",
  components: {NavMenu},
  data() {
    return {
      isLoggedIn: false,
      question: null,
      sessionId: null,
      mediaId: null,
      media: null,
      video: {},
      queue: null,
      stage: null,
      x: null,
      y: null,
      choices: [],
      choice: null,
      newChoice: null,
      answer: null,
      bmp: null,
      point: 0,
      title: null,
      pin: null,
      videoURL: null,
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    // TODO: fix this, both media and video cannot be added at the same time
    this.sessionId = this.$route.params.sessionId
    this.mediaId = this.$route.params.mediaId
    this.videoId = this.$route.params.videoId
    this.stage = new this.createjs.Stage(this.$refs.imageCanvas);
    this.queue = new this.createjs.LoadQueue(false, null, true);
    this.queue.on('complete', this.handleComplete)
    if (this.videoId) {
      db.collection('video').doc(this.videoId).get().then((snapshot) => {
        if (snapshot.exists) {
          self.video = snapshot.data()
        }
      })
    }
    if (this.mediaId) {
      db.collection('media').doc(this.mediaId).get().then((snapshot)=>{
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
        }
      })
    }
  },
  methods: {
    addChoice () {
      this.choices.push(this.newChoice)
      this.newChoice = null
    },
    clearChoice () {
      this.choices = []
      this.newChoice = null
      this.choice = null
      this.answer = null
    },
    removeVideo () {
      this.video = {}
      this.videoId = null
    },
    removeMedia () {
      this.media = null
      this.mediaId = null
      this.x = null
      this.y = null
      this.stage.removeChild(this.bmp)
      this.stage.removeChild(this.pin)
      this.stage.update()
    },
    saveData () {
      if (this.title) {
        db.collection('questions').add({
          title: this.title,
          sessionId: this.sessionId,
          mediaId: this.mediaId || null,
          videoId: this.videoId || null,
          answer: this.answer,
          choices: this.choices,
          x: this.x,
          y: this.y,
          point: this.point,
          creator: auth.currentUser.email,
          videoURL: this.videoURL,
          updatedAt: new Date()
        }).then(()=>{
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
    removePin () {
      this.x = null
      this.y = null
      this.stage.removeChild(this.pin)
      this.stage.update()
    },
    handleComplete () {
      let image = this.queue.getResult('image')
      let pin = this.queue.getResult('pin')
      this.bmp = new this.createjs.Bitmap(image);
      this.pin = new this.createjs.Bitmap(pin)
      this.bmp.addEventListener("click", this.handleClick);
      this.stage.addChild(this.bmp);
      if (this.x && this.y) {
        this.pin.x = this.x - 30
        this.pin.y = this.y - 62
        this.stage.addChild(this.pin)
      }
      this.stage.update();
    },
    handleClick (event) {
      if (this.x == null && this.y == null) {
        this.stage.addChild(this.pin)
      }

      this.x = event.localX.toFixed(2);
      this.y = event.localY.toFixed(2);

      if (this.x && this.y) {
        this.pin.x = this.x - 30
        this.pin.y = this.y - 62
      }
      this.stage.update()
    }
  }
}
</script>

<style scoped>

</style>