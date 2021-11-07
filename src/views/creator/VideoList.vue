<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <b-table :data="media" :loading="isLoading">
            <b-table-column field="data.code" label="ตัวอย่าง" v-slot="props">
              <video :src="props.row.data.fileUrl" controls width="320"></video>
            </b-table-column>
            <b-table-column field="data.description" label="ชื่อวิดีโอ" v-slot="props">
              {{ props.row.data.name }}
            </b-table-column>
            <b-table-column field="data.description" label="คำอธิบาย" v-slot="props">
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
              <router-link class="button is-light is-rounded"
                           v-if="props.row.data.uploader===$store.state.user.email"
                           :to="{ name: 'VideoUpload', params: { mediaId: props.row.id }}">
              <span class="icon">
                <i class="fas fa-pencil-alt"></i>
              </span>
                <span>edit</span>
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
            <router-link :to="{ name: 'VideoUpload' }" class="button is-primary">
            <span class="icon">
              <i class="fas fa-plus-circle"></i>
            </span>
              <span>Upload Video</span>
            </router-link>
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
  name: "VideoList",
  data() {
    return {
      isLoading: true,
      isLoggedIn: false,
      user: null,
      media: [],
      videoLink: null,
    }
  },
  methods: {},
  components: {NavMenu},
  mounted() {
    const self = this
    db.collection('video')
        .get().then((snapshot) => {
      snapshot.docs.forEach((d) => {
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
