// The actual urls to block

var blocked_urls = [];

// Storage helpers

function load_blocked_urls(callback) {
  chrome.storage.sync.get({
    blocked_urls: []
  }, function(options) {
    callback(options.blocked_urls);
  });  
}

function add_blocked_url(url, callback) {
  load_blocked_urls(function(blocked_urls) {
    if(blocked_urls.indexOf(url) == -1) {
      blocked_urls.push(url);
      var options = {blocked_urls: blocked_urls};
      chrome.storage.sync.set(options, function() {
        // Also update settings view
        chrome.runtime.sendMessage(options);
        callback();
      });
    }
  })
}

// Load config from storage

load_blocked_urls(function(loaded_blocked_urls) {
  blocked_urls = loaded_blocked_urls;
});

// Use console on the background pageipo01

var console = chrome.extension.getBackgroundPage().console;

// Block urls before navigation

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  var url = details.url;
  for(var i = 0; i < blocked_urls.length; i++) {
    var block = blocked_urls[i];
    if(details.url.startsWith(block)) {
      console.log("blocked: " + url)
      return {cancel: true};
    }
  }
}, {urls: ["*://*/*"]}, ["blocking"]);

// Add context menu to block pages

var block_menu = chrome.contextMenus.create({title: "Block urls from this domain", onclick: function(info, tab) {
  var parser = document.createElement('a');
  parser.href = tab.url;
  add_blocked_url(parser.protocol + '//' + parser.hostname + '/', function() {
    chrome.tabs.executeScript({
      code: 'document.location.reload();'
    });
  });
}});

// Receive changes from options

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.blocked_urls) {
    blocked_urls = request.blocked_urls;
    sendResponse('blocked_urls updated');
  }
});

// Add startsWith function to String prototype

if(typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) == 0;
  };
}