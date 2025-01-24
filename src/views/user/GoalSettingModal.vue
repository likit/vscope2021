<template>
  <div class="modal-card" style="width: auto">
              <header class="modal-card-head">
                  <p class="modal-card-title">Goal Setting Question</p>
                  <button
                      type="button"
                      class="delete"
                      @click="$emit('close')"/>
              </header>
              <section class="modal-card-body">
                  {{ ses }}
                  <b-field label="SES">
                      <b-input
                          type="number"
                          :value="sesAnswer"
                      >
                      </b-input>
                  </b-field>
                  {{ set }}
                  <b-field label="SET">
                      <b-input
                          type="number"
                          :value="setAnswer"
                      >
                      </b-input>
                  </b-field>
              </section>
              <footer class="modal-card-foot">
                  <b-button
                      label="Skip"
                      @click="$emit('close')" />
                  <b-button
                      label="Save"
                      type="is-primary" />
              </footer>
          </div>
</template>

<script>
// TODO: add mechanism for going to different profile page based on the user's group

export default {
  name: "GoalSettingModal",
  props: ['ses', 'set', 'setAnswer', 'sesAnswer']
}
</script>

<style scoped>

</style>