<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column has-text-centered">
          <h1 class="title">Select Your Group</h1>
        </div>
      </div>
      <div class="columns">
        <div class="column is-one-third is-offset-4">
          <nav class="panel">
            <a class="panel-block">
              <span class="panel-icon">
                <i class="fas fa-users"></i>
              </span>
              Student
            </a>
            <router-link class="panel-block" :to="{ name: 'EQAProfile' }">
              <span class="panel-icon">
                <i class="fas fa-users"></i>
              </span>
              EQA Members
            </router-link>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";
export default {
  name: "ProfileLanding",
  components: {NavMenu},
}
</script>

<style scoped>

</style>