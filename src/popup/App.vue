<template>
  <div class="app">
    <b-container>
      <b-row class="bottom-border pb-2 pt-2">
        <b-col class="align-self-center">
          <h5 class="youfind-logo float-left my-auto">
            YouFind
          </h5>
        </b-col>
        <b-col class="align-self-center">
          <button class="options-button float-right" @click="$bvModal.show('options-modal')">
            <font-awesome-icon icon="bars" size="lg" />
          </button>
          <b-modal id="options-modal" title="Options" hide-footer>
            <b-row class="p-2">
              <b-col cols="5" class="text-muted">
                <small>Caption Language</small>
              </b-col>
              <b-col>
                <b-form-select v-model="optionsForm.language" v-bind:options="languageOptions"></b-form-select>
              </b-col>
            </b-row>
            <b-row class="p-2">
              <b-col cols="5" class="text-muted">
                <small>Highlight Color</small>
              </b-col>
              <b-col>
                <b-form-select
                  v-model="optionsForm.highlightColor"
                  v-bind:options="highlightColorOptions"
                ></b-form-select>
              </b-col>
            </b-row>
            <b-row class="p-2">
              <b-col cols="5" class="text-muted">
                <small>Auto-Enable CC</small>
              </b-col>
              <b-col>
                <b-form-checkbox v-model="optionsForm.turnOnCC"></b-form-checkbox>
              </b-col>
            </b-row>
            <b-button
              class="mt-3"
              variant="outline-primary"
              block
              @click="submitOptionsForm()"
            >Save Changes</b-button>
          </b-modal>
        </b-col>
      </b-row>
      <div v-if="!loading && onYouTubeVideo && hasCaptions && hasCaptionsForLanguage">
        <b-row class="p-1">
          <b-input-group>
            <b-form-input
              class="search-bar"
              autocomplete="off"
              ref="searchBar"
              v-model="querySession.query"
              @input="storeQuerySession(true)"
            ></b-form-input>
            <b-input-group-append>
              <b-button class="nav-button" @click="navigateCaptions(0)" @keyup.>
                <font-awesome-icon icon="angle-up" size="sm" />
              </b-button>
              <b-button class="nav-button" @click="navigateCaptions(1)">
                <font-awesome-icon icon="angle-down" size="sm" />
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-row>
        <b-row class="p-1">
          <b-col class="align-self-center p-0">
            <div class="results-container overflow-auto" ref="resultsContainer">
              <ul>
                <button
                  class="search-match-button"
                  v-for="(match, index) in matchingCaptions"
                  v-bind:key="index"
                  v-bind:class="{selected: querySession.index === index}"
                  @click="seekToTime(match, index)"
                >
                  <span class="time-text">{{formatTime(match.start)}}</span>
                  <div v-html="highlightMatch(match.text)"></div>
                </button>
              </ul>
            </div>
          </b-col>
        </b-row>
      </div>
      <div v-if="loading" class="text-center">
        <h4>Loading!</h4>
      </div>
      <div v-if="!loading && !onYouTubeVideo" class="text-center">
        <h3>Not On YouTube Video !</h3>
      </div>
      <div v-if="!loading && onYouTubeVideo && !hasCaptions" class="error-container">
        <div class="error-text">
          <font-awesome-icon class="error-icon" icon="exclamation-triangle" size="1x"/>
          This Video Has No Captions!
        </div>
      </div>
      <div
        v-if="!loading && onYouTubeVideo && hasCaptions && !hasCaptionsForLanguage"
        class="text-center"
      >
        <h3>This Video Has No Captions In {{currentOptions.language.languageCode}}!</h3>
      </div>
      <b-row class="pt-1 pb-1">
        <b-col class="align-self-center">
          <img class="yt-logo float-left" src="/icons/yt_logo_rgb_light.png" alt="youtube" />
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
      onYouTubeVideo: true,
      hasCaptionsForLanguage: true,
      hasCaptions: true,
      loading: true,
      errors: true,
      videoId: 0,
      port: 0,
      captionsTracks: [],
      currentTrack: [],
      currentOptions: {},
      languageOptions: [],
      optionsForm: {},
      querySession: {},
      highlightColorOptions: [
        { value: "yellow", text: "Yellow" },
        { value: "lime", text: "Green" },
        { value: "hotpink", text: "Pink" },
        { value: "aqua", text: "Blue" }
      ]
    };
  },
  computed: {
    matchingCaptions: function() {
      return this.currentTrack.filter(caption => {
        return caption.text.includes(this.querySession.query);
      });
    }
  },
  methods: {
    seekToTime: function(caption, index) {
      this.querySession.index = index;
      youfind.seekToTime(this.port, caption.start - 0.5);
    },
    formatTime: function(time) {
      function getTime(t, scale, mod) {
        return Math.floor(time / scale) > 0
          ? (Math.floor(time / scale) % mod).toString(10)
          : "00";
      }
      function prependZero(t) {
        return t.length == 1 ? "0" + t : t;
      }
      let hour = prependZero(getTime(time, 3600, 624));
      let min = prependZero(getTime(time, 60, 60));
      let sec = prependZero(getTime(time, 1, 60));

      return hour + ":" + min + ":" + sec;
    },
    highlightMatch: function(stringWithMatch) {
      stringWithMatch = "...".concat(stringWithMatch).concat("...");
      if (this.querySession.query != "") {
        let match = new RegExp(this.querySession.query, "g");
        return stringWithMatch.replace(
          match,
          '<span style="background-color:' +
            this.currentOptions.highlightColor +
            '">' +
            this.querySession.query +
            "</span>"
        );
      }
      return stringWithMatch;
    },
    storeQuerySession: function(changingQuery) {
      if (changingQuery) {
        this.querySession.index = -1;
      }
      this.scrollToFit();
      youfind.storeQuerySession(this.querySession);
    },
    keyListener: function(event) {
      if (event.keyCode == 38) {
        this.navigateCaptions(0);
      } else if (event.keyCode == 40) {
        this.navigateCaptions(1);
      } else if (event.keyCode == 13) {
        this.seekToTime(
          this.matchingCaptions[this.querySession.index],
          this.querySession.index
        );
      }
    },
    navigateCaptions: function(direction) {
      let captions = this.matchingCaptions;
      if (this.querySession.index < captions.length - 1 && direction == 1) {
        this.querySession.index++;
      } else if (this.querySession.index > 0 && direction == 0) {
        this.querySession.index--;
      }
      this.storeQuerySession(false);
    },
    scrollToFit: function() {
      if (this.querySession.index < 0) {
        this.$refs.resultsContainer.scrollTop = 0;
      } else if (this.querySession.index) {
      } else {
        let captionSize = 75;
        let margin = this.querySession.index * captionSize;
        this.$refs.resultsContainer.scrollTop = margin;
      }
    },
    createLanguageOptions: function() {
      this.captionsTracks.forEach(track => {
        let kind = "";
        if (typeof track.kind != "undefined") kind = track.kind;
        let option = {
          value: {
            languageCode: track.languageCode,
            kind: kind
          },
          text: track.name.simpleText
        };
        this.languageOptions.push(option);
      });
    },
    submitOptionsForm: function() {
      this.loading = true;
      youfind.storeOptions(this.optionsForm).then(() => {
        this.currentOptions = this.optionsForm;
        youfind
          .getParsedTrack(
            this.captionsTracks,
            this.currentOptions.language,
            this.videoId
          )
          .then(result => {
            this.currentTrack = result;
            this.loading = false;
            this.$bvModal.hide("options-modal");
          })
          .catch(error => console.log(error));
      });
    },
    initialize: async function() {
      this.loading = true;
      try {
        this.videoId = await youfind.getYouTubeVideo();
        this.onYouTubeVideo = true;
        this.port = await youfind.connectToPort();
        this.currentOptions = await youfind.getOptions();
        this.optionsForm = this.currentOptions;
        this.captionsTracks = await youfind.getCaptionTracks();
        this.currentTrack = await youfind.getParsedTrack(
          this.captionsTracks,
          this.currentOptions.language,
          this.videoId
        );
        this.querySession = await youfind.getQuerySession(this.videoId);
        this.createLanguageOptions();
        this.scrollToFit();
        this.errors = false;
      } catch (error) {
        console.log(error);
        switch (error.type) {
          case "NOT_ON_YOUTUBE_VIDEO":
            this.onYouTubeVideo = false;
            break;
          case "NO_CAPTION_TRACKS":
            this.hasCaptions = false;
            break;
          case "NO_CAPTION_TRACKS_FOR_LANGUAGE":
            this.hasCaptionsForLanguage = false;
            break;
          case "TRACK_TOO_LARGE_FOR_MEMORY":
            // Figure out boolean for this
            break;
          case "COULD_NOT_PARSE_TRACK":
            // FIgure out boolean for this
            break;
          default:
            break;
        }
      }
      this.loading = false;
    }
  },
  created() {
    window.addEventListener("keyup", this.keyListener);
  },
  mounted() {
    this.initialize().then(() => {
      if (!this.errors) this.$refs.searchBar.focus();
    });
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
  width: 360px;
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
  margin: 0px 2px;
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
  background-color: transparent;
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
  font-size: 13px;
  color: $almost-black;
  background-color: transparent;
  border-bottom: 1px solid $very-light-grey;
  height: 75px;
  width: 100%;
  // &:hover {
  //   background-color: $off-white;
  // }
  &:focus {
    outline: none !important;
  }
}

.selected {
  box-shadow: inset 0 0 6px rgb(221, 220, 220) !important;
  background-color: rgb(220, 241, 250);
}

.time-text {
  font-size: 12px;
  text-align: center;
  color: $light-grey;
}

.results-container {
  border: 1px solid $very-light-grey;
  border-radius: 0.25rem;
  background-color: $white;
  width: 100%;
  height: 275px;
}

.error-container {
  border: 1px solid $very-light-grey;
  border-radius: 0.25rem;
  background-color: $white;
  width: 100%;
  padding: 15px;
}

.error-icon {
  color: $red;
}

.error-text {
  line-height: 100px;
  font-size: 20px;
  margin: 0px;
}

@import "node_modules/bootstrap/scss/bootstrap";
@import "node_modules/bootstrap-vue/src/index.scss";
</style>
