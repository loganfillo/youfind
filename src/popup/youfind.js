let youfind = {
    onYouTube, 
    connectToPort,
    getCaptionTracks,
    getParsedTrack,
    seekToTime
}

function onYouTube() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0].url.includes("youtube.com")) {
        resolve(true);
      } else {
        resolve(false)
      }
    });
  });
}

function connectToPort() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              resolve(chrome.tabs.connect(tabs[0].id));
        });
    });
}

function getCaptionTracks() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["captionTracks"], result => {
        if (!result.hasOwnProperty("captionTracks")) {
          setTimeout(() => {
            resolve(getCaptionTracks());
          }, 500);
        } else {
          resolve(result.captionTracks);
        }
      });
    });
}

function getParsedTrack(captionTracks, language) {  
  return new Promise((resolve, reject) => {
    let unparsedTrack = 0;
    captionTracks.find( track => {
      if (track.languageCode == language.languageCode){
        if ((!track.hasOwnProperty("kind") && language.kind == "")||(track.kind == language.kind)){
          unparsedTrack = track;
        }
      }
    });
    if (unparsedTrack){
      fetchAndParseTrack(unparsedTrack)
      .then( response => resolve(response));
    } else {
      reject({message: "No track available for current language"});
    }
  })
}

function seekToTime(port, time){
  port.postMessage({
    type: "seekToTime",
    time: time
  });
}

function fetchAndParseTrack(track) {
  return new Promise((resolve, reject) => {    
    let trackUrl = track.baseUrl;        
    fetch(trackUrl)
    .then( response => response.text())
    .then( text => (new window.DOMParser()).parseFromString(text, "text/xml"))
    .then( data => {
      let trackDOM = data;
      resolve(parseXML(trackDOM));
    })
    .catch( error => {
      reject({message: "Could not fetch and parse current track", error: error});
    });
  });
}

function parseXML(trackDOM) {
    let parsedTrack = [];
    let textElems = trackDOM.getElementsByTagName("text");
    for (let elem of textElems){
      let caption = {};
      caption.start = parseFloat(elem.attributes.getNamedItem("start").value);
      caption.end = caption.start + parseFloat(elem.attributes.getNamedItem("dur").value);
      caption.text = escapeXML(elem.innerHTML);
      parsedTrack.push(caption);
    }
    return parsedTrack;
}

function escapeXML(xmlText) {
  return xmlText
  .replace(/&amp;#38;/g, "&")
  .replace(/&amp;#39;/g, "'")
  .replace(/&amp;#34;/g, '"')
}

export default youfind;

