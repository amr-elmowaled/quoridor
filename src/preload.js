// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('API', {
  showInfobox: (title, message) => ipcRenderer.invoke('show-infobox', { title, message })
});