let youfind = {
  onYouTube,
  connectToPort,
  getVideoId,
  getOptions,
  storeOptions,
  getCaptionTracks,
  getParsedTrack,
  getQuerySession,
  storeQuerySession,
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

function getVideoId() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      let tabUrl = new URL(tabs[0].url);
      let videoId = tabUrl.searchParams.get("v");
      resolve(videoId);
    });
  });
}

function getOptions() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["options"], result => {
      resolve(result.options);
    });
  });
}

function storeOptions(options) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ options }, () => {
      resolve();
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
        if (result.captionTracks.length > 0) {
          resolve(result.captionTracks);
        } else {
          reject({ message: "This video does not have any caption tracks" });
        }
      }
    });
  });
}

function getParsedTrack(captionTracks, language, videoId) {
  return new Promise((resolve, reject) => {
    let key = videoId + language.languageCode + language.kind;
    chrome.storage.local.get([key], result => {
      if (result.hasOwnProperty(key)) {
        resolve(result[key])
      } else {
        let unparsedTrack = 0;
        captionTracks.find(track => {
          if (track.languageCode == language.languageCode) {
            if ((!track.hasOwnProperty("kind") && language.kind == "") || (track.kind == language.kind)) {
              unparsedTrack = track;
            }
          }
        });
        if (unparsedTrack) {
          fetchAndParseTrack(unparsedTrack)
            .then(parsedTrack => {
              addKeyToQueue(key, parsedTrack.length)
                .then(() => {
                  chrome.storage.local.set({ [key]: parsedTrack });
                  resolve(parsedTrack);
                })
                .catch(() => {
                  reject({ message: "Track too large for memory" });
                });
            });
        } else {
          reject({ message: "No track available for selected language" });
        }
      }
    });
  })
}

function getQuerySession(videoId) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["querySession"], result => {
      let session = result.querySession;
      if (session.videoId == videoId) {
        resolve(session);
      } else {
        resolve({
          videoId,
          query: "",
          index: -1
        });
      }
    });
  });
}

function storeQuerySession(querySession) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ querySession }, () => {
      resolve();
    });
  });

}

function seekToTime(port, time) {
  port.postMessage({
    type: "seekToTime",
    time: time
  });
}

// const MAX_STORAGE = 5242880;
const MAX_STORAGE = 100000;

function addKeyToQueue(key, trackLength) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["localStorageKeyQueue"], async result => {
      let queue = result.localStorageKeyQueue;
      // VERY rough over-approximation      
      let trackSizeInBytes = trackLength * 100;
      if (trackSizeInBytes > MAX_STORAGE) {
        reject();
      }
      chrome.storage.local.get(null, result => console.log(result));
      while (!await isEnoughLocalStorage(trackSizeInBytes)) {
        queue = await removeKeyFromQueue(queue);
      }
      queue.push(key);
      console.log(queue);
      
      chrome.storage.local.set({ localStorageKeyQueue: queue }, () => {
        chrome.storage.local.get(null, result => console.log(result));
        resolve();
      });
    });
  });
}

function isEnoughLocalStorage(trackSizeInBytes) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.getBytesInUse(null, bytesInUse => {
      if (MAX_STORAGE < (trackSizeInBytes + bytesInUse)) {
        console.log("not enough storage");
        resolve(false)
      } else {
        console.log("enough storage");
        resolve(true);
      }
    });
  });
}

function removeKeyFromQueue(queue) {
  return new Promise((resolve, reject) => {
    if (queue.length > 0) {
      let keyToRemove = queue.shift();
      console.log("removing", keyToRemove);
      chrome.storage.local.remove([keyToRemove], () => {
        resolve(queue);
      });
    }
  });
}

function fetchAndParseTrack(track) {
  return new Promise((resolve, reject) => {
    let trackUrl = track.baseUrl;
    fetch(trackUrl)
      .then(response => response.text())
      .then(text => (new window.DOMParser()).parseFromString(text, "text/xml"))
      .then(data => {
        let trackDOM = data;
        resolve(parseXML(trackDOM));
      })
      .catch(error => {
        reject({ message: "Could not fetch and parse current track", error: error });
      });
  });
}

function parseXML(trackDOM) {
  let parsedTrack = [];
  let textElems = trackDOM.getElementsByTagName("text");
  for (let elem of textElems) {
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
    .replace(/&amp;amp;/g, "&")
    .replace(/&amp;#38;/g, "&")
    .replace(/&amp;#39;/g, "'")
    .replace(/&amp;#34;/g, '"')
    .replace(/&quot;/g, "'");
}

export default youfind;

