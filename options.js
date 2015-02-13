var blocked_urls_element;
var enabled_element;

function init() {
  blocked_urls_element = document.getElementById('blocked_urls');
  enabled_element = document.getElementById('enabled');
  load_options(function(options) {
    set_options_in_view(options);
  })
}

function set_options_in_view(options) {
  blocked_urls_element.value = options.blocked_urls.join("\n");  
  enabled_element.checked = options.enabled;  
}

function get_options_from_view() {
  return {
    blocked_urls: blocked_urls_element.value.split("\n").filter(function(e) { return e; }),
    enabled: enabled_element.checked
  }
}

function save_options() {
  store_options(get_options_from_view());
}

// Receive changes from context menu block page (in background.js)

chrome.runtime.onMessage.addListener(function(options) {
  set_options_in_view(options);
});

// Bind events to html elements

window.onload = init;
document.getElementById('save').onclick = save_options;
