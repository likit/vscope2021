<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <canvas ref="imageCanvasEdit" width="800" height="800"></canvas>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";

export default {
  name: "MediaPreview",
  components: {NavMenu},
  data() {
    return {
      // TODO: The logged in should be read from the vuex store.
      isLoggedIn: false,
      questionId: null,
      questionNo: null,
      question: {
        choices: [],
      },
      answer: null,
      media: {},
      video: {},
      stage: null,
      queue: null,
      bmp: null,
      pin: null,
    }
  },
  mounted() {
    this.loadData()
  },
  created() {
    this.queue = new this.createjs.LoadQueue(false, null, true)
    this.queue.on('complete', this.handleComplete)
    this.queue.loadManifest(
        [
          {
            src: 'https://firebasestorage.googleapis.com/v0/b/virtual-microscope-b0953.appspot.com/o/media%2F2.jpg?alt=media&token=d862d55b-0357-4c8c-83ea-72184816699a',
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
  },
  methods: {
    loadData () {
      this.stage = new this.createjs.Stage(this.$refs.imageCanvasEdit);
    },
    handleComplete() {
      let image = this.queue.getResult('image')
      this.bmp = new this.createjs.Bitmap(image);
      this.stage.addChild(this.bmp)
      this.stage.update()
    }
  }
}
</script>

<style scoped>

</style>
