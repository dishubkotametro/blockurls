function set_blocked_urls_textarea_value(blocked_urls) {
  document.getElementById('blocked_urls').value = blocked_urls.join("\n");  
}

function load_options() {
  chrome.storage.sync.get({
    blocked_urls: [
      'https://facebook.com/',
      'https://twitter.com/'
    ]
  }, function(options) {
    set_blocked_urls_textarea_value(options.blocked_urls);
  });
}

function save_options() {
  var blocked_urls = document.getElementById('blocked_urls').value.split("\n").filter(function(e) { return e; });
  var options = {
    blocked_urls: blocked_urls,
  };
  chrome.storage.sync.set(options, function() {
    chrome.runtime.sendMessage(options, function(response) {
      console.log(response);
      load_options();
    });
  });
}

// Receive changes from context menu block page (in background.js)

chrome.runtime.onMessage.addListener(function(request) {
  if(request.blocked_urls) {
    set_blocked_urls_textarea_value(request.blocked_urls);
  }
});

// Bind events to html elements

window.onload = load_options;
document.getElementById('save').onclick = save_options;
