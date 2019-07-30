chrome.runtime.onInstalled.addListener( () => {
    chrome.storage.local.set({
        localStorageKeyQueue: [], 
        querySession: {
            videoId: null,
            query: ""
        }
    });
});

