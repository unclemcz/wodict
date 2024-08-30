

const { app, Menu, BrowserWindow,screen,Notification,Tray,ipcMain } = require('electron')
const clipboardWatcher = require('electron-clipboard-watcher')
const translate = require('./lib/engine/translate.js')
const path = require('node:path')
const cfg = require('./lib/engine/config.js')


let tray = null
let cfgobj = {};

let configWindow;
let aboutWindow;
let mainWindow_clone;
let controller ;

function createWindow () {
  const mainWindow = new BrowserWindow({
    //frame: false,
    width: 350,
    height: 520,
    //useContentSize:true,
    hasShadow:false,
    icon: path.join(__dirname, 'lib/img/icon.png'),
    //x:0, //left top
    //x:screen.getPrimaryDisplay().workAreaSize.width-350, //right top
    //y:-100,
    //resizable:false,
    alwaysOnTop:true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  console.log('screen',screen.getPrimaryDisplay().workAreaSize.width);
  mainWindow_clone = mainWindow;
  mainWindow.on('close', (event) => {
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
    event.preventDefault();
  });

  mainWindow.loadFile('index.html')

  //判断配置表中的非关键参数，如果为空，则置初始值
  if (!cfgobj.autotranslate) {
    cfgobj.autotranslate=true;
  }
  if (!cfgobj.wininto) {
    cfgobj.wininto=false;
  }
  //根据配置设置托盘图片路径
  const iconpath = cfgobj.autotranslate ? path.join(__dirname, 'lib/img/icon.png') : path.join(__dirname, 'lib/img/icongrey.png');
  //托盘
  tray = new Tray(iconpath);


  const contextMenu = Menu.buildFromTemplate([
    {click:(menuItem)=>{
      if (cfgobj.autotranslate || cfgobj.autotranslate==true) {
        cfgobj.autotranslate=false;
        tray.setImage(path.join(__dirname, 'lib/img/icongrey.png'));
      }else{
        cfgobj.autotranslate=true;
        tray.setImage(path.join(__dirname, 'lib/img/icon.png'));
      }
      menuItem.checked = cfgobj.autotranslate;
      //menuItem.checked = false;
      //cfgobj.autotranslate = !cfgobj.autotranslate;
      tray.setContextMenu(contextMenu);
      console.log("是否自动翻译",cfgobj.autotranslate,menuItem.checked);
    },  label: '自动翻译', type: 'checkbox',checked: cfgobj.autotranslate},
    {click:(menuItem)=>{
      if (cfgobj.wininto || cfgobj.wininto==true) {
        cfgobj.wininto=false;
        if (mainWindow.getBounds().x<0) {
          mainWindow.setPosition(-5,0)
        }
      }else{
        cfgobj.wininto=true;
      }
      //menuItem.checked = !cfgobj.wininto;
      tray.setContextMenu(contextMenu);
      console.log("是否隐入",cfgobj.wininto,"menuItem.checked",menuItem.checked);
    },  label: '侧边吸附(左上角)', type: 'checkbox',checked: cfgobj.wininto},
    {click:(menuItem)=>{
      cfgobj.notification = !cfgobj.notification;
      menuItem.checked = cfgobj.notification;
      tray.setContextMenu(contextMenu);
      console.log("是否翻译通知",cfgobj.notification);
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
  mainWindow.webContents.on('did-finish-load', () => {  
    mainWindow.webContents.send('enginelist', cfgobj);
  });  

  clipboardWatcher({
    watchDelay: 1000,
    onTextChange: async function (text) { 
      console.log(text);
      let result = {};
      if (cfgobj.autotranslate) {
        const engine_type = cfgobj.curengine;
        const engine = cfgobj[engine_type];
        controller = new AbortController();
        result = await translate.translate(text,engine_type,engine,mainWindow,controller);
      } else {                          
        result = {"origintext":text,"resulttext":"自动翻译功能未开启，开启后才能监测剪切板并翻译哦。"};
        mainWindow.webContents.send('update-text', result);
      }
      //通知显示，可配置
      if (cfgobj.notification==true && (result.resulttext!='model-api-stream') ) {
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
      height: 400,
      icon: path.join(__dirname, 'lib/img/icon.png'),
      //x:0, //left top
      //y:0,
      //resizable:false,
      //alwaysOnTop:true,
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

//'关于'窗口
function createAboutWindow() {
  if (!aboutWindow || aboutWindow.isDestroyed()) {
    aboutWindow = new BrowserWindow({
      width: 400,
      height: 420,
      icon: path.join(__dirname, 'lib/img/icon.png'),
      //x:0, //left top
      //y:0,
      resizable:false,
      //alwaysOnTop:true,
      webPreferences: {
        preload: path.join(__dirname, 'preloadjs/about.js')
      }
    })
    aboutWindow.loadFile('html/about.html');
    
    //aboutWindow.webContents.openDevTools();
    //
    aboutWindow.webContents.on('did-finish-load', () => {  
      aboutWindow.webContents.send('app-version', app.getVersion());
    });
  }else{
    aboutWindow.focus();
    aboutWindow.show();
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
    ipcMain.on('change-engine', async function (event, engine) {
      console.log("ipcMain.on change-engine",engine);
      cfgobj.curengine = engine;
      //cfg.cfgsave(cfgobj);
      const type = engine;
      const engine_t = cfgobj[engine];
      //console.log('engine_t',type,engine_t);
      const mlist = await translate.modellist(type,engine_t,mainWindow_clone);
      //console.log(mlist);
      if (mlist.length > 0) {
        cfgobj[engine].model = mlist[0];
      }
      //console.log(cfgobj);
      cfg.cfgsave(cfgobj);
    });

    //监控模型变化并更新
    ipcMain.on('change-model', async function (event, model) {
      console.log("ipcMain.on change-model",model);
      let curengine = cfgobj.curengine;
      cfgobj[curengine].model = model;
      cfg.cfgsave(cfgobj);
    });

    ipcMain.on('mouse-act', function (event, act) {
      if (cfgobj.wininto) {
        let bound = mainWindow_clone.getBounds();
        let pos_x = bound.x;
        let pos_y = bound.y;
        let width = bound.width;
        let area_size = screen.getPrimaryDisplay().workAreaSize.width;
        //console.log(JSON.stringify(event));
        // console.log(act,"pos_x",pos_x,"pos_y",pos_y,"width",width,"area_size",area_size);
        // console.log(bound);
        // console.log(mainWindow_clone.getContentSize());
        // console.log(mainWindow_clone.getContentBounds());
        // console.log(mainWindow_clone.getSize())
  
        // //console.log(act);
        if (act=='mouseleave') {
          if (pos_x<0) {
            console.log("mouseleave setPosition")
            mainWindow_clone.setPosition(0-width+5,0)
          }
        }else if(act=='mouseenter'){
          if (pos_x<0) {
            console.log("mouseenter setPosition")
            mainWindow_clone.setPosition(-5,0)
          }
        }        
      }else{
        //console.log("无需隐入，当前状态：",cfgobj.wininto);
      }

    });

    //监控翻译按钮并反馈结果 已停用
    ipcMain.handle('translator', async (event,query) => {
      const engine_type = cfgobj.curengine;
      const engine = cfgobj[engine_type];
      const result = await translate.translate(query,engine_type,engine);
      return result;
    });
    //监控翻译按钮  为了兼容大模型的流式数据返回 translator->translatorV2
    ipcMain.on('translatorV2', async (event, query) => {
      //console.log("translatorV2");
      const engine_type = cfgobj.curengine;
      const engine = cfgobj[engine_type];
      controller = new AbortController();
      await translate.translate(query,engine_type,engine,mainWindow_clone,controller);
    });

    //打开引擎配置窗口
    ipcMain.handle('open-config', async (event) => {
      createConfigWindow();
    });
    //打开关于窗口
    ipcMain.on('open-about', async (event) => {
      createAboutWindow();
    });

    //停止翻译
    ipcMain.on('abort-translate', async (event) => {
      if (controller) controller.abort();
      console.log("abort-translate");
      let result = {"origintext":"","resulttext":"翻译已停止","done":true};
      mainWindow_clone.webContents.send('update-text', result);
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


