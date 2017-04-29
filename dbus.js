const Gio = imports.gi.Gio;

const SuperProductivityIface = loadInterfaceXml('dbus.xml')

// inspired from https://github.com/rgcjonas/gnome-shell-extension-appindicator/blob/master/interfaces.js
function loadInterfaceXml(filename) {
  let extension = imports.misc.extensionUtils.getCurrentExtension();
  let interfacesDir = extension.dir.get_child('.');
  let file = interfacesDir.get_child(filename);
  let [result, contents] = imports.gi.GLib.file_get_contents(file.get_path());
  global.log('super Dbus:', result, contents);

  if (result) {
    //HACK: The '' + trick is important as hell because file_get_contents returns
    // an object (WTF?) but Gio.makeProxyWrapper requires `typeof() == "string"`
    // Otherwise, it will try to check `instanceof XML` and fail miserably because there
    // is no `XML` on very recent SpiderMonkey releases (or, if SpiderMonkey is old enough,
    // will spit out a TypeError soon).
    return '<node>' + contents + '</node>'
  } else {
    throw new Error('AppIndicatorSupport: Could not load file: ' + filename)
  }
}