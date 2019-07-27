let API = "https://www.googleapis.com/youtube/v3/captions";
let auth = null;

window.addEventListener("load", () => {
    document.getElementById("fetchTracks").addEventListener("click", fetchCaptionList);
    document.getElementById("fetchTrack").addEventListener("click", fetchCaption);
    chrome.runtime.onMessage.addListener( (message, callback, response) => {
        if (message.data == "auth"){
            auth = message.auth;
            response({recieved: true});
        }
    });
    chrome.runtime.sendMessage({data: "requestAuth"}, (response) => {});
})

function fetchCaptionList(){
    chrome.tabs.getSelected(null, (tab) => {
        let tabURL = new URL(tab.url);
        let searchParams = tabURL.searchParams;
        let videoId = searchParams.get("v");
        let fetchURL = new URL(API);
        let fetchParams = fetchURL.searchParams;
        fetchParams.set("part", "snippet");
        fetchParams.set("videoId", videoId);
        fetch(fetchURL.href, auth)
        .then(response => response.json())
        .then(data => {
            showCaptionList(data.items)
        })
    });
}

function showCaptionList(items){
    let tracks = document.getElementById("tracks");
    items.forEach(item => {
        let option = document.createElement("option");
        let language = item.id;
        let text = document.createTextNode(language);
        option.appendChild(text);
        tracks.appendChild(option);
    });
}

function fetchCaption(){
    let id = document.getElementById("tracks").value;
    let fetchURL = new URL(API + "/id");
    let fetchParams = fetchURL.searchParams;
    fetchParams.set("id", id)
    fetch(fetchURL.href, auth)
    .then(response => response.text())
    .then(data => {
        console.log(data);
        parseCaption(data);
    })
}

function parseCaption(track){
    let times = /\d:\d{2}:\d{2}.\d{3},\d:\d{2}:\d{2}.\d{3}/g;
    let intervals = track.split(times);
    console.log(intervals);
}

let CAPTIONS_API = "https://www.googleapis.com/youtube/v3/captions";

export async function youfind(){
    let auth = await authenticateUser();
    if (!auth) return {message: "Authentication Failed"};
    let videoID = await getYouTubeVideoID();
    if (!videoID) return {message: "User Not on YouTube Video"};
    let captionList = await getAPICaptionList(videoID, auth);
    if (!captionList) {
        return {message: "Something Went Wrong Getting API Captions"}
    } else if (captionList.length == 0){
        return {message: "No API captions available"};
    }
    let tracks = createTracks(captionList);
    tracks.forEach( track => {
        let trackURL = new URL(CAPTIONS_API + "/id");
        let searchParams = trackURL.searchParams;
        searchParams.set("id", track.trackID)
        // fetch(trackURL.href, auth)
        // .then(response => response.text())
        // .then(data => {
        //     console.log(data);
        // })
        fetch("https://youtube.com/watch?v=" + videoID)
        .then(response => response.json())
        .then( data => {
            console.log(data);
            
        })
    });
    return {message: "Success", tracks: tracks};

}

function authenticateUser() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({type: "requestAuth"}, (response) => {            
            if ( response.status == "Ok"){
                resolve(response.auth);
            } else {
                reject(null);
            }
        });
    });
}

function getYouTubeVideoID() {    
    return new Promise ((resolve, reject) => {
        chrome.tabs.query({"active": true }, (tabs) => {     
            let tabURL = new URL(tabs[0].url);    
            if ( tabURL.host === "www.youtube.com" ){
                if( tabURL.searchParams.has("v") ){
                    resolve(tabURL.searchParams.get("v"));
                }
            }
            resolve(false);      
        });
    });
}

function getAPICaptionList(videoID, auth) {
    return new Promise ((resolve, reject) => {
        let captionListURL = new URL(CAPTIONS_API);
        let searchParams = captionListURL.searchParams;
        searchParams.set("part", "snippet");
        searchParams.set("videoId", videoID);
        fetch(captionListURL.href, auth)
        .then(response => response.json())
        .then(data => {
            resolve(data.items)
        })
        .catch(err => {
            resolve(false)
        });
    });
}

function createTracks(captionList){
    let tracks = [];
    captionList.forEach(captionTrack => {
        let trackID = captionTrack.id;
        let trackLang = captionTrack.snippet.language;
        let trackKind = captionTrack.snippet.trackKind;
        let track= { trackID, trackLang, trackKind };
        tracks.push(track);
    });
    return tracks;
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "requestAuth"){
        getAuth().then((auth) => {
            sendResponse({status: "Ok", auth: auth});
        });
    }
    return true;
});

function getAuth(){
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            let auth = {
                method: 'GET',
                async: true,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                'contentType': 'json'
            };
            resolve(auth);
        });
    });
}