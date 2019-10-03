window.addEventListener("message", event => {    
    if (event.source != window) return;
    if (event.data.type && (event.data.type == "FROM_WEBPAGE")) {        
        switch (event.data.message) {
            case "captionTrackUrls":
                let videoId = event.data.videoId;
                let video = {
                    videoId: videoId,
                    captionTrackUrls: event.data.tracks
                }
                chrome.storage.local.get(["localStorageVideoQueue"], result => {
                    let queue = result.localStorageVideoQueue;
                    if (!queue.includes(videoId)) {
                        queue.push(videoId)
                        chrome.storage.local.set({ localStorageVideoQueue: queue }, () => {
                            chrome.storage.local.set({ [videoId]: video});
                        });
                    }
                });
                break;
            default:
                break;
        }
    }
});

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(message => {
        switch (message.type) {
            case "changeCaptionLanguage":
                window.postMessage({
                    type: "FROM_CONTENT_SCRIPT",
                    message: "changeCaptionLangauge",
                    language: message.language
                });
                break;
            case "seekToTime":
                window.postMessage({
                    type: "FROM_CONTENT_SCRIPT",
                    message: "seekToTime",
                    time: message.time
                });
                break;
            default:
                break;
        }
    });
});

// insert the injection script into youtube DOM
let script = document.createElement('script');
script.src = chrome.runtime.getURL('injection.js');

script.onload = function () {
    this.remove();
};

(document.head || document.documentElement).appendChild(script);