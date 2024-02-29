/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateText: (callback) => ipcRenderer.on('update-text', (_event, value) => callback(value)),
  onEngineList: (callback) => ipcRenderer.on('enginelist', (_event, value) => callback(value)),
  changeEngine: (engine) => ipcRenderer.send('change-engine', engine),
  onTranslator: (query) => ipcRenderer.invoke('translator',query),//双向  已停用
  onTranslatorV2: (query) => ipcRenderer.send('translatorV2',query),//渲染进程->主进程  替代translator
  onConfig:()=>ipcRenderer.invoke('open-config'),
  onAbout:()=>ipcRenderer.send('open-about'),
  onMouseAct: (mouse_event) => ipcRenderer.send('mouse-act', mouse_event),
})


