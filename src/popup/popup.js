// let API = "https://www.googleapis.com/youtube/v3/captions";
// let auth = null;

// window.addEventListener("load", () => {
//     document.getElementById("fetchTracks").addEventListener("click", fetchCaptionList);
//     document.getElementById("fetchTrack").addEventListener("click", fetchCaption);
//     chrome.runtime.onMessage.addListener( (message, callback, response) => {
//         if (message.data == "auth"){
//             auth = message.auth;
//             response({recieved: true});
//         }
//     });
//     chrome.runtime.sendMessage({data: "requestAuth"}, (response) => {});
// })

// function fetchCaptionList(){
//     chrome.tabs.getSelected(null, (tab) => {
//         let tabURL = new URL(tab.url);
//         let searchParams = tabURL.searchParams;
//         let videoId = searchParams.get("v");
//         let fetchURL = new URL(API);
//         let fetchParams = fetchURL.searchParams;
//         fetchParams.set("part", "snippet");
//         fetchParams.set("videoId", videoId);
//         fetch(fetchURL.href, auth)
//         .then(response => response.json())
//         .then(data => {
//             showCaptionList(data.items)
//         })
//     });
// }

// function showCaptionList(items){
//     let tracks = document.getElementById("tracks");
//     items.forEach(item => {
//         let option = document.createElement("option");
//         let language = item.id;
//         let text = document.createTextNode(language);
//         option.appendChild(text);
//         tracks.appendChild(option);
//     });
// }

// function fetchCaption(){
//     let id = document.getElementById("tracks").value;
//     let fetchURL = new URL(API + "/id");
//     let fetchParams = fetchURL.searchParams;
//     fetchParams.set("id", id)
//     fetch(fetchURL.href, auth)
//     .then(response => response.text())
//     .then(data => {
//         console.log(data);
//         parseCaption(data);
//     })
// }

// function parseCaption(track){
//     let times = /\d:\d{2}:\d{2}.\d{3},\d:\d{2}:\d{2}.\d{3}/g;
//     let intervals = track.split(times);
//     console.log(intervals);
// }
