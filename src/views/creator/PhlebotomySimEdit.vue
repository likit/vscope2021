<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <canvas ref="imageCanvas" width="800" height="800"></canvas>
      </div>
      <div class="column">
        <h1 class="title has-text-centered">
          Phlebotomy Simulation
        </h1>
        <b-field label="Format">
          <b-input v-model="question.format" readonly></b-input>
        </b-field>
        <b-field label="Title">
          <b-input v-model="question.title"></b-input>
        </b-field>
        <b-field label="แขนไม่รัด tourniquet">
          <b-select v-model="question.armWithOutTourniquetMediaId" placeholder="Select an image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="แขนรัด tourniquet">
          <b-select :change="loadArmImage()" v-model="question.armWithTourniquetMediaId" placeholder="Select Arm with tourniquet">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <div class="notification is-light">
        <label class="label">Line 1</label>
        <b-field label="X1">
          <b-input type="number" v-on:input="(e)=>drawLine1(e, line1)" v-model="question.line1X1"></b-input>
        </b-field>
        <b-field label="Y1">
          <b-input type="number" v-on:input="(e)=>drawLine1(e, line1)" v-model="question.line1Y1"></b-input>
        </b-field>
        <b-field label="X2">
          <b-input type="number" v-on:input="(e)=>drawLine1(e, line1)" v-model="question.line1X2"></b-input>
        </b-field>
        <b-field label="Y2">
          <b-input type="number" v-on:input="(e)=>drawLine1(e, line1)" v-model="question.line1Y2"></b-input>
        </b-field>
        <b-field label="Width">
          <b-input type="number" v-on:input="(e)=>drawLine1(e, line1)" v-model="question.line1Width"></b-input>
        </b-field>
        <b-field label="Depth">
          <b-input type="number" step="any" v-model="question.line1Depth"></b-input>
        </b-field>
        </div>
        <div class="notification is-light">
        <label class="label">Line 2</label>
        <b-field label="X1">
          <b-input type="number" v-on:input="(e)=>drawLine2(e, line2)" v-model="question.line2X1"></b-input>
        </b-field>
        <b-field label="Y1">
          <b-input type="number" v-on:input="(e)=>drawLine2(e, line2)" v-model="question.line2Y1"></b-input>
        </b-field>
        <b-field label="X2">
          <b-input type="number" v-on:input="(e)=>drawLine2(e, line2)" v-model="question.line2X2"></b-input>
        </b-field>
        <b-field label="Y2">
          <b-input type="number" v-on:input="(e)=>drawLine2(e, line2)" v-model="question.line2Y2"></b-input>
        </b-field>
        <b-field label="Width">
          <b-input type="number" v-on:input="(e)=>drawLine2(e, line2)" v-model="question.line2Width"></b-input>
        </b-field>
        <b-field label="Depth">
          <b-input type="number" step="any" v-model="question.line2Depth"></b-input>
        </b-field>
        </div>
        <div class="notification is-light">
        <label class="label">Line 3</label>
        <b-field label="X1">
          <b-input type="number" v-on:input="(e)=>drawLine3(e, line3)" v-model="question.line3X1"></b-input>
        </b-field>
        <b-field label="Y1">
          <b-input type="number" v-on:input="(e)=>drawLine3(e, line3)" v-model="question.line3Y1"></b-input>
        </b-field>
        <b-field label="X2">
          <b-input type="number" v-on:input="(e)=>drawLine3(e, line3)" v-model="question.line3X2"></b-input>
        </b-field>
        <b-field label="Y2">
          <b-input type="number" v-on:input="(e)=>drawLine3(e, line3)" v-model="question.line3Y2"></b-input>
        </b-field>
        <b-field label="Width">
          <b-input type="number" v-on:input="(e)=>drawLine3(e, line3)" v-model="question.line3Width"></b-input>
        </b-field>
        <b-field label="Depth">
          <b-input type="number" step="any" v-model="question.line3Depth"></b-input>
        </b-field>
        </div>
        <b-field label="สายรัดแขน">
          <b-select v-model="question.tourniquetMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="กล่องถุงมือ">
          <b-select v-model="question.gloveBoxMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="กระปุกสำลี">
          <b-select v-model="question.cottonBoxMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="หลอดเลือด">
          <b-select v-model="question.bloodTubeMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="ก้อนสำลี">
          <b-select v-model="question.cottonBallMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="กล่องทิ้งเข็ม">
          <b-select v-model="question.needleBinMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="รูปไอคอนเข็ม">
          <b-select v-model="question.needleMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <b-field label="รูป transpore">
          <b-select v-model="question.transporeMediaId" placeholder="Select the image">
            <option v-for="m in mediaList" :value="m.id" :key="m.id">
              {{ m.data.name }}
            </option>
          </b-select>
        </b-field>
        <div class="buttons is-centered">
          <button class="button is-light"
                  @click="$router.push({ name: 'SessionInfo', params: { sessionId: question.sessionId }})">
            <span class="icon">
              <i class="fas fa-chevron-left"></i>
            </span>
            <span>Back</span>
          </button>
          <button class="button is-warning" @click="copyData">
            <span class="icon">
              <i class="far fa-copy"></i>
            </span>
            <span>Save as new</span>
          </button>
          <button class="button is-success" @click="saveData">Save</button>
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
  name: "PhlebotomySimEdit",
  components: {NavMenu},
  data() {
    return {
      isLoggedIn: false,
      question: {
        format: "PhlebotomySim",
        title: "",
        armWithTourniquetMediaId: null,
        armWithTouriquetMedia: null,
        armWithOutTourniquetMediaId: null,
        armWithOutTouriquetMedia: null,
        tourniquetMediaId: null,
        cottonBoxMediaId: null,
        gloveBoxMediaId: null,
        bloodTubeMediaId: null,
        cottonBallMediaId: null,
        syringeMediaId: null,
        needleBinMediaId: null,
        transporeMediaId: null,
        needleMediaId: null,
        tubeMediaId: null,
        updatedAt: null,
        line1X1: null,
        line1Y1: null,
        line1X2: null,
        line1Y2: null,
        line1Depth: null,
        line1Width: null,
        line2X1: null,
        line2Y1: null,
        line2X2: null,
        line2Y2: null,
        line2Depth: null,
        line2Width: null,
        line3X1: null,
        line3Y1: null,
        line3X2: null,
        line3Y2: null,
        line3Depth: null,
        line3Width: null,
      },
      mediaList: [],
      queue: null,
      stage: null,
      line1: null,
      line2: null,
      line3: null,
      sessionId: null
    }
  },
  watch: {

  },
  methods: {
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
    loadArmImage () {
      let self = this
      if (self.question.armWithTourniquetMediaId) {
        db.collection('media').doc(self.question.armWithTourniquetMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "armWithTourniquetImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    drawLine1(event, line) {
      let self = this
      line.graphics.clear()
      if (self.question.line1X1 && self.question.line1X2 && self.question.line1Y1 && self.question.line1Y2)
        line.graphics.setStrokeStyle(self.question.line1Width)
          .beginStroke(this.createjs.Graphics.getRGB(0,153,76,0.2))
          .moveTo(self.question.line1X1, self.question.line1Y1)
          .lineTo(self.question.line1X2, self.question.line1Y2)
          .endStroke()
      // self.stage.addChild(line)
      self.stage.update()
    },
    drawLine2(event, line) {
      let self = this
      line.graphics.clear()
      if (self.question.line2X1 && self.question.line2X2 && self.question.line2Y1 && self.question.line2Y2)
        line.graphics.setStrokeStyle(self.question.line2Width)
          .beginStroke(this.createjs.Graphics.getRGB(0,153,76,0.2))
          .moveTo(self.question.line2X1, self.question.line2Y1)
          .lineTo(self.question.line2X2, self.question.line2Y2)
          .endStroke()
      // self.stage.addChild(line)
      self.stage.update()
    },
    drawLine3(event, line) {
      let self = this
      line.graphics.clear()
      if (self.question.line3X1 && self.question.line3X2 && self.question.line3Y1 && self.question.line3Y2)
        line.graphics.setStrokeStyle(self.question.line3Width)
          .beginStroke(this.createjs.Graphics.getRGB(0,153,76,0.2))
          .moveTo(self.question.line3X1, self.question.line3Y1)
          .lineTo(self.question.line3X2, self.question.line3Y2)
          .endStroke()
      // self.stage.addChild(line)
      self.stage.update()
    },
    handleLineClick() {
      alert("Got me! You are on fire!!!")
    },
    handleClick(event) {
      console.log(event.localX.toFixed(2), event.localY.toFixed(2))
      this.stage.update()
    },
    handleComplete() {
      let self = this
      let image = self.queue.getResult('armWithTourniquetImage')
      let bmp = new self.createjs.Bitmap(image);
      bmp.addEventListener("click", self.handleClick);
      self.stage.addChild(bmp)
      self.drawLine1(event, self.line1)
      self.drawLine2(event, self.line2)
      self.drawLine3(event, self.line3)
      self.stage.addChild(self.line1)
      self.stage.addChild(self.line2)
      self.stage.addChild(self.line3)
      self.stage.update()
    },
    saveData () {
      let self = this
      if (self.questionId == null) {
        self.updatedAt = new Date()
        self.question.sessionId = self.sessionId
        db.collection('questions').add(self.question).then(()=>{
          this.$buefy.toast.open({
            message: "บันทึกคำถามเรียบร้อย",
            type: "is-success",
          })
        })
      } else {
        self.question.updatedAt = new Date()
        db.collection('questions')
            .doc(self.questionId).update(self.question).then(() => {
          this.$buefy.toast.open({
            message: "บันทึกคำถามเรียบร้อย",
            type: "is-success",
          })
        })
      }
    },
  },
  mounted() {
    this.sessionId = this.$route.params.sessionId
    this.questionId = this.$route.params.questionId
    this.stage = new this.createjs.Stage(this.$refs.imageCanvas);
    this.queue = new this.createjs.LoadQueue(false, null, true);
    this.line1 = new this.createjs.Shape()
    this.line1.on("click", this.handleLineClick)
    this.line2 = new this.createjs.Shape()
    this.line2.on("click", this.handleLineClick)
    this.line3 = new this.createjs.Shape()
    this.line3.on("click", this.handleLineClick)
    this.queue.on('complete', this.handleComplete)
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    const self = this
    db.collection('media').orderBy('uploaded_at', 'desc')
      .get().then((snapshot)=>{
      snapshot.docs.forEach((d)=>{
        self.mediaList.push({
          id: d.id,
          data: d.data()
        })
      })
      self.isLoading = false
    })
    db.collection('questions').doc(this.questionId).get().then((snapshot) => {
      if (snapshot.exists) {
        self.question = snapshot.data()
        self.question.updatedAt = self.question.updatedAt.toDate()
      }
    })
  }
}
</script>

<style scoped>

</style>