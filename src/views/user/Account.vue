<template>
  <div>
    <nav-menu></nav-menu>
    <section class="section">
      <div class="columns">
        <div class="column has-text-centered">
          <h1 class="title">Your Account</h1>
        </div>
      </div>
      <div class="columns">
        <div class="column is-one-third is-offset-4">
          <nav class="panel">
            <router-link class="panel-block" :to="{ name: 'EQAProfile' }">
              <span class="panel-icon">
                <i class="fas fa-user-alt"></i>
              </span>
              Profile
            </router-link>
            <a class="panel-block">
              <span class="panel-icon">
                <i class="far fa-save"></i>
              </span>
              Records
            </a>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NavMenu from "../../components/navMenu";

export default {
  name: "Account",
  components: {NavMenu},
}
</script>

<style scoped>

</style>