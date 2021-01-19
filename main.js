const { app, BrowserWindow } = require("electron");

function createWindow() {
  // Создаем окно браузера.
  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile("index.html");

  // Отображаем средства разработчика.
  win.webContents.openDevTools();

  win.webContents.on('did-finish-load', function () {
    win.webContents.executeJavaScript(`var sel = document.getElementById('profiles');  
    const jsonSb = require("./sb-profiles.json");
    const sbProfilesArr = Array.from(Object.keys(jsonSb));
  
    for (let i = 0; i < sbProfilesArr.length; i++) {
      const opt = document.createElement('option');
      opt.innerHTML = sbProfilesArr[i];
      opt.value = i;
      sel.appendChild(opt);
    }
    
    const jsonNike = require("./nike-profiles.json");
    const nikeProfilesArr = Array.from(Object.keys(jsonNike));

    for (let i = 0; i < nikeProfilesArr.length; i++) {
        const opt = document.createElement('option');
        opt.innerHTML = nikeProfilesArr[i];
        opt.value = i + sbProfilesArr.length;
        sel.appendChild(opt);
    }

    const jsonTsum = require("./tsum-profiles.json");
    const jsonTsumArr = Object.keys(jsonTsum);
  
    for (let i = 0; i < jsonTsumArr.length; i++) {
      const opt = document.createElement('option');
      opt.innerHTML = jsonTsumArr[i];
      opt.value = i + sbProfilesArr.length + nikeProfilesArr.length;
      sel.appendChild(opt);
    }
  

    const selProxy = document.getElementById('proxy');

    const jsonProxies = require("./proxies.json");
    const jsonProxiesArr = Object.keys(jsonProxies);
  
    for (let i = 0; i < jsonProxiesArr.length; i++) {
      const opt = document.createElement('option');
      opt.innerHTML =  jsonProxiesArr[i];
      opt.value = jsonProxies[jsonProxiesArr[i]]['value'];
      selProxy.appendChild(opt);
    }`);
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Некоторые API могут использоваться только после возникновения этого события.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // Для приложений и строки меню в macOS является обычным делом оставаться
  // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // На MacOS обычно пересоздают окно в приложении,
  // после того, как на иконку в доке нажали и других открытых окон нету.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

});


// In this file you can include the rest of your app's specific main process
// code. Можно также поместить их в отдельные файлы и применить к ним require.
