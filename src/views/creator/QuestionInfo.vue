<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <h1 class="title has-text-centered">
          New Question
        </h1>
        <p>{{ sessionId }}</p>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <router-link class="button" :to="{ name: 'MediaBrowser', params: { sessionId: sessionId }}">
          Add Image
        </router-link>
        <canvas ref="imageCanvas" width="800" height="800"></canvas>
      </div>
      <div class="column box">
        <b-field label="คำอธิบาย/คำถาม" type="is-danger" message="required">
          <b-input v-model="question"></b-input>
        </b-field>
        <b-field label="X">
          <b-input v-model="x"></b-input>
        </b-field>
        <b-field label="Y">
          <b-input v-model="y"></b-input>
        </b-field>
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
      queue: null,
      stage: null,
      x: null,
      y: null,
      bmp: null
    }
  },
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    this.sessionId = this.$route.params.sessionId
    this.mediaId = this.$route.params.mediaId
    this.stage = new this.createjs.Stage(this.$refs.imageCanvas);
    this.queue = new this.createjs.LoadQueue(false, null, true);
    this.queue.on('complete', this.handleComplete)
    if (this.mediaId) {
      db.collection('media').doc(this.mediaId).get().then((snapshot)=>{
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
    db.collection('sessions').doc(this.sessionId).get().then((snapshot)=>{
      if (snapshot.exists) {
        self.session = snapshot.data()
      }
    })
  },
  methods: {
    saveData () {},
    handleComplete () {
      let image = this.queue.getResult('image')
      this.bmp = new this.createjs.Bitmap(image);
      this.bmp.addEventListener("click", this.handleClick);
      this.stage.addChild(this.bmp);
      this.stage.update();
    },
    handleClick (event) {
      this.x = event.localX.toFixed(2);
      this.y = event.localY.toFixed(2);
    }
  }
}
</script>

<style scoped>

</style>