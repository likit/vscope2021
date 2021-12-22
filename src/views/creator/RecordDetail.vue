<template>
<section class="section">
  <div class="container">
    <div class="columns">
      <div class="column">
        <h1 class="has-text-centered title">{{ session.email }}</h1>
        <h1 class="has-text-centered subtitle" v-if="session.submittedAt !== undefined">
          Submitted At {{ session.submittedAt.toDate().toLocaleString() }}
        </h1>
        <h1 class="title is-size-4">Total {{ totalUserScore }}/{{ totalScore }} points</h1>
        <h1 class="subtitle is-size-5 has-text-info" v-if="session.end !== undefined">
          Duration {{ diff_minutes(session.end.toDate(), session.start.toDate()) }} mins.
        </h1>
        <b-table :data="session.answers" :loading="isLoading" :paginated="true">
          <b-table-column field="no" label="No" v-slot="props">
            {{ questions[props.row.questionId].no }}
          </b-table-column>
          <b-table-column field="title" label="Question" v-slot="props">
            {{ questions[props.row.questionId].title }}
          </b-table-column>
          <b-table-column field="key" label="key" v-slot="props">
            {{ props.row.key }}
          </b-table-column>
          <b-table-column field="end" label="End" v-slot="props">
            {{ props.row.answer }}
          </b-table-column>
          <b-table-column field="updatedAt" label="Updated At" v-slot="props">
            {{ props.row.updatedAt.toDate().toLocaleString() }}
          </b-table-column>
          <b-table-column field="correct" label="Correct" v-slot="props">
            <b-icon pack="fas" icon="check-circle" type="is-success" v-if="props.row.answer == props.row.key"></b-icon>
            <b-icon pack="fas" icon="times-circle" type="is-danger" v-else></b-icon>
          </b-table-column>
        </b-table>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <div class="buttons is-centered">
          <router-link class="button is-light" :to="{ name: 'Records', params: { sessionId: sessionId }}">
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
import {db} from "../../firebase";

export default {
  name: "RecordDetail",
  data () {
    return {
      questionIds: [],
      questions: {},
      session: {},
      totalUserScore: 0,
      totalScore: 0,
      sessionId: null,
      isLoading: false
    }
  },
  methods: {
    diff_minutes (dt2, dt1) {
      let diff =(dt2.getTime() - dt1.getTime()) / 1000;
      diff /= 60;
      return Math.abs(Math.round(diff));
    },
    loadData () {
      this.isLoading = true
      this.recordId = this.$route.params.recordId
      this.sessionId = this.$route.params.sessionId
      db.collection('questions').where('sessionId', '==', this.sessionId)
          .get().then(snapshot=>{
            snapshot.docs.forEach(q=>{
              let data = q.data()
              this.questions[q.id] = { no: data.no, title: data.title, point: parseInt(data.point) }
              this.totalScore += parseInt(data.point)
            })
        db.collection('records').doc(this.recordId)
            .get().then((doc)=>{
          if (doc.exists) {
            if (doc.data().deleted !== true) {
              this.session = doc.data()
              this.session.id = doc.id
              this.session.answers.forEach(a => {
                if (a.answer === a.key) {
                  this.totalUserScore += this.questions[a.questionId].point
                }
              })
            }
          }
          this.isLoading = false
        })
        })
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>

</style>