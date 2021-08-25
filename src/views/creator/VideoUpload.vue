<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title has-text-centered">Video Upload</h1>
        </div>
      </div>
      <pre>
        {{ $route.params.mediaId }}
      </pre>
      <div class="columns">
        <div class="column is-one-third is-offset-4 box">
          <b-field label="คำอธิบาย">
            <b-input type="textarea" v-model="description" maxlength="200"></b-input>
          </b-field>
          <b-field label="Embed Code">
            <b-input type="textarea" v-model="code"></b-input>
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
            <button class="button is-success" @click="saveData">
              <span class="icon">
                <i class="far fa-save"></i>
              </span>
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";
import {db} from "../../firebase";

export default {
  name: "MediaUpload",
  data() {
    return {
      tags: [],
      name: null,
      code: null,
      description: null,
      allTags: [],
    }
  },
  components: {NavMenu},
  mounted() {
    let self = this
    db.collection('tags')
        .where('group', '==', 'media')
        .get().then((snapshot) => {
      snapshot.forEach((d) => {
        d.data().tags.forEach((t) => {
          self.allTags.push(t)
        })
      })
    })
    if (self.$route.params.mediaId) {
      self.mediaId = self.$route.params.mediaId
      db.collection('videos').doc(self.mediaId).get().then((snapshot) => {
        if (snapshot.exists) {
          let data = snapshot.data()
          self.fileUrl = data.fileUrl
          self.description = data.description
          self.code = data.code
          self.tags = data.tags
          self.creator = data.creator
          self.createdAt = data.createdAt
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
    saveData() {
      let self = this
      if (self.$route.params.mediaId == null) {
        db.collection('videos').add({
          description: self.description,
          code: self.code,
          creator: self.$store.state.user.email,
          createdAt: new Date(),
          tags: self.tags,
        }).then(() => {
          self.$buefy.toast.open({
            message: 'Added Successfully',
            type: 'is-success'
          })
          self.$router.push({name: 'VideoList'})
        })
      } else {
        db.collection('videos').doc(self.$route.params.mediaId).update({
          description: self.description,
          code: self.code,
          createdAt: new Date(),
          tags: self.tags,
        }).then(() => {
          self.$buefy.toast.open({
            message: 'Updated Successfully',
            type: 'is-success'
          })
          self.$router.push({name: 'VideoList'})
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
