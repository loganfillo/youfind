// injects the injection script into youtube DOM
let script = document.createElement('script');
script.src = chrome.runtime.getURL('injection.js');

script.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);