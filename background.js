var options = {
  // The actual urls to block
  blocked_urls: [],
  // Extension enabled flag
  enabled: true
};

function set_blocked_url(url, add_or_remove, callback) {
  load_options(function(options) {
    var index = options.blocked_urls.indexOf(url);
    if(add_or_remove) {
      if(index === -1) {
        options.blocked_urls.push(url);
        options.enabled = true;
        store_options(options, callback);
      }
    } else {
      if(index >= 0) {
        options.blocked_urls.splice(index, 1);
        store_options(options, callback);
      }
    }
  })
}

function set_enabled(enabled, callback) {
  options.enabled = enabled;
  store_options(options, callback);
}

// Load config from storage

load_options(function(loaded_options) {
  options = loaded_options;
  update_options(options);
});

// Use console on the background pageipo01

var console = chrome.extension.getBackgroundPage().console;

// Block urls before navigation

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  if(options.enabled) {
    var url = details.url;
    for(var i = 0; i < options.blocked_urls.length; i++) {
      var block = options.blocked_urls[i];
      if(details.url.startsWith(block)) {
        return {cancel: true};
      }
    }
  }
}, {urls: ["*://*/*"]}, ["blocking"]);

// Add context menu to block pages

function tab_reload() {
  chrome.tabs.executeScript({
    code: 'document.location.reload();'
  }, function() {
    if (chrome.runtime.lastError) {
      // Ignore permission errors
      console.log(chrome.runtime.lastError.message);
    }
  });
}

function url_domain(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.protocol + '//' + parser.hostname + '/';
}

chrome.contextMenus.create({title: "Block domain", onclick: function(info, tab) {
  set_blocked_url(url_domain(tab.url), true, tab_reload);
}});

chrome.contextMenus.create({title: "Unblock domain", onclick: function(info, tab) {
  set_blocked_url(url_domain(tab.url), false, tab_reload);
}});

// Add context menu for global enable/disable

var enabled_menu = chrome.contextMenus.create({title: "Enabled", type: 'checkbox', checked: options.enabled, onclick: function(info, tab) {
    set_enabled(! options.enabled, tab_reload);
  }
});

// Receive changes from options page

function update_options(updated_options) {
  options = updated_options;
  chrome.contextMenus.update(enabled_menu, {checked: options.enabled});
}

chrome.runtime.onMessage.addListener(function(received_options, sender, sendResponse) {
  update_options(received_options);
});

// Add startsWith function to String prototype

if(typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) == 0;
  };
}