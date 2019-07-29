let youfind = { 
    connectToPort,
    getCaptionTracks,
    getCurrentTrack
}

function connectToPort(){
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0].url.includes("youtube.com")) {
              resolve(chrome.tabs.connect(tabs[0].id));
            } else {
                reject({message: "Not on youtube"})
            }
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

function getCurrentTrack(captionTracks, currentLanguage) {
  return new Promise((resolve, reject) => {
    let currentTrack = 0;
    captionTracks.find( track => {
      if (track.kind == currentLanguage.kind && track.languageCode == currentLanguage.currentLanguage){
        currentTrack = track;
      }
    });
    if (currentTrack){
      resolve(fetchAndParseTrack(currentTrack));
    } else {
      reject({message: "No track available for current language"});
    }
  })
}

export default youfind;

