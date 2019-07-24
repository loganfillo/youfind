<template>
  <div class="app">
    <b-container>
      <b-row class="flex-nowrap m-2">
        <b-col></b-col>
        <b-col>
          <div class="logo-border">
            <h1 class="text-center m-1">You<span class="text-danger">Find</span></h1>
          </div>
        </b-col>
        <b-col></b-col>
      </b-row>
      <b-row class="flex-nowrap m-2">
        <b-input-group class="">
          <b-input-group-prepend>
            <b-button variant="danger">Find</b-button>
          </b-input-group-prepend>
          <b-form-input ref="email"></b-form-input>
        </b-input-group>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  created(){
  },
  mounted(){
    this.$refs.email.$el.focus();
  }
}
</script>

<style lang="scss" scoped>

.app {
  height: 300px;
  width: 400px;
}

.logo-border{
  border: 2px solid #dc3545;
  border-radius: 5px;
  padding: 5px;
}

@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';

</style>
