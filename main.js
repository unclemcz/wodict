

const { app, Menu,clipboard,dialog, BrowserWindow,screen,desktopCapturer,Notification,Tray,ipcMain } = require('electron')
const clipboardWatcher = require('electron-clipboard-watcher')
const translate = require('./lib/engine/translate.js')
const ocr = require('./lib/engine/ocr.js')
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
    // 允许窗口移出屏幕边界
    skipTaskbar: false,
    enableLargerThanScreen: true,
        webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  console.log('screen',screen.getPrimaryDisplay().workAreaSize.width);
  mainWindow_clone = mainWindow;

  // 添加窗口移动事件监听
  mainWindow.on('moved', () => {
    const bounds = mainWindow.getBounds();
    const { x, y, width, height } = bounds;
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea;

    console.log(`[窗口移动] 新位置: (${x}, ${y}), 大小: ${width}x${height}`);

    // 检查是否窗口从边缘外移动到了屏幕内（用户手动拖拽）
    const wasOutside = x < -50 || x > screenWidth + 50 || y < -50 || y > screenHeight + 50;
    const isInside = x >= 0 && x <= screenWidth - width && y >= 0 && y <= screenHeight - height;

    
    // 检查是否接近边缘
    const nearLeft = x < 10;
    const nearRight = x + width > screenWidth - 10;
    const nearTop = y < 10;
    const nearBottom = y + height > screenHeight - 10;

    console.log(`[窗口移动] 边缘状态: 左=${nearLeft}, 右=${nearRight}, 上=${nearTop}, 下=${nearBottom}`);

    if (nearLeft || nearRight || nearTop || nearBottom) {
      console.log(`[窗口移动] 窗口已移动到屏幕边缘附近，侧边吸附功能已激活`);
    }
  });

  // 添加鼠标点击事件监听
  mainWindow.on('focus', () => {
    console.log(`[窗口事件] 窗口获得焦点 (鼠标点击)`);
  });

  mainWindow.on('blur', () => {
    console.log(`[窗口事件] 窗口失去焦点`);
  });

  mainWindow.on('close', (event) => {
    console.log(`[窗口事件] 窗口关闭事件被触发`);
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

function createSelectionWindow() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = displays.find(d => d.bounds.x === 0 && d.bounds.y === 0);

  const { width, height } = primaryDisplay.size;

  const selectionWindow = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preloadjs', 'preload-selection.js'),
      contextIsolation: true,
      //sandbox: true,
    },
  });

  selectionWindow.loadFile('html/selection.html');
  //selectionWindow.webContents.openDevTools();

  return selectionWindow;
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

    //监控OCR变化并更新
    ipcMain.on('change-ocr', async function (event, ocr) {
      console.log("ipcMain.on change-ocr",ocr);
      cfgobj.curocr = ocr;
      cfg.cfgsave(cfgobj);
    });

    //监控模型变化并更新
    ipcMain.on('change-model', async function (event, model) {
      console.log("ipcMain.on change-model",model);
      let curengine = cfgobj.curengine;
      cfgobj[curengine].model = model;
      cfg.cfgsave(cfgobj);
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

    // 截图功能   处理获取屏幕源的请求
    ipcMain.handle('get-sources', async () => {
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      return sources.map((source) => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
      }));
    });

    // 注册 IPC 监听器以打开选区窗口
    ipcMain.on('open-selection-window', () => {
      createSelectionWindow(); // 调用创建全屏选区窗口的函数
    });


    ipcMain.on('selection-complete', async (event, { x, y, width, height }) => {
        const fs = require('fs');
        const path = require('path');
        console.log(`截图区域: (x:${x}, y:${y}, width:${width}, height:${height})`);
        if (width <= 0 || height <= 0) {
            console.warn('无效的截图区域');
            return;
        }

        const displays = screen.getAllDisplays();

        // 查找当前点击所在的显示器
        const display = displays.find(d =>
            x >= d.bounds.x &&
            y >= d.bounds.y &&
            x < d.bounds.x + d.bounds.width &&
            y < d.bounds.y + d.bounds.height
        );

        if (!display) {
            console.error('无法找到截图所在的屏幕');
            return;
        }

        console.log(`当前点击所在的显示器为：${display.id}`);
        console.log(`显示器 bounds:`, display.bounds);

        const sources = await desktopCapturer.getSources({ types: ['screen'],thumbnailSize:{ width: display.bounds.width, height: display.bounds.height } });

        // 尝试匹配显示器源
        const selectedSource = sources[0];

        if (!selectedSource) {
            console.error('未找到匹配的显示器源，请检查 source.name 是否符合格式或尝试其他显示器');
            return;
        }

        // 获取完整屏幕截图的图像数据
        const screenImage = selectedSource.thumbnail;

        // 裁剪指定区域
        const croppedImage = screenImage.crop({
            x,
            y,
            width,
            height
        });

        // 保存路径改为项目目录下的 ./tmp/
        const tmpDir = path.join(__dirname, 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir);
        }

        //const tmpPath64 = path.join(tmpDir, `screenshot-${Date.now()}.txt`);
        //将croppedImage保存为base64
        //console.log(tmpPath64);
        //fs.writeFileSync(tmpPath64, croppedImage.toDataURL());
        let curocr = cfgobj.curocr;
        console.log('curocr',curocr);
        try{
          ocrtext = await ocr.ocr(croppedImage.toDataURL(),curocr,cfgobj[curocr],mainWindow_clone);
          //将ocrtext拷贝到剪贴板，触发翻译动作
          clipboard.writeText(ocrtext);
        }catch(e){
          dialog.showErrorBox('OCR抛出错误', e.message);
        }
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


