<template>
  <div class="app">
    <b-container>
      <b-row class="bottom-border pb-2 pt-2">
        <b-col class="align-self-center">
          <h5 class="youfind-logo float-left my-auto">
            You<span class="red-box">Find
                <!-- <font-awesome-icon class="mb-1" icon="search" size="xs"/> -->
            </span>
          </h5>
        </b-col>
        <b-col class="align-self-center">
          <font-awesome-icon class="options-button float-right" icon="bars" size="lg" />
        </b-col>
      </b-row>
      <div v-show="onYouTube">
        <b-row class="p-1">
        <b-input-group>
          <b-form-input class="search-bar" ref="searchBar" v-model="query" autofocus></b-form-input>
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
      <b-row class="p-1">
        <b-col class="align-self-center p-0">
          <div class="results-container overflow-auto">
            <ul>
              <button class="search-match-button" v-for="match in matchingCaptions" v-bind:key="match.start" @click="seekToTime(match)">
                <span class="time-text">{{formatTime(match.start)}}</span>
                <div v-html="highlightMatch(match.text)"></div>
              </button>
            </ul>
          </div>
        </b-col>
      </b-row>
      </div>
      <div v-show="!onYouTube" class="text-center">
            <h3>Not On YouTube!</h3>
          </div>
      <b-row class="pt-1 pb-1">
        <b-col class="align-self-center">
          <img class="yt-logo float-left" src="/icons/yt_logo_mono_light.png" alt="youtube" />
        </b-col>
        <b-col class="align-self-center">
          <font-awesome-icon class="info-button float-right" icon="info-circle" size="lg" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>

import youfind from "./youfind.js";

export default {
  data() {
    return {
      onYouTube: false,
      captionsTracks: [],
      currentTrack: [],
      currentLanguage: {
        languageCode: "en",
        kind: "asr"
      },
      port: 0,
      query: ""
    };
  },
  computed: {
    matchingCaptions: function() {
      return this.currentTrack.filter(caption => {
        return caption.text.includes(this.query);
      });
    }
  },
  methods: {
    seekToTime: function(caption) {
      youfind.seekToTime(this.port, caption.start);
    },
    highlightMatch: function(stringWithMatch) {
      stringWithMatch = "...".concat(stringWithMatch).concat("...");            
      if(this.query != ""){
        let match = new RegExp(this.query, "g");
        return stringWithMatch.replace(match, '<span class="highlighted">'+ this.query + "</span>");
      }
      return stringWithMatch;
    },
    formatTime: function(time){
      function getTime(t, scale, mod) {
        return Math.floor(time/scale) > 0 ? (Math.floor(time/scale)%mod).toString(10): "00";
      } 
      function prependZero(t) {
        return t.length == 1 ? "0" + t: t;
      }
      let hour = prependZero(getTime(time, 3600, 624));
      let min  =  prependZero(getTime(time, 60, 60));
      let sec  = prependZero(getTime(time, 1, 60));
      
      return hour + ":" + min + ":" + sec;
      
    }
  },
  async created() {
    try {
      this.onYouTube = await youfind.onYouTube();
      if (this.onYouTube){
        this.port = await youfind.connectToPort();
        this.videoId = await youfind.getVideoId();
        this.captionsTracks = await youfind.getCaptionTracks();
        this.videoId = await youfind.getVideoId();
        this.currentTrack = await youfind.getParsedTrack(this.captionsTracks, this.currentLanguage, this.videoId);
      }
    } catch (error) {
      console.log(error);
    }
  },
  mounted() {
    this.$refs.searchBar.$el.focus();
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Roboto+Condensed:bold&display=swap");

$almost-black: #282828;
$dark-grey: #6d6d6d;
$light-grey: #868686;
$very-light-grey: #bdc2c7;
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
  border-bottom: 5px solid transparent;
  border-image: linear-gradient(to bottom, $very-light-grey, $white) 10;
}

.youfind-logo {
  color: $almost-black;
  font-family: "Roboto Condensed", sans-serif;
}

.red-box {
  color: $off-white;
  background-color: $red;
  border-radius: 6px;
  padding: 0px 6px;
  margin: 0px 1px;
  background-image: linear-gradient($red, $dark-red);
}

.nav-button {
  background-color: $off-white !important;
  color: $almost-black !important;
  border-color: $very-light-grey !important;
  &:focus {
    box-shadow: none !important;
  }
}

.options-button {
  color: $almost-black;
}

.info-button {
  color: $almost-black;
}

.search-bar {
  border-color: $very-light-grey !important;
  &:focus {
    box-shadow: inset 0 0 4px rgb(45, 116, 221) !important;
  }
}

.search-match-button {
  text-align: center;
  text-decoration: none;
  font-size: 15px;
  padding: 15px;
  color: $almost-black;
  background-color: transparent;
  border-bottom: 1px solid $very-light-grey;
  width: 100%;
  &:hover {
    background-color: $off-white;
  }
}

.highlighted {
  background-color: rgb(255, 251, 0);
}

.time-text {
  font-size: 13px;
  text-align: center;
  color: $light-grey;
}

.results-container {
  border: 1px solid $very-light-grey;
  border-radius: 0.25rem;
  background-color: $white;
  width: 100%;
  height:200px;
}

@import "node_modules/bootstrap/scss/bootstrap";
@import "node_modules/bootstrap-vue/src/index.scss";

</style>
