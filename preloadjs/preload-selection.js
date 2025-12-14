// preload-selection.js

const { contextBridge, ipcRenderer } = require('electron');

// 定义允许的 IPC 通道白名单
const allowedChannels = {
    send: ['selection-complete'],
    receive: ['selection-cancel'] // 预留给可能的取消功能
};

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        if (allowedChannels.send.includes(channel)) {
            ipcRenderer.send(channel, data);
        } else {
            console.warn(`Attempted to send to disallowed channel: ${channel}`);
            throw new Error(`IPC channel "${channel}" is not allowed`);
        }
    },
    on: (channel, func) => {
        if (allowedChannels.receive.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        } else {
            console.warn(`Attempted to listen to disallowed channel: ${channel}`);
            throw new Error(`IPC channel "${channel}" is not allowed for listening`);
        }
    },
    once: (channel, func) => {
        if (allowedChannels.receive.includes(channel)) {
            ipcRenderer.once(channel, (event, ...args) => func(...args));
        } else {
            console.warn(`Attempted to listen to disallowed channel: ${channel}`);
            throw new Error(`IPC channel "${channel}" is not allowed for listening`);
        }
    }
});