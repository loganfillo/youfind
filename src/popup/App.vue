<template>
  <div class="app">
    <b-container>
      <b-row class="bottom-border pb-2 pt-2">
        <b-col class="align-self-center">
            <h4 class="youfind-logo float-left my-auto">
              <!-- <span class="red-box">
                <font-awesome-icon class="mb-1" icon="search" size="xs"/>
              </span> -->
              YouFind
            </h4>

        </b-col>
        <b-col class="align-self-center">
            <font-awesome-icon class="options-button float-right" icon="bars" size="2x"/>
        </b-col>
      </b-row>
      <b-row class="p-2">
        <b-input-group >
          <b-form-input class="search-input" ref="email"></b-form-input>
          <b-input-group-append>
            <b-button class="nav-button">
              <font-awesome-icon icon="angle-up" size="sm" />
            </b-button>
            <b-button class="nav-button">
              <font-awesome-icon icon="angle-down" size="sm" />
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-row>
      <b-row class="p-2">
        <b-col class="align-self-center p-0">
          <div class="results-container overflow-auto">
          </div>
          
        </b-col>
      </b-row>
      <b-row class="pb-2 pt-2">
        <b-col class="align-self-center">
          <img class="yt-logo float-left" src="/icons/yt_logo_mono_light.png" alt="youtube"/>
        </b-col>
        <b-col class="align-self-center">
            <font-awesome-icon class="info-button float-right" icon="info-circle" size="2x"/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

import { youfind } from "./youfind.js"

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

@import url("https://fonts.googleapis.com/css?family=Roboto+Condensed:bold&display=swap");

$dark-grey: #282828;
$light-grey: #bdc2c7;
$off-white: #f5f5f5;
$white: #fff;
$red: #ff0000;
$dark-red: #e40303;

.app {
  background-color: $white;
  height: 100%;
  width: 350px;
}

.bottom-border {
  background-color: $white;
  border-bottom:5px solid transparent;
  border-image: linear-gradient(to bottom, $light-grey, $white) 10;
}

.youfind-logo {
  color: $dark-grey;
  font-family: 'Roboto Condensed', sans-serif;
}


.red-box {
  color: $off-white;
  background-color: $red;
  border-radius: 6px;
  padding: 0px 10px;
  // background-image: linear-gradient($red, $dark-red);
}

.nav-button {
  background-color: $off-white !important;
  color: $dark-grey !important;
  border-color: $light-grey !important;
  &:focus {
    box-shadow: none !important;
  }
}

.options-button {
  color: $dark-grey;
}

.info-button {
  color: $dark-grey;
}

.search-input {
  &:focus {
    box-shadow: none !important;
  }
}

.results-container {
  border: 1px solid $light-grey;
  border-radius: 0.25rem;
  background-color: $off-white;
  width: 100%;
  height:100px;
}


@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/bootstrap-vue/src/index.scss';

</style>
