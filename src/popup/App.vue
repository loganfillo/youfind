<template>
  <div class="app">
    <b-container>
      <b-row class="flex-nowrap bottom-border pt-2">
        <b-col>
           <h3 class="logo text-left">You<span class="text-danger">Find</span>
            <font-awesome-icon class="mb-2" icon="search" size="sm" />
           </h3>

        </b-col>
        <b-col>
          <!-- <font-awesome-icon class="text-right" :icon="['far', 'question-circle']" size="2x"/> -->
        </b-col>
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
  background-color: whitesmoke;
  height: 150px;
  width: 400px;
}

.bottom-border{
  background-color: white;
  border-bottom: 1px solid silver;
}

.logo {
  font-family: Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Black", sans-serif;
}

@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';

</style>
