<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">Media Upload</h1>
        </div>
      </div>
      <div class="columns">
        <div class="column is-one-third is-offset-4 box">
          <b-field label="ชื่อ">
            <b-input v-model="name"></b-input>
          </b-field>
          <b-field label="ประเภทสื่อ">
            <b-select placeholder="เลือกประเภท" v-model="mediaType">
              <option
                  v-for="type_ in types"
                  :value="type_"
                  :key="type_">
                {{ type_ }}
              </option>
            </b-select>
          </b-field>
          <b-field label="คำอธิบาย">
            <b-input type="textarea" v-model="note" maxlength="200"></b-input>
          </b-field>
          <b-field label="ตัวอย่าง">
            <b-image :src="fileUrl" v-if="fileUrl" ratio="2by1"></b-image>
          </b-field>
          <b-field class="file is-primary" :class="{'has-name': !!file}">
            <b-upload v-model="file" class="file-label">
            <span class="file-cta">
                <b-icon class="file-icon" icon="upload"></b-icon>
                <span class="file-label">คลิกเพื่ออัพโหลด</span>
            </span>
              <span class="file-name" v-if="file">
                {{ file.name }}
            </span>
            </b-upload>
          </b-field>
          <b-field label="เพิ่มป้าย (tags) สำหรับจัดกลุ่ม" message="กด enter เพื่อเพิ่มป้ายใหม่">
            <b-taginput
                v-model="tags"
                :data="allTags"
                icon="label"
                autocomplete
                :allow-new="true"
                placeholder="Add a tag"
                @typing="getFilteredTags">
            </b-taginput>
          </b-field>
          <div class="buttons is-centered">
            <button class="button is-light" @click="$router.back()">
              <span class="icon">
                <i class="fas fa-chevron-left"></i>
              </span>
              <span>Cancel</span>
            </button>
            <b-button v-if="mediaId" class="button is-danger" @click="remove">
              <span class="icon">
                <i class="far fa-trash-alt"></i>
              </span>
            </b-button>
            <b-button :loading="isLoading" :disabled="!isFormValid"
                      class="button is-success" @click="saveData">
              <span class="icon">
                <i class="far fa-save"></i>
              </span>
              <span>Submit</span>
            </b-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";
import {db,auth} from "../../firebase";
import {storage} from "@/firebase";
import {v4 as uuidv4} from 'uuid'

let storageRef = storage.ref()

export default {
  name: "MediaUpload",
  data() {
    return {
      isLoading: false,
      isLoggedIn: false,
      tags: [],
      name: null,
      note: null,
      allTags: [],
      mediaRef: null,
      file: null,
      fileUrl: null,
      mediaType: 'image',
      types: ['image'],
      mediaId: null,
      uploader: null,
      uploaded_at: null
    }
  },
  computed: {
    isFormValid () {
      if (this.mediaId !== null) {
        return this.name !== ''
      } else {
        return (this.name !== '') && (this.file !== null)
      }
    }
  },
  components: {NavMenu},
  mounted() {
    let self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    db.collection('tags')
        .where('group', '==', 'media')
        .get().then((snapshot)=>{
        snapshot.forEach((d)=>{
          d.data().tags.forEach((t)=>{
            self.allTags.push(t)
          })
        })
    })
    if (self.$route.params.mediaId) {
      self.mediaId = self.$route.params.mediaId
      db.collection('media').doc(self.mediaId).get().then((snapshot)=>{
        if (snapshot.exists) {
          let data = snapshot.data()
          self.fileUrl = data.fileUrl
          self.name = data.name
          self.note = data.note
          self.tags = data.tags
          self.uploader = data.uploader
          self.uploaded_at = data.uploaded_at
          self.mediaType = data.type_
        }
      })
    }
  },
  methods: {
    getFilteredTags(text) {
      this.filteredTags = this.allTags.filter((option) => {
        return option.toLowerCase().indexOf(text.toLowerCase()) >= 0
      })
    },
    remove () {
      this.$buefy.dialog.confirm({
        title: 'You really want to delete this media?',
        message: 'The deleted media cannot be recovered.',
        cancelText: 'Cancel',
        confirmText: 'Confirm',
        type: 'is-danger',
        onConfirm: () => {
          let fileRef = storage.refFromURL(this.fileUrl)
          fileRef.delete().then(()=>{
            db.collection('media').doc(this.mediaId).delete().then(()=>{
              this.$buefy.toast.open({
                message: 'The media has been removed',
                type: 'is-success'
              })
              this.$router.back()
            })
          }).catch((e) => {
            this.$buefy.toast.open({
              message: e.toString(),
              type: 'is-danger'
            })
          })
        }
      })
    },
    saveData () {
      let self = this
      if (self.file) {
        let newFilename = uuidv4()
        this.isLoading = true
        if (self.mediaId == null) {
          storageRef.child('media/' + newFilename).put(self.file).then(()=>{
            self.mediaFileRef = storageRef.child('media/' + newFilename)
            self.mediaFileRef.getDownloadURL().then((url)=>{
              self.mediaUrl = url
              if (self.mediaId == null) {
                db.collection('media').add({
                  name: self.name,
                  note: self.note,
                  type_: self.mediaType,
                  uploader: auth.currentUser.email,
                  uploaded_at: new Date(),
                  tags: self.tags,
                  fileUrl: self.mediaUrl
                }).then(()=>{
                  self.$buefy.toast.open({
                    message: 'Uploaded successfully',
                    type: 'is-success'
                  })
                  self.$router.push({ name: 'MediaList' })
                })
              }
            })
          }).catch((error)=>{
            console.log(error)
          })
        } else {
          storageRef.child('media/' + self.file.name).put(self.file).then(()=> {
            self.mediaFileRef = storageRef.child('media/' + self.file.name)
            self.mediaFileRef.getDownloadURL().then((url) => {
              self.mediaUrl = url
              db.collection('media').doc(self.mediaId).update({
                name: self.name,
                note: self.note,
                type_: self.mediaType,
                uploader: auth.currentUser.email,
                uploaded_at: new Date(),
                tags: self.tags,
                fileUrl: self.mediaUrl
              }).then(()=>{
                self.$buefy.toast.open({
                  message: 'Uploaded successfully',
                  type: 'is-success'
                })
                self.$router.push({ name: 'MediaList' })
              })
            })
          })
        }
      } else {
        if (self.mediaId) {
          db.collection('media').doc(self.mediaId).update({
            name: self.name,
            note: self.note,
            type_: self.mediaType,
            uploaded_at: new Date(),
            tags: self.tags,
          }).then(()=>{
            self.$buefy.toast.open({
              message: 'Uploaded successfully',
              type: 'is-success'
            })
            self.$router.push({ name: 'MediaList' })
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>