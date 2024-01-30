

const { app, Menu, BrowserWindow,screen,Notification,Tray,ipcMain } = require('electron')
const clipboardWatcher = require('electron-clipboard-watcher')
const translate = require('./lib/engine/translate.js')
const path = require('node:path')
const cfg = require('./lib/engine/config.js')

let tray = null
let cfgobj = {};

let configWindow;
let mainWindow_clone;

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 500,
    icon: path.join(__dirname, 'lib/img/icon.png'),
    x:0, //left top
    //x:screen.getPrimaryDisplay().workAreaSize.width -350 , //right top
    y:0,
    resizable:false,
    alwaysOnTop:true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow_clone = mainWindow;
  mainWindow.on('close', (event) => {
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
    event.preventDefault();
  })

  mainWindow.loadFile('index.html')

  //托盘
  tray = new Tray(path.join(__dirname, 'lib/img/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {click:(menuItem)=>{
      menuItem.checked = !cfgobj.notification;
      cfgobj.notification = !cfgobj.notification;
      console.log(cfgobj.notification);
    },  label: '翻译通知', type: 'checkbox',checked: cfgobj.notification},
    {click(){mainWindow.show();}, label: '显示窗口', type: 'normal' },
    {click(){mainWindow.destroy();app.quit();}, label: '退出', type: 'normal' }
  ])
  tray.setContextMenu(contextMenu);
  tray.on('click', ()=> {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  
  //mainWindow.webContents.openDevTools();

  //发送引擎列表到页面
  // let enginelist = (function (obj) {
  //   let tmp = obj;
  //   for (let key in tmp) {
  //     if (tmp[key].name) {
  //       delete tmp[key].appid;
  //       delete tmp[key].key;
  //     }
  //   }
  //   return tmp;
  // })(cfgobj);
  // console.log(enginelist);
  //console.log("main.js",cfgobj)

  mainWindow.webContents.on('did-finish-load', () => {  
    mainWindow.webContents.send('enginelist', cfgobj);
  });  

  clipboardWatcher({
    watchDelay: 1000,
    onTextChange: async function (text) { 
      console.log(text);
      const engine_type = cfgobj.curengine;
      const engine = cfgobj[engine_type];
      const result = await translate.translate(text,engine_type,engine);
      mainWindow.webContents.send('update-text', result);
      //通知显示，可配置
      if (cfgobj.notification==true) {
        new Notification({
          icon:'./lib/img/icon.png',
          silent:true,
          //title: result.origintext,
          body: result.resulttext
        }).show();
      }
    }
  })
}

//翻译引擎配置窗口
function createConfigWindow() {
  if (!configWindow || configWindow.isDestroyed()) {
    configWindow = new BrowserWindow({
      width: 800,
      height: 500,
      icon: path.join(__dirname, 'lib/img/icon.png'),
      //x:0, //left top
      //y:0,
      //resizable:false,
      alwaysOnTop:true,
      webPreferences: {
        preload: path.join(__dirname, 'preloadjs/config.js')
      }
    })
    configWindow.loadFile('html/config.html');
    
    //configWindow.webContents.openDevTools();
    //
    configWindow.webContents.on('did-finish-load', () => {  
      configWindow.webContents.send('enginelist', cfgobj);
    });  
  }else{
    configWindow.focus();
    configWindow.show();
  }
  
}


app.whenReady().then(() => {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    console.log("Another instance is already running.");
    //return false;
    app.quit();
  }else{
    console.log("ready to start");
    cfgobj = cfg.cfgread();

    Menu.setApplicationMenu(null); // menu null
    createWindow()

    //监控引擎变化并更新
    ipcMain.on('change-engine', function (event, engine) {
      console.log("ipcMain.on change-engine",engine);
      cfgobj.curengine = engine;
      cfg.cfgsave(cfgobj);
    });

    //监控翻译按钮并反馈结果
    ipcMain.handle('translator', async (event,query) => {
      const engine_type = cfgobj.curengine;
      const engine = cfgobj[engine_type];
      const result = await translate.translate(query,engine_type,engine);
      return result;
    });

    //打开引擎配置窗口
    ipcMain.handle('open-config', async (event) => {
      createConfigWindow();
    });

    //保存配置窗口的引擎配置
    ipcMain.on('save-cfg', async (event,cfg_t) => {
      const curengine = cfgobj.curengine;
      for (const key in cfg_t) {
        cfgobj[key] = cfg_t[key];
        //console.log(cfg[key]);
        if (cfgobj[curengine].key=='' &&  cfgobj[key].key!= '') {
          cfgobj.curengine = key;
        }
      }
      cfg.cfgsave(cfgobj);
      mainWindow_clone.webContents.send('enginelist', cfgobj);
    });


    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  }

})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


