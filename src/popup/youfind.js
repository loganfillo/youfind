let youfind = {
  getVideoId,
  connectToPort,
  getOptions,
  storeOptions,
  getParsedTrack,
  getQuerySession,
  storeQuerySession,
  seekToTime,
}

/* Public Namespace*/

/**
 * Gets the video id if the current selected tab is a youtube video
 * 
 * @returns Promise that resolve with video id or rejects with error
 */
function getVideoId() {
  return new Promise((resolve, reject) => {
    let error = {
      type: "NOT_ON_YOUTUBE_VIDEO",
      message: "Not on a YouTube video"
    }
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0].url.includes("youtube.com")) {
        let tabUrl = new URL(tabs[0].url);
        let videoId = tabUrl.searchParams.get("v");
        if (videoId){
          resolve(videoId)
        } else {
          reject(error);
        }
      } else {
        reject(error);
      }
    });
  });
}

/**
 * Connects to the content script in the current tab
 * 
 * @returns Promise that resolves with port connection object
 */
function connectToPort() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(chrome.tabs.connect(tabs[0].id));
    });
  });
}

/**
 * Gets the current options (lang, autoCC, highlight color)
 * 
 * @returns Promise that resolves with current options
 */
function getOptions() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["options"], result => {
      resolve(result.options);
    });
  });
}

/**
 * Store the current selected options (lang, autoCC, highlight color)
 * 
 * @param {any} options the options to store
 */
function storeOptions(options) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ options }, () => {
      resolve();
    });
  });
}

/**
 * Gets the parsed track from the given video id in the given language
 * 
 * If the parsed track already exists in storage, returns that, otherwise
 * fetches and parses the track from the video's caption urls
 * 
 * If the video contains no captions, has no captions for the desired language,
 * or could not correctly fetch and parse the track, rejects Promise with error
 * describing what went wrong
 * 
 * @returns Promise that resolve with parsed caption track, or rejects with 
 *          error specifying what went wrong
 * 
 * @param {string} language desired langauge containing kind and language code
 * @param {string} videoId desired video id
 */
function getParsedTrack(language, videoId) {  
  return new Promise( async (resolve, reject) => {
    let key = language.languageCode + language.kind;
    let video = await getVideo(videoId);
    if (!video[key]) {
      let unparsedTrack = 0;
      let captionTrackUrls = video.captionTrackUrls;
      if (captionTrackUrls.length <= 0) {
        reject({
          type: "NO_CAPTION_TRACKS", 
          message: "This video does not have any caption tracks" 
        });
      }
      captionTrackUrls.find(trackUrl => {
        if (trackUrl.languageCode == language.languageCode) {
          if ((!trackUrl.hasOwnProperty("kind") && language.kind == "") || (trackUrl.kind == language.kind)) {
            unparsedTrack = trackUrl;
          }
        }
      });
      if (unparsedTrack) {
        try {
          let parsedTrack = await fetchAndParseTrack(unparsedTrack);
          await adjustLocalStorage(videoId, parsedTrack.length);
          await storeParsedTrack(parsedTrack, video, videoId, key);
          resolve(parsedTrack);
        } catch(error) {
          reject({
            type: "COULD_NOT_PARSE_TRACK",
            message: "Could not fetch and parse current track",
            error: error
          });
        }
      } else {
        reject({ 
          type: "NO_CAPTION_TRACKS_FOR_LANGUAGE",
          message: "No track available for selected language" 
        });
      }
    } else {
      resolve(video[key]);
    }
  })
}

/**
 * Gets the query session from storage, if the query session's
 * video id is the one given, return the session, otherwise returns
 * an empty session with the given video id, an empty query, and
 * negative index
 *
 * @returns Promise that resolves with the query session
 * 
 * @param {string} videoId the video id of the desired session
 */
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

/**
 * Store the current query session (video id, query string, index)
 * 
 * @param {any} querySession the session to store
 */
function storeQuerySession(querySession) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ querySession }, () => {
      resolve();
    });
  });

}

/**
 * Seeks the video in the current page to the given time
 * 
 * @param {any} port the port to send seek message to
 * @param {number} time the time to seek to 
 */
function seekToTime(port, time) {  
  port.postMessage({
    type: "seekToTime",
    time: time
  });
}

/* Private Namespace */

function getVideo(videoId) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([videoId], result => {
      if (!result[videoId]) {
        setTimeout(() => {
          resolve(getVideo(videoId));
        }, 500);
      } else {
        resolve(result[videoId]);
      }
    });
  });
}

// const MAX_STORAGE = 5242880; //REAL STORAGE AMOUNT
const MAX_STORAGE = 30000;

function adjustLocalStorage(videoId, trackLength) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["localStorageVideoQueue"], async result => {
      let originalQueue = result.localStorageVideoQueue;
      try {
        await logStorage("LOG: before adjusting queue");
        let queue = await adjustQueue(originalQueue, videoId, trackLength);
        await logStorage("LOG: after adjusting queue");
        chrome.storage.local.set({ localStorageVideoQueue: queue }, () => {
          resolve();
        });
      } catch(error) {
        reject(error);
      }
    });
  });
}

function storeParsedTrack(parsedTrack, video, videoId, key){
  return new Promise(async (resolve, reject) => {
    await logStorage("LOG: storing video " + videoId);
    video[key] = parsedTrack;
    chrome.storage.local.set({ [videoId]: video }, () => {
      chrome.storage.local.get(null, result => console.log("LOG: after storing", result)); // DEBUG
      resolve();
    });
  });
}

function adjustQueue(queue, videoId, trackLength){
  return new Promise( async (resolve, reject) => { 
    // VERY rough over-approximation      
    let trackSizeInBytes = trackLength * 100;
    if (trackSizeInBytes > MAX_STORAGE) {
      reject({ 
        type: "TRACK_TOO_LARGE_FOR_MEMORY", 
        message: "Track too large for memory", 
        memoryOverflow: trackSizeInBytes - MAX_STORAGE 
      });
    } else {
      while (!await isEnoughLocalStorage(trackSizeInBytes)) {
        try {
          await logStorage("LOG: before removing " + videoId);
          queue = await removeKeyFromQueue(queue, videoId);
          await logStorage("LOG: after removing " + videoId);
        } catch (error){
          reject(error)
        }
      }
      resolve(queue);
    }
  });
}

function isEnoughLocalStorage(trackSizeInBytes) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.getBytesInUse(null, async bytesInUse => {
      if (MAX_STORAGE < (trackSizeInBytes + bytesInUse)) {
        await logStorage("LOG: not enough storage, overflow " + (bytesInUse + trackSizeInBytes - MAX_STORAGE));
        resolve(false)
      } else {
        resolve(true);
      }
    });
  });
}

function removeKeyFromQueue(queue, videoId) {
  return new Promise(async (resolve, reject) => {
    if (queue.length > 0) {
      let videoIdToRemove = queue[0];
      if (videoIdToRemove == videoId){
        reject({
          type: "CANNOT_REMOVE_AND_ADD_FROM_SAME_VIDEO",
          message: "Cannot remove video data from cache to add data from same video" 
        })
      } else {
        let keyToRemove = queue.shift();
        await removeVideo(keyToRemove);
        resolve(queue);
      }
    }
  });
}

function removeVideo(videoId) {
  return new Promise(async (resolve, reject) => {
    await logStorage("LOG: removing video " + videoId);
    chrome.storage.local.remove([videoId], () => {
      resolve();
    });
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
        reject(error);
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
    .replace(/&amp;quot;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<");
}

function logStorage(message) {
  return new Promise(resolve => {
    chrome.storage.local.get(null, result => {
      console.log( message , result)
      resolve();
    });    
  })
}

export default youfind;
