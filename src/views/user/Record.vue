<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column has-text-centered">
          <h1 class="title">Your Records</h1>
        </div>
      </div>
      <div class="columns">
        <div class="column is-two-thirds is-offset-2">
          <b-table :data="records" paginated per-page="10">
            <b-table-column field="id" label="Session ID" sortable v-slot="props">
              {{ sessions[props.row.sessionId] }}
            </b-table-column>
            <b-table-column field="start" label="Start" sortable v-slot="props">
              {{ props.row.start.toDate().toLocaleString() }}
            </b-table-column>
            <b-table-column field="end" label="End" sortable v-slot="props">
              {{ props.row.end != undefined ? props.row.end.toDate().toLocaleString() : "Unfinished" }}
            </b-table-column>
            <b-table-column label="Answers" numeric width="30" v-slot="props">
              {{ props.row.answers.length }}
            </b-table-column>
          </b-table>
        </div>
      </div>
    </section>
  </div>

</template>

<script>
import NavMenu from "../../components/navMenu";
import {db} from "../../firebase";

export default {
  name: "Record",
  components: {NavMenu},
  data () {
    return {
      records: [],
      sessions: [],
    }
  },
  methods: {
    load () {
      const self = this
      db.collection('sessions').get().then((snapshot)=>{
        snapshot.docs.forEach(s=>{
          let data = s.data()
          self.sessions[s.id] = data.name
        })
      })
      db.collection('records')
          .where('email', '==', this.$store.state.user.email)
          .orderBy('start', 'desc')
          .get().then(snapshot=>{
            snapshot.docs.forEach(rec=>{
              let data = rec.data()
              data.id = rec.id
              self.records.push(data)
            })
      })
    }
  },
  mounted () {
    this.load()
  }
}
</script>

<style scoped>

</style>