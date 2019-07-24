chrome.runtime.onMessage.addListener( (message, callback, response) => {
    if (message.data == "requestAuth"){
        getAuth();
    }
    response({recieved: true});
});

function getAuth(){
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
        chrome.runtime.sendMessage({ data: "auth", auth: auth}, (response) => {});
    });
}
