chrome.webRequest.onCompleted.addListener(
    (details) => {
        fetch(details.url)
        .then(response => response.text())
        .then(data => console.log("got track"))
        
    },
    {urls: ["*://*.youtube.com/api/timedtext*"]}
);

