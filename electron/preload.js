const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    generateSchedule: (data) => ipcRenderer.invoke('generate-schedule', data),
    dataAPI: (args) => ipcRenderer.invoke('data-op', args)
});
