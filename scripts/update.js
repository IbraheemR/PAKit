const request = require("request");
const compareVersions = require('compare-versions');
const electron = require("electron");
const url = require("url");
const path = require("path");
const {app, dialog, shell} = electron;

//Get current release version
let versionCurrent =  require("../package.json").version;

//Get latest version
request({
  url: 'https://api.github.com/repos/IbraheemR/PAKit/releases/latest',
  headers: {
    'User-Agent': 'pakit-app-updater'
  }
}, (error, response, body) => {
  if (!error) {
    releaseLatest = JSON.parse(body);

    if (releaseLatest) {
      let versionLatest = releaseLatest.tag_name;

      needsUpdate  = compareVersions(versionCurrent, versionLatest);
    
      if (compareVersions(versionCurrent, versionLatest) === -1) { //-1 if current behind latest
        dialog.showMessageBox({
          type: "info",
          title: "Update Available!",
          message: `A new version of PAKit is available \n(${versionLatest} ${releaseLatest.name})`,
          buttons: [
            "Download", "Ignore"
          ],
          defaultId: 0,
          cancelId: 1
        }, resp => {
          if (resp == 0) {
            shell.openExternal("http://pakit.cf/download/");
          }
        });
      }
    }
  } else {
    console.warn(error);
  }
});

module.exports = {
  versionString: require("../package.json").version_string
}