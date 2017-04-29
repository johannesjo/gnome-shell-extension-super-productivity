const SUPER_PROD_ID = 'com.super.productivity.service';
const SUPER_PROD_OBJ_PATH = '/com/super/productivity/service';

const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const DBusIface = Me.imports.dbus;
const Gio = imports.gi.Gio;
const DEFAULT_INDICATOR_TEXT = 'no task';
const PopupMenu = imports.ui.popupMenu;

const SuperProductivity = Gio.DBusProxy.makeProxyWrapper(DBusIface.SuperProductivityIface);

const SuperProductivityIndicator = new Lang.Class({
  Name: 'SuperProductivityIndicator',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0, 'Super Productivity Indicator', false);
    this._buildUi();
    this._proxy = new SuperProductivity(Gio.DBus.session, SUPER_PROD_ID, SUPER_PROD_OBJ_PATH);

    this._taskChangedId = this._proxy.connectSignal('taskChanged', Lang.bind(this, this._taskChanged));

  },

  _taskChanged: function (emitter, something, taskId) {
    global.log('super', taskId);
    if (taskId === 'NONE') {
      this.isActiveTask = false;
      // TODO set pause icon
    } else {
      this.currentTaskLabel.set_text(taskId.toString());
      this.isActiveTask = true;
      // TODO set play icon
    }
  },

  _buildUi: function () {
    this.wrapperEl = new St.BoxLayout();
    this.wrapperEl.add_style_class_name('spi-wrapper');

    // button
    let toggleButton = new St.Bin({
      style_class: 'spi-button-toggle',
      reactive: true,
      can_focus: true,
      y_fill: false,
      track_hover: true
    });
    let toggleButtonIcon = new St.Icon({
      icon_name: 'media-playback-start-symbolic',
      style_class: 'spi-icon-play'
    });
    toggleButton.set_child(toggleButtonIcon);
    this.wrapperEl.add_actor(toggleButton);

    toggleButton.connect('button-press-event', Lang.bind(this, this._togglePlay));

    // label
    this.currentTaskLabel = new St.Label({
      y_align: Clutter.ActorAlign.CENTER,
      text: DEFAULT_INDICATOR_TEXT,
      style_class: 'spi-label'
    });
    this.wrapperEl.add_actor(this.currentTaskLabel);

    // main app icon
    let markAsDoneBtn = new St.Bin({
      style_class: 'spi-button-mark-as-done',
      reactive: true,
      can_focus: true,
      y_fill: false,
      track_hover: true
    });
    let mainIcon = new St.Icon({
      gicon: Gio.icon_new_for_string(Me.path + '/tray-ico@2.png'),
      style_class: 'spi-icon-mark-as-done'
    });
    markAsDoneBtn.set_child(mainIcon);
    this.wrapperEl.add_actor(markAsDoneBtn);

    // finally add all to tray
    this.actor.add_actor(this.wrapperEl);

    // add menu
    // --------
    // create new session section and menu
    this._menu = new PopupMenu.PopupMenuSection();
    this.menu.addMenuItem(this._menu);

    const itemShow = new PopupMenu.PopupMenuItem('Show App');
    this._menu.addMenuItem(itemShow);
    itemShow.connect('activate', Lang.bind(this, this._showApp));

    const itemCloseApp = new PopupMenu.PopupMenuItem('Quit');
    this._menu.addMenuItem(itemCloseApp);
    itemCloseApp.connect('activate', Lang.bind(this, this._quitApp));
  },

  _togglePlay: function () {
    global.log('super', 'PLAY_TOGGLE');
    if (this.isActiveTask === true) {
      this._proxy.startTaskSync('PLAY_TASK');
    } else {
      this._proxy.pauseTaskSync('PAUSE_TASK');
    }
  },

  _showApp: function () {
    global.log('super', 'SHOW');
    this._proxy.showAppSync();
  },

  _quitApp: function () {
    global.log('super', 'QUIT');
    this._proxy.quitAppSync();
  },

});

let spMenu;

function init() {
}

let watcherId;
function enable() {
  function _connected(obj, name) {
    global.log('super', 'CONNECTED', arguments);
    spMenu = new SuperProductivityIndicator;
    Main.panel.addToStatusArea('super-productivity-indicator', spMenu);
  }

  function _disconnected() {
    global.log('super', 'DIS _ CONNECTED');
    if (spMenu) {
      spMenu.destroy();
    }
  }

  // watch for bus being available
  watcherId = Gio.DBus.session.watch_name(
    SUPER_PROD_ID,
    Gio.BusNameWatcherFlags.AUTO_START,
    _connected,
    _disconnected);
}

function stopWatcher() {
  if (watcherId) {
    Gio.DBus.session.unwatch_name(watcherId);
    watcherId = 0;
  }
}

function disable() {
  stopWatcher();
  spMenu.destroy();
}

