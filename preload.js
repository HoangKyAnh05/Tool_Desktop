const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Window control actions
    windowControl: (action) => ipcRenderer.send('window-control', action),
    
    // File/App management
    selectApp: () => ipcRenderer.invoke('select-app'),
    launchApp: (appPath) => ipcRenderer.invoke('launch-app', appPath),
    openExplorer: (folderPath) => ipcRenderer.invoke('open-explorer', folderPath),
    
    // Optimization / File Scanner
    selectFolderToScan: () => ipcRenderer.invoke('select-folder-to-scan'),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    startScan: (customPath) => ipcRenderer.send('start-scan', customPath),
    deleteFile: (filePath, permanently) => ipcRenderer.invoke('delete-file', filePath, permanently),
    cleanRAM: () => ipcRenderer.invoke('clean-ram'),
    getProcesses: () => ipcRenderer.invoke('get-processes'),
    endProcess: (pid) => ipcRenderer.invoke('end-process', pid),
    saveLayout: (stateData) => ipcRenderer.invoke('save-layout', stateData),
    loadLayout: () => ipcRenderer.invoke('load-layout'),
    switchDisplay: (mode) => ipcRenderer.invoke('switch-display', mode),
    getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),
    teleportMouseToScreen: (displayId, xPercent, yPercent) => ipcRenderer.invoke('teleport-mouse-to-screen', displayId, xPercent, yPercent),
    moveWindowToScreen: (displayId) => ipcRenderer.invoke('move-window-to-screen', displayId),
    setWindowFullscreen: (flag) => ipcRenderer.invoke('set-window-fullscreen', flag),
    registerSwapShortcuts: () => ipcRenderer.invoke('register-swap-shortcuts'),
    unregisterSwapShortcuts: () => ipcRenderer.invoke('unregister-swap-shortcuts'),
    onGlobalEscapePressed: (callback) => ipcRenderer.on('global-escape-pressed', () => callback()),
    onGlobalNumberPressed: (callback) => ipcRenderer.on('global-number-pressed', (event, num) => callback(num)),
    onGlobalArrowPressed: (callback) => ipcRenderer.on('global-arrow-pressed', (event, direction) => callback(direction)),
    teleportMouseLeftRight: (direction) => ipcRenderer.invoke('teleport-mouse-left-right', direction),
    onDisplayModeSwitchSuccess: (callback) => ipcRenderer.on('display-mode-switch-success', (event, mode) => callback(mode)),
    onDisplayModeSwitchError: (callback) => ipcRenderer.on('display-mode-switch-error', (event, mode, err) => callback(mode, err)),
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    restoreWindow: () => ipcRenderer.invoke('restore-window'),
    saveRecording: (filename, arrayBuffer) => ipcRenderer.invoke('save-recording', filename, arrayBuffer),
    getLatestRecording: (displayId) => ipcRenderer.invoke('get-latest-recording', displayId),
    readRecordingFile: (filePath) => ipcRenderer.invoke('read-recording-file', filePath),
    getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
    setWindowBounds: (bounds) => ipcRenderer.invoke('set-window-bounds', bounds),
    setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),
    setIgnoreMouseEvents: (ignore, options) => ipcRenderer.invoke('set-ignore-mouse-events', ignore, options),
    
    // Scan Listeners
    onScanProgress: (callback) => {
        ipcRenderer.on('scan-progress', (event, data) => callback(data));
    },
    onScanFileFound: (callback) => {
        ipcRenderer.on('scan-file-found', (event, data) => callback(data));
    },
    onScanComplete: (callback) => {
        ipcRenderer.on('scan-complete', (event, data) => callback(data));
    },
    onScanError: (callback) => {
        ipcRenderer.on('scan-error', (event, error) => callback(error));
    },
    removeScanListeners: () => {
        ipcRenderer.removeAllListeners('scan-progress');
        ipcRenderer.removeAllListeners('scan-file-found');
        ipcRenderer.removeAllListeners('scan-complete');
        ipcRenderer.removeAllListeners('scan-error');
    }
});
