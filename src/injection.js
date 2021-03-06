let player = 0;

document.body.addEventListener("yt-navigate-finish", event => {
  console.log("navigate finished", event);
  var url = new URL(window.location.href);
  var urlParams = new URLSearchParams(url.search);
  var videoId = urlParams.get("v");
  let response = event.detail.response;
  // TODO response.player might be undefined??
  let playerId = response.player.attrs.id;
  player = document.getElementById(playerId);
  let captions = response.playerResponse.captions
  if (typeof captions == "undefined"){
    window.postMessage({
      type: "FROM_WEBPAGE", 
      message:"captionTrackUrls",
      videoId: videoId,
      tracks: []
    }, "*");
  } else {
    let captionTracks = captions.playerCaptionsTracklistRenderer.captionTracks;
    window.postMessage({
      type: "FROM_WEBPAGE", 
      message:"captionTrackUrls", 
      videoId: videoId,
      tracks: captionTracks
    }, "*");
  }  
});

window.addEventListener("message", event => {  
  if (event.source != window) return;
  
  if (event.data.type && (event.data.type == "FROM_CONTENT_SCRIPT")){            
    switch (event.data.message) {
      case "changeCaptionLanguage":
        changeCaptionLanguage(event.data.language);
        break;
      case "seekToTime":
        seekToTime(event.data.time);
        break;
      default:
        break;
    }
  }
});

function changeCaptionLanguage(language) {
  if (player == null){
    setTimeout(() => {
      changeCaptionLanguage(language)
    }, 500);
  } else {
    console.log("changing caption languages");
    player.setOption("captions", "track", {languageCode: language});
  }
}

function seekToTime(time) {
  if (player == null){
    setTimeout(() => {
      seekToTime(time);
    }, 500);
  } else {
    console.log("seeking to time");
    player.seekTo(time);
  }
}


