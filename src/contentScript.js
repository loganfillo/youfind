window.addEventListener("message", event => {
    if (event.source != window) return;
    if (event.data.type && (event.data.type == "FROM_WEBPAGE")) {
        switch (event.data.message) {
            case "captionTracks":
                chrome.storage.local.set({ captionTracks: event.data.tracks });
                // chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                //     let tabUrl = new URL(tabs[0].url);
                //     let videoId = tabUrl.searchParams.get("v");
                //     let videoCaptions = { captionTracks: event.data.tracks, cachedTracks: []};
                //     chrome.storage.local.set({[videoId]: videoCaptions});
                //   });
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