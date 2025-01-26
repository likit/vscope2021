<template>
  <div>
    <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column">
          <h1 class="title">All Programs</h1>
          <b-table :data="programs" :loading="isLoading">
            <b-table-column field="name" label="Name" width="40" v-slot="props">
              {{ props.row.name }}
            </b-table-column>
            <b-table-column field="discipline" label="Discipline" width="40" v-slot="props">
              {{ props.row.discipline }}
            </b-table-column>
            <b-table-column field="creator" label="Creator" width="40" v-slot="props">
              {{ props.row.creator }}
            </b-table-column>
            <b-table-column field="createdAt" label="Created At" width="40" v-slot="props">
              {{ props.row.createdAt }}
            </b-table-column>
            <b-table-column width="40" v-slot="props" label="Published">
            <span class="icon" v-if="props.row.published">
              <i class="fas fa-check-circle has-text-success"></i>
            </span>
            </b-table-column>
            <b-table-column width="40" v-slot="props">
              <a class="button is-info is-rounded"
                 @click="$router.push({ name: 'UserLessonList', params: {programId: props.row.id}})">
                <span class="icon">
                  <i class="fas fa-chevron-circle-right"></i>
                </span>
                <span>Go</span>
              </a>
            </b-table-column>
          </b-table>
        </div>
      </div>
      <div class="columns">
        <div class="column is-three-fifths is-offset-2">
          <div class="buttons is-centered">
            <router-link class="button is-light" :to="{ name: 'MainPage' }">
            <span class="icon">
              <i class="fas fa-chevron-left"></i>
            </span>
              <span>Back</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";
import {db, auth} from '../../firebase'

export default {
  name: "UserProgramList",
  components: {NavMenu},
  data() {
    return {
      programs: [],
      isLoading: true,
      isLoggedIn: false,
      user: null,
    }
  },
  mounted() {
    if (auth.currentUser) {
      this.isLoggedIn = true
      this.user = auth.currentUser
    }
    let self = this
    db.collection('programs')
        .get().then((snapshot) => {
      snapshot.docs.forEach((r)=>{
        let data = r.data()
        if (data.published) {
          self.programs.push({
            id: r.id,
            name: data.name,
            published: data.published,
            discipline: data.discipline,
            creator: data.creator,
            createdAt: data.createdAt.toDate().toLocaleString()
          })
        }
      })
      self.isLoading = false
    })
  }
}
</script>

<style scoped>

</style>