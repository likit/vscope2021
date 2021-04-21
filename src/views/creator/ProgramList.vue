<template>
<div>
  <nav-menu :is-logged-in="isLoggedIn" @logout="isLoggedIn=false"></nav-menu>
  <section class="section">
    <div class="columns">
      <div class="column is-three-fifths is-offset-2">
        <h1 class="title">Your Programs</h1>
        <b-table :data="programs">
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
          <b-table-column field="id" label="ID" width="40" v-slot="props">
            <a class="button is-small is-rounded" @click="$router.push({ name: 'ProgramInfo', params: {programId: props.row.id}})">
              <span class="icon">
                <i class="fas fa-info-circle"></i>
              </span>
              <span>detail</span>
            </a>
          </b-table-column>
        </b-table>
      </div>
    </div>
    <div class="columns">
      <div class="column is-three-fifths is-offset-2 has-text-centered">
        <button class="button is-success">
          <span class="icon">
            <i class="fas fa-plus-circle"></i>
          </span>
          <span>Add</span>
        </button>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import NavMenu from "../../components/navMenu";
import {db, auth} from '../../firebase'

export default {
  name: "ProgramList",
  components: {NavMenu},
  data() {
    return {
      programs: [],
      isLoggedIn: false,
    }
  },
  mounted() {
    if (auth.currentUser) {
      this.isLoggedIn = true
    }
    let self = this
    db.collection('programs')
        .where('creator',  '==', auth.currentUser.email)
        .get().then((snapshot) => {
      snapshot.docs.forEach((r)=>{
        let data = r.data()
        self.programs.push({
          id: r.id,
          name: data.name,
          discipline: data.discipline,
          creator: data.creator,
          createdAt: data.createdAt.toDate().toLocaleString()
        })
      })
    })
  }
}
</script>

<style scoped>

</style>