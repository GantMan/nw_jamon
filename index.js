"use strict";

var gui = require('nw.gui');
var CustomTrayMenu = require('./custom_tray_menu');

// Extend application menu for Mac OS
if (process.platform == "darwin") {
  var menu = new gui.Menu({type: "menubar"});
  menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
  gui.Window.get().menu = menu;
}

var $ = function (selector) {
  return document.querySelector(selector);
}

var customTray;

document.addEventListener('DOMContentLoaded', function() {
  $('#add-tray').addEventListener('click', function () {
    if (!customTray) {
      customTray = new CustomTrayMenu('custom-tray-menu.html', 'tray.png', {
        width: 185,
        height: 143
      });
    }
  });

  $('#remove-tray').addEventListener('click', function () {
    if (customTray) {
      customTray.remove();
      customTray = undefined;
    }
  });

  // Register shortcut key
  var option = {
    key : "Ctrl+Shift+A",
    active : function() {
      writeLog("Global desktop keyboard shortcut: " + this.key + " active.");
    },
    failed : function(msg) {
      // :(, fail to register the |key| or couldn't parse the |key|.
      writeLog(msg, "error");
    }
  };


  // Create a shortcut with |option|.
  var shortcut = new gui.Shortcut(option);

  // Register global desktop shortcut, which can work without focus.
  gui.App.registerGlobalHotKey(shortcut);

  // If register |shortcut| successfully and user struck "Ctrl+Shift+A", |shortcut|
  // will get an "active" event.

  // You can also add listener to shortcut's active and failed event.
  shortcut.on('active', function() {
    writeLog("Global desktop keyboard shortcut: " + this.key + " active.");
  });

  shortcut.on('failed', function(msg) {
    writeLog(msg);
  });


  // bring window to front when open via terminal
  gui.Window.get().focus();

  writeLog('TACO', 'error')

  // for nw-notify frameless windows
  gui.Window.get().on('close', function() {
    // Unregister the global desktop shortcut.
    gui.App.unregisterGlobalHotKey(shortcut);
    gui.App.quit();
  });
});

var writeLog = function (msg, type) {
  var logElement = $("#output");
  logElement.innerHTML += `<span class=${type}>${msg}</span><br>`;
  logElement.scrollTop = logElement.scrollHeight;
};

process.on('log', function (message) {
  writeLog(message);
});

// print error message in log window
process.on("uncaughtException", function(exception) {
  var stack = exception.stack.split("\n");
  stack.forEach(function (line) {
    writeLog(line, 'error');
    process.stdout.write(String(line) + "\n");
  });
});
