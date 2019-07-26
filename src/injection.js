function onYouTubeIframeAPIReady() {
  console.log("YouTube API ready");
  let player = document.getElementById("movie_player");
  
}

let tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


