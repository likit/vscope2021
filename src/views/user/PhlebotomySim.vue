<template>
  <div>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">
            ข้อที่ {{ questionNo + 1 }}) {{ question.title }}
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
        <p class="has-text-danger"><strong>Instruction:</strong> {{ message }}</p>
        <canvas ref="imageCanvas" width="800" height="800"></canvas>
        </div>
        <div class="column">
          <b-field label="ปริมาณเลือด">
            <b-progress :max=10 size="is-medium" show-value type="is-danger" v-model="bloodVolume"></b-progress>
          </b-field>
          <b-field label="ความลึกของเข็ม (มม.)">
            <b-slider size="is-medium" :min="0" :max="5" v-model="needleDepth">
              <b-slider-tick :value="0">0.0</b-slider-tick>
              <b-slider-tick :value="1">0.1</b-slider-tick>
              <b-slider-tick :value="2">0.2</b-slider-tick>
              <b-slider-tick :value="3">0.3</b-slider-tick>
              <b-slider-tick :value="4">0.4</b-slider-tick>
              <b-slider-tick :value="5">0.5</b-slider-tick>
            </b-slider>
          </b-field>
          <p class="has-text-danger">{{ depthMessage }}</p>
          <div class="buttons">
            <b-button :disabled="!tourniquetOn" v-on:click="rotateNeedle()">หมุนเข็ม</b-button>
            <b-button :disabled="bloodVolume < 10" v-on:click="rotateBloodTube()">Mix blood</b-button>
            <b-button class="button is-success" :disabled="!done" @click="nextQuestion">
              <span>Next</span>
              <span class="icon">
                <i class="fas fa-chevron-right"></i>
              </span>
            </b-button>
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
    </section>
  </div>
</template>

<script>
import {db} from "../../firebase";
import {mapState} from "vuex";

export default {
  name: "PhlebotomySim",
  data() {
    return {
      isMediaLoading: false,
      isMediaMissing: false,
      message: "",
      depthMessage: "",
      questionId: null,
      questionNo: null,
      question: {},
      armWithTourniquetMedia: null,
      armWithOutTouriquetMedia: null,
      tourniquetOn: false,
      hasCleaned: false,
      tourniquetMedia: null,
      cottonBoxMedia: null,
      gloveBoxMedia: null,
      bloodTubeMedia: null,
      cottonBallMedia: null,
      syringeMedia: null,
      needleBinMedia: null,
      needleMedia: null,
      transporeMedia: null,
      bloodVolume: 0,
      needleDepth: 0.0,
      queue: null,
      stage: null,
      line1: null,
      line2: null,
      line3: null,
      sessionId: null,
      needleOriX: 500,
      needleOriY: 200,
      drawnX: null,
      drawnY: null,
      mixTimes: 0,
      answer: null,
      transporePut: false
    }
  },
  computed: {
    ...mapState(['questions', 'answers']),
    needleHasMoved () {
      return (this.needleOriX !== this.needleMedia.x || this.needleOriY !== this.needleMedia.y)
    },
    done() {
      return ((this.bloodVolume == 10) && this.hasCleaned && (this.mixTimes > 0) && (this.transporePut))
    }
  },
  watch: {
    '$route.params.questionNo': function () {
      this.loadData(false)
    },
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
      if (this.answers.length === 0) {
        this.$buefy.dialog.alert('คุณยังไม่ได้เริ่มทำชุดคำถามนี้ หากต้องการยกเลิกให้คลิกที่ปุ่ม End')
        return
      }
      this.$buefy.dialog.confirm({
        message: 'ท่านต้องการส่งคำตอบและสิ้นสุดชุดนี้ใช่หรือไม่',
        title: 'Submit answer and end the session',
        type: 'is-warning',
        ariaRole: 'alertdialog',
        ariaModal: true,
        cancelText: "ยกเลิก",
        confirmText: "ยืนยัน",
        onConfirm: () => {
          let submittedAt = new Date()
          this.answers[this.questionNo] = {
            'answer': this.done,
            'updatedAt': new Date(),
            'questionId': this.questionId,
            'key': true,
          }
          db.collection('records')
              .doc(this.$store.state.recordId).update({
            answers: this.answers,
            end: submittedAt,
            submittedAt: submittedAt
              }
          ).then(()=>{
            this.$buefy.toast.open({
              message: "ระบบได้บันทึกคำตอบเรียบร้อยแล้ว",
              type: "is-success"
            })
            this.$store.dispatch('setSessionId', null)
            this.$store.dispatch('clearAnswers')
            this.$router.push({ name: 'UserProgramList' })
          })
        }
      })
    },
    loadData () {
      let self = this
      self.isMediaLoading = true
      self.questionNo = parseInt(self.$route.params.questionNo)
      self.question = self.questions[self.questionNo].data
      self.questionId = self.questions[self.questionNo].id
      self.line1 = new self.createjs.Shape()
      self.line2 = new self.createjs.Shape()
      self.line3 = new self.createjs.Shape()
      self.stage = new self.createjs.Stage(self.$refs.imageCanvas);
      self.createjs.Touch.enable(self.stage)
      self.queue = new self.createjs.LoadQueue(false, null, true);
      self.queue.on('complete', self.handleComplete)
      if (self.answers[self.questionNo] !== undefined) {
        self.answer = self.answers[self.questionNo].answer
      }
      try {
        self.question.updatedAt = self.question.updatedAt.toDate()
      } catch (err) {
        console.log('pass')
      }
      self.loadArmWithTourniquetImage()
      self.loadArmWithoutTourniquetImage()
      self.loadTourniquetImage()
      self.loadNeedleImage()
      self.loadCottonBallImage()
      self.loadTransporeImage()
      self.loadBloodTubeImage()
    },
    loadArmWithTourniquetImage () {
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
    loadArmWithoutTourniquetImage () {
      let self = this
      if (self.question.armWithOutTourniquetMediaId) {
        db.collection('media').doc(self.question.armWithOutTourniquetMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "armWithOutTourniquetImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    loadTourniquetImage () {
      let self = this
      if (self.question.armWithTourniquetMediaId) {
        db.collection('media').doc(self.question.tourniquetMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "tourniquetImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    loadBloodTubeImage () {
      let self = this
      if (self.question.armWithTourniquetMediaId) {
        db.collection('media').doc(self.question.bloodTubeMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "bloodTubeImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    loadNeedleImage () {
      let self = this
      if (self.question.armWithTourniquetMediaId) {
        db.collection('media').doc(self.question.needleMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "needleImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    loadCottonBallImage () {
      let self = this
      if (self.question.cottonBallMediaId) {
        console.log("load cotton ball image")
        db.collection('media').doc(self.question.cottonBallMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "cottonBallImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    loadCottonBoxImage () {
      let self = this
      if (self.question.cottonBoxMediaId) {
        db.collection('media').doc(self.question.cottonBoxMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "cottonBoxImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    loadTransporeImage () {
      let self = this
      if (self.question.transporeMediaId) {
        db.collection('media').doc(self.question.transporeMediaId).get().then((snapshot) => {
          if (snapshot.exists) {
            let media = snapshot.data()
            self.queue.loadManifest(
                [
                  {
                    src: media.fileUrl,
                    crossOrigin: true,
                    id: "transporeImage",
                    type: "image"
                  },
                ]
            )
          }
        })
      }
    },
    rotateNeedle() {
      let self = this
      self.needleMedia.rotation = self.needleMedia.rotation - 45
      self.stage.update()
    },
    rotateBloodTube() {
      let self = this
      self.mixTimes += 1
      self.bloodTubeMedia.rotation = self.bloodTubeMedia.rotation - 180
      self.stage.update()
    },
    drawLine1() {
      let self = this
      self.line1.graphics.clear()
      if (self.question.line1X1 && self.question.line1X2 && self.question.line1Y1 && self.question.line1Y2)
        self.line1.graphics.setStrokeStyle(self.question.line1Width)
          .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.01))
          .moveTo(self.question.line1X1, self.question.line1Y1)
          .lineTo(self.question.line1X2, self.question.line1Y2)
          .endStroke()
      // self.stage.addChild(line)
      self.stage.update()
    },
    drawLine2() {
      let self = this
      self.line2.graphics.clear()
      if (self.question.line2X1 && self.question.line2X2 && self.question.line2Y1 && self.question.line2Y2)
        self.line2.graphics.setStrokeStyle(self.question.line2Width)
          .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.01))
          .moveTo(self.question.line2X1, self.question.line2Y1)
          .lineTo(self.question.line2X2, self.question.line2Y2)
          .endStroke()
      // self.stage.addChild(line)
      self.stage.update()
    },
    drawLine3() {
      let self = this
      self.line3.graphics.clear()
      if (self.question.line3X1 && self.question.line3X2 && self.question.line3Y1 && self.question.line3Y2)
        self.line3.graphics.setStrokeStyle(self.question.line3Width)
          .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.01))
          .moveTo(self.question.line3X1, self.question.line3Y1)
          .lineTo(self.question.line3X2, self.question.line3Y2)
          .endStroke()
      // self.stage.addChild(line)
      self.stage.update()
    },
    prevQuestion() {
      let self = this
      self.answer = null
      let prev = self.questionNo > 0 ? self.questionNo - 1 : 0
      self.$buefy.toast.open({
        message: "บันทึกคำตอบเรียบร้อย",
        type: "is-success",
      })
      self.$router.push({
        name: 'Question',
        params: {
          lessonId: self.$route.params.lessonId, programId: self.$route.params.programId,
          sessionId: self.$route.params.sessionId, questionNo: prev.toString()
        }
      })
    },
    nextQuestion() {
      let self = this
      let next = self.questionNo + 1
      self.answers[self.questionNo] = {
        'answer': self.done,
        'updatedAt': new Date(),
        'questionId': self.questionId,
        'key': true,
      }
      db.collection('records')
          .doc(self.$store.state.recordId).update({
        answers: self.answers
      }).then(() => {
        self.$buefy.toast.open({
          message: "บันทึกคำตอบเรียบร้อย",
          type: "is-success",
        })
      }).catch(e=>{
        self.$buefy.toast.open({
              message: e.toString(),
              type: "is-danger"
          })
      })
      if (next < self.questions.length) {
        self.$router.push({
          name: 'Question',
          params: {
            lessonId: self.$route.params.lessonId, programId: self.$route.params.programId,
            sessionId: self.$route.params.sessionId, questionNo: next.toString()
          }
        })
      } else {
        self.$store.dispatch('setSessionId', null)
        self.$buefy.dialog.confirm({
          title: "End of the session",
          message: "ท่านทำมาถึงข้อสุดท้ายแล้ว กรุณากดส่งคำตอบเพื่อจบกิจกรรมนี้",
          type: "is-success",
          ariaRole: 'alertdialog',
          ariaModal: true,
          cancelText: "ทำต่อ",
          confirmText: "ส่งคำตอบ",
          onConfirm: ()=>{ self.submit() }
        })
      }
      self.answer = null
    },
    handleComplete() {
      let self = this
      let transporeImageRef = self.queue.getResult('transporeImage')
      self.transporeMedia = new self.createjs.Bitmap(transporeImageRef);
      self.transporeMedia.scale = 0.2
      self.transporeMedia.x = 500.0
      self.transporeMedia.y = 400.0
      self.transporeMedia.on("click", function() {
        // tourniquet must be released
        if (!self.armWithTouriquetMedia.visible) {
          if (self.bloodVolume == 10) {
            self.transporeMedia.x = self.drawnX
            self.transporeMedia.y = self.drawnY - 50
            self.transporePut = true
            self.stage.update()
          } else {
            self.message = "ควรเจาะเลือดให้ได้ปริมาณเต็มก่อน"
          }
        } else {
          self.message = "ควรปลด tourniquet ก่อน"
        }
      })
      let bloodTubeImageRef = self.queue.getResult('bloodTubeImage')
      self.bloodTubeMedia = new self.createjs.Bitmap(bloodTubeImageRef);
      self.bloodTubeMedia.visible = false
      self.bloodTubeMedia.x = 450.0
      self.bloodTubeMedia.y = 600.0
      self.bloodTubeMedia.rotation = -45
      self.bloodTubeMedia.scale = 0.2
      let armWithTourniquetImageRef = self.queue.getResult('armWithTourniquetImage')
      self.armWithTouriquetMedia = new self.createjs.Bitmap(armWithTourniquetImageRef);
      self.armWithTouriquetMedia.visible = false
      let armWithOutTourniquetImageRef = self.queue.getResult('armWithOutTourniquetImage')
      self.armWithOutTouriquetMedia = new self.createjs.Bitmap(armWithOutTourniquetImageRef);
      let tourniquetImageRef = self.queue.getResult('tourniquetImage')
      let needleImageRef = self.queue.getResult('needleImage')
      self.needleMedia = new self.createjs.Bitmap(needleImageRef);
      self.needleMedia.scale = 0.2
      self.needleMedia.x = self.needleOriX
      self.needleMedia.y = self.needleOriY
      self.needleMedia.on("pressmove", function(event) {
        console.log(self.armWithTouriquetMedia.visible)
        if (self.armWithTouriquetMedia.visible) {
          if (self.hasCleaned) {
            self.needleMedia.x = event.stageX
            self.needleMedia.y = event.stageY
            self.message = ""
            self.stage.update()
          } else {
            self.message = "ควรทำความสะอาดด้วยสำลีก่อนเจาะเลือด"
          }
        } else {
          self.message = "ควรรัดแขนด้วย tourniquet ก่อนเจาะเลือด"
        }
      })
      self.tourniquetMedia = new self.createjs.Bitmap(tourniquetImageRef)
      self.tourniquetMedia.scale = 0.3
      self.tourniquetMedia.x = 500.0
      self.tourniquetMedia.on("click", function() {
        if (self.armWithOutTouriquetMedia.visible) {
          if (!self.drawnX && !self.drawnY) {
            self.armWithOutTouriquetMedia.visible = false
            self.armWithTouriquetMedia.visible = true
            self.tourniquetOn = true
          } else {
            self.message = "การเจาะเลือดสิ้นสุดแล้ว"
          }
        } else {
          if (self.bloodVolume == 10) {
            self.needleMedia.x = self.needleOriX
            self.needleMedia.y = self.needleOriY
          }
          self.armWithTouriquetMedia.visible = false
          self.armWithOutTouriquetMedia.visible = true
          self.tourniquetOn = false
        }
        self.stage.update()
      })
      let cottonBallImageRef = self.queue.getResult('cottonBallImage')
      self.cottonBallMedia = new self.createjs.Bitmap(cottonBallImageRef);
      self.stage.addChild(self.armWithTouriquetMedia)
      self.stage.addChild(self.armWithOutTouriquetMedia)
      self.stage.addChild(self.tourniquetMedia)
      self.cottonBallMedia.scale = 0.1
      self.cottonBallMedia.x = 500
      self.cottonBallMedia.y = 300
      self.cottonBallMedia.on("pressmove", function (event) {
        self.hasCleaned = true
        if (self.drawnX || self.drawnY) {
          self.message = "ไม่ควรทำความสะอาดหลังเจาะเลือด"
        } else {
          self.cottonBallMedia.x = event.stageX
          self.cottonBallMedia.y = event.stageY
          self.stage.update()
        }
      })
      self.stage.addChild(self.cottonBallMedia)
      self.stage.addChild(self.transporeMedia)
      self.stage.addChild(self.bloodTubeMedia)
      let cottonBoxImageRef = self.queue.getResult('cottonBoxImage')
      self.cottonBoxMedia = new self.createjs.Bitmap(cottonBoxImageRef);
      self.cottonBoxMedia.scale = 0.1
      self.cottonBoxMedia.x = 500
      self.cottonBoxMedia.y = 300
      self.stage.addChild(self.cottonBoxMedia)
      self.drawLine1()
      self.drawLine2()
      self.drawLine3()
      self.line1.on("mousedown", function (e) {
        if (self.armWithTouriquetMedia.visible && self.needleHasMoved) {
          let pt = self.line1.localToLocal(e.localX, e.localY, self.needleMedia)
          self.drawnX = e.localX
          self.drawnY = e.localY
          if (self.needleMedia.hitTest(pt.x, pt.y)) {
            if (self.question.line1Depth * 10 == self.needleDepth && self.bloodVolume < 10) {
              self.depthMessage = ""
              self.message = ""
              self.bloodVolume = self.bloodVolume + 2
              if (self.bloodVolume == 10) {
                self.bloodTubeMedia.visible = true
              }
            } else {
              self.depthMessage = "ตรวจสอบความลึกของเข็มและปรับระดับให้เหมาะสม"
            }
          } else {
            self.message = "วางเข็มไว้บนเส้นเลือดและแตะที่ปลายเข็มเพื่อดูดเลือด"
          }
        } else {
          self.line1.graphics.clear()
          self.line1.graphics.setStrokeStyle(self.question.line1Width)
            .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.5))
            .moveTo(self.question.line1X1, self.question.line1Y1)
            .lineTo(self.question.line1X2, self.question.line1Y2)
            .endStroke()
          self.stage.update()
        }
      })
      self.line1.on("pressup", function () {
        if (!self.isDrawing) {
          self.line1.graphics.clear()
          self.line1.graphics.setStrokeStyle(self.question.line1Width)
            .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.05))
            .moveTo(self.question.line1X1, self.question.line1Y1)
            .lineTo(self.question.line1X2, self.question.line1Y2)
            .endStroke()
          self.stage.update()
        }
      })
      self.line2.on("mousedown", function (e) {
        if (self.armWithTouriquetMedia.visible && self.needleHasMoved) {
          let pt = self.line2.localToLocal(e.localX, e.localY, self.needleMedia)
          self.drawnX = e.localX
          self.drawnY = e.localY
          if (self.needleMedia.hitTest(pt.x, pt.y)) {
            if (self.question.line2Depth * 10 == self.needleDepth && self.bloodVolume < 10) {
              self.depthMessage = ""
              self.message = ""
              self.bloodVolume = self.bloodVolume + 2
              if (self.bloodVolume == 10) {
                self.bloodTubeMedia.visible = true
              }
            } else {
              self.depthMessage = "ตรวจสอบความลึกของเข็มและปรับระดับให้เหมาะสม"
            }
          } else {
            self.message = "วางเข็มไว้บนเส้นเลือดและแตะที่ปลายเข็มเพื่อดูดเลือด"
          }
        } else {
          self.line2.graphics.clear()
          self.line2.graphics.setStrokeStyle(self.question.line2Width)
            .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.5))
            .moveTo(self.question.line2X1, self.question.line2Y1)
            .lineTo(self.question.line2X2, self.question.line2Y2)
            .endStroke()
          self.stage.update()
        }
      })
      self.line2.on("pressup", function () {
        if (!self.isDrawing) {
          self.line2.graphics.clear()
          self.line2.graphics.setStrokeStyle(self.question.line2Width)
            .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.05))
            .moveTo(self.question.line2X1, self.question.line2Y1)
            .lineTo(self.question.line2X2, self.question.line2Y2)
            .endStroke()
          self.stage.update()
        }
      })
      self.line3.on("mousedown", function (e) {
        if (self.armWithTouriquetMedia.visible && self.needleHasMoved) {
          let pt = self.line3.localToLocal(e.localX, e.localY, self.needleMedia)
          self.drawnX = e.localX
          self.drawnY = e.localY
          if (self.needleMedia.hitTest(pt.x, pt.y)) {
            if (self.question.line3Depth * 10 == self.needleDepth && self.bloodVolume < 10) {
              self.depthMessage = ""
              self.message = ""
              self.bloodVolume = self.bloodVolume + 2
              if (self.bloodVolume == 10) {
                self.bloodTubeMedia.visible = true
              }
            } else {
              self.depthMessage = "ตรวจสอบความลึกของเข็มและปรับระดับให้เหมาะสม"
            }
          } else {
            self.message = "วางเข็มไว้บนเส้นเลือดและแตะที่ปลายเข็มเพื่อดูดเลือด"
          }
        } else {
          self.line3.graphics.clear()
          self.line3.graphics.setStrokeStyle(self.question.line3Width)
            .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.5))
            .moveTo(self.question.line3X1, self.question.line3Y1)
            .lineTo(self.question.line3X2, self.question.line3Y2)
            .endStroke()
          self.stage.update()
        }
      })
      self.line3.on("pressup", function () {
        console.log("mouse up")
        if (!self.isDrawing) {
          self.line3.graphics.clear()
          self.line3.graphics.setStrokeStyle(self.question.line1Width)
            .beginStroke(self.createjs.Graphics.getRGB(0,153,76,0.05))
            .moveTo(self.question.line3X1, self.question.line3Y1)
            .lineTo(self.question.line3X2, self.question.line3Y2)
            .endStroke()
          self.stage.update()
        }
      })
      self.stage.addChild(self.needleMedia)
      self.stage.addChild(self.line1)
      self.stage.addChild(self.line2)
      self.stage.addChild(self.line3)
      self.stage.update()
  }
}
}
</script>

<style scoped>

</style>