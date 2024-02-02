
const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    onVersion: (callback) => ipcRenderer.on('app-version', (_event, value) => callback(value))
})
  