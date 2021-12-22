<template>
<section class="section">
  <div class="container">
    <div class="columns">
      <div class="column">
        <h1 class="title has-text-centered">
          Records
        </h1>
        <b-table :data="records" :loading="isLoading" :paginated="true">
          <b-table-column field="email" label="User" v-slot="props">
            {{ props.row.data.email }}
          </b-table-column>
          <b-table-column field="start" label="Start" v-slot="props">
            {{ props.row.data.start.toDate().toLocaleString() }}
          </b-table-column>
          <b-table-column field="end" label="End" v-slot="props">
            {{ props.row.data.end !== undefined ? props.row.data.end.toDate().toLocaleString() : "" }}
          </b-table-column>
          <b-table-column field="answers" label="Answers" v-slot="props">
            {{ props.row.data.answers.length }}
          </b-table-column>
          <b-table-column field="submittedAt" label="Submitted At" v-slot="props">
            {{ props.row.data.submittedAt !== undefined ? props.row.data.submittedAt.toDate().toLocaleString() : "" }}
          </b-table-column>
          <b-table-column field="id" width="40" v-slot="props">
            <a class="button is-small is-info is-outlined is-rounded"
               @click="$router.push({ name: 'RecordDetail', params: { recordId: props.row.id, sessionId: $route.params.sessionId }})">
          <span class="icon">
            <i class="far fa-eye"></i>
          </span>
              <span>view</span>
            </a>
          </b-table-column>
        </b-table>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="buttons is-centered">
          <router-link class="button is-light" :to="{ name: 'SessionInfo', params: { sessionId: $route.params.sessionId }}">
            <span class="icon">
              <i class="fas fa-chevron-left"></i>
            </span>
            <span>Back</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script>
import {db} from '../../firebase'

export default {
  name: "Records",
  data () {
    return {
      records: [],
      isLoading: false,
      questionIds: [],
    }
  },
  methods: {
    loadData () {
      this.isLoading = true
      db.collection('records')
          .where('sessionId', '==', this.$route.params.sessionId)
          .where('submittedAt', '!=', null)
          .orderBy('submittedAt')
          .orderBy('start', 'desc')
          .get().then((snapshot)=>{
        snapshot.docs.forEach((q)=>{
          if (q.data().deleted !== true) {
            this.records.push({
              id: q.id,
              data: q.data()
            })
          }
        })
        this.isLoading = false
      })
    }
  },
  mounted () {
    this.loadData()
  }
}
</script>

<style scoped>

</style>