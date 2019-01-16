<template>
  <div class="index">
    <div class="nav">
      <router-link to="/scroll">Scroll</router-link> |
      <!--<router-link to="/about">About</router-link>-->
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .nav {
    padding: 30px;
    a {
      font-weight: bold;
      color: #2c3e50;
      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>
