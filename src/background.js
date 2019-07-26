chrome.webRequest.onCompleted.addListener(
    (details) => {
        console.log(details)
        fetch(details.url)
        .then(response => response.text())
        .then(data => console.log(data))
    },
    {urls: ["*://*.youtube.com/api/timedtext*"]}
);

