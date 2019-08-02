chrome.runtime.onInstalled.addListener( () => {
    chrome.storage.local.set({
        localStorageKeyQueue: [], 
        querySession: {
            videoId: null,
            query: "",
            currentIndex: -1
        },
        options: {
            highlightColor: "yellow",
            language: {
                languageCode: "en",
                kind: "asr"
            },
            turnOnCC: true
        }
    });
});

