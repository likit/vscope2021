<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column">
        <p>{{ $route.params.sessionId }}</p>
        <b-table :data="media" :loading="isLoading">
          <b-table-column field="data.fileUrl" label="ตัวอย่าง" v-slot="props">
            <b-image :src="props.row.data.fileUrl" ratio="2by1" :alt="props.row.data.name"></b-image>
          </b-table-column>
          <b-table-column field="data.name" label="ชื่อ" v-slot="props">
            {{ props.row.data.name }}
          </b-table-column>
          <b-table-column field="data.note" label="คำอธิบาย" v-slot="props">
            {{ props.row.data.note }}
          </b-table-column>
          <b-table-column field="data.tags" label="ป้าย" v-slot="props">
            <b-taglist>
              <b-tag v-for="tag in props.row.data.tags" :key="tag" type="is-info is-light">{{ tag }}</b-tag>
            </b-taglist>
          </b-table-column>
          <b-table-column field="data.uploader" label="อัพโหลดโดย" v-slot="props">
            {{ props.row.data.uploader }}
          </b-table-column>
          <b-table-column field="data.uploaded_at" label="อัพโหลดเมื่อ" v-slot="props">
            {{ props.row.data.uploaded_at.toDate().toLocaleString() }}
          </b-table-column>
          <b-table-column v-slot="props">
            <router-link class="button is-light is-rounded" v-if="$route.params.questionId"
                         :to="{
                           name: 'QuestionEditForm',
                           params: { mediaId: props.row.id, questionId: $route.params.questionId }}">
            <span class="icon">
              <i class="fas fa-pencil-alt"></i>
            </span>
              <span>use</span>
            </router-link>
            <router-link class="button is-light is-rounded" v-else
                         :to="{
                           name: 'QuestionInfo',
                           params: { mediaId: props.row.id, sessionId: $route.params.sessionId }}">
            <span class="icon">
              <i class="fas fa-pencil-alt"></i>
            </span>
              <span>use</span>
            </router-link>
          </b-table-column>
        </b-table>
      </div>
    </div>
    <div class="columns">
      <div class="column has-text-centered">
        <div class="buttons is-centered">
          <button class="button is-light" @click="$router.back()">
          <span class="icon">
            <i class="fas fa-chevron-left"></i>
          </span>
            <span>Back</span>
          </button>
          <router-link :to="{ name: 'MediaUpload' }" class="button is-primary">
          <span class="icon">
            <i class="fas fa-plus-circle"></i>
          </span>
            <span>Upload Media</span>
          </router-link>
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
  name: "MediaBrowser",
  data() {
    return {
      isLoading: true,
      isLoggedIn: false,
      user: null,
      media: []
    }
  },
  components: {NavMenu},
  mounted() {
    const self = this
    if (auth.currentUser) {
      this.isLoggedIn = true
      self.user = auth.currentUser
    }
    db.collection('media')
        .get().then((snapshot)=>{
      snapshot.docs.forEach((d)=>{
        self.media.push({
          id: d.id,
          data: d.data()
        })
      })
      self.isLoading = false
    })
  }
}
</script>

<style scoped>

</style>