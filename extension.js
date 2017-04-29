const SUPER_PROD_ID = 'com.super.productivity.service';
const SUPER_PROD_OBJ_PATH = '/com/super/productivity/service';

const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;
//const Extension = ExtensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;

const DEFAULT_INDICATOR_TEXT = 'SP';

const SuperProductivityIndicator = new Lang.Class({
  Name: 'SuperProductivityIndicator',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0, 'Super Productivity Indicator', false);
    this._buildUi();
  },

  _buildUi: function () {
    this.statusLabel = new St.Label({
      y_align: Clutter.ActorAlign.CENTER,
      text: DEFAULT_INDICATOR_TEXT
    });
    this.statusLabel.add_style_class_name('super-productivity-indicator-label');

    let topBox = new St.BoxLayout();
    //topBox.add_actor(button);
    topBox.add_actor(this.statusLabel);
    this.actor.add_actor(topBox);
    topBox.add_style_class_name('super-productivity-indicator');

  },
});

let spMenu;

function init() {
}

function enable() {
  spMenu = new SuperProductivityIndicator;
  Main.panel.addToStatusArea('super-productivity-indicator', spMenu);
}

function disable() {
  spMenu.destroy();
}
