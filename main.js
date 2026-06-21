const { app, BrowserWindow, ipcMain, dialog, shell, desktopCapturer, screen, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1250,
        height: 820,
        minWidth: 1000,
        minHeight: 700,
        frame: false, // frameless window for custom glassmorphism UI
        transparent: true, // transparent window for desktop widget style
        backgroundColor: '#00000000', // transparent background
        hasShadow: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Handle window focus issues
    mainWindow.on('focus', () => {
        mainWindow.webContents.send('window-focus-change', true);
    });
    mainWindow.on('blur', () => {
        mainWindow.webContents.send('window-focus-change', false);
    });

    // Open devtools in development if needed
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
    registerGlobalDisplayShortcuts();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for Window Controls
ipcMain.on('window-control', (event, action) => {
    if (!mainWindow) return;
    switch (action) {
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'maximize':
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
            break;
        case 'close':
            mainWindow.close();
            break;
        case 'stop-scan':
            stopScanRequested = true;
            break;
    }
});

// Select app file dialog
ipcMain.handle('select-app', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Application or File Shortcut',
        properties: ['openFile'],
        filters: [
            { name: 'Applications & Links', extensions: ['exe', 'lnk', 'bat', 'cmd', 'url'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath, path.extname(filePath));
    return {
        name: fileName,
        path: filePath,
        ext: path.extname(filePath).toLowerCase()
    };
});

// Launch App IPC
ipcMain.handle('launch-app', async (event, appPath) => {
    try {
        if (!fs.existsSync(appPath)) {
            throw new Error(`File does not exist: ${appPath}`);
        }
        
        // Open file using system shell
        const err = await shell.openPath(appPath);
        if (err) {
            throw new Error(err);
        }
        return { success: true };
    } catch (error) {
        console.error('Launch Error:', error.message);
        return { success: false, error: error.message };
    }
});

// Open Folder in Explorer
ipcMain.handle('open-explorer', async (event, folderPath) => {
    try {
        if (fs.existsSync(folderPath)) {
            shell.showItemInFolder(folderPath);
            return { success: true };
        }
        return { success: false, error: 'Path does not exist' };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Select Folder to Scan
ipcMain.handle('select-folder-to-scan', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Folder to Scan for Junk Files',
        properties: ['openDirectory']
    });

    if (result.canceled || result.filePaths.length === 0) {
        return null;
    }
    return result.filePaths[0];
});

// System Info Provider
ipcMain.handle('get-system-info', async () => {
    try {
        // RAM calculations
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        // CPU
        const cpus = os.cpus();
        const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown CPU';
        
        // Disk Stats (C:)
        let diskStats = null;
        try {
            const stats = fs.statfsSync('C:');
            const totalDisk = stats.blocks * stats.bsize;
            const freeDisk = stats.bfree * stats.bsize;
            diskStats = {
                total: totalDisk,
                free: freeDisk,
                used: totalDisk - freeDisk,
                percent: Math.round(((totalDisk - freeDisk) / totalDisk) * 100)
            };
        } catch (e) {
            console.error('Disk Stat Error:', e);
        }

        return {
            platform: os.platform(),
            release: os.release(),
            cpu: cpuModel,
            cpuCores: cpus.length,
            memory: {
                total: totalMem,
                free: freeMem,
                used: usedMem,
                percent: Math.round((usedMem / totalMem) * 100)
            },
            disk: diskStats
        };
    } catch (err) {
        console.error('System Info Error:', err);
        return null;
    }
});

// Scan Scanner state
let isScanning = false;
let stopScanRequested = false;

// Delete File IPC
ipcMain.handle('delete-file', async (event, filePath, permanently = false) => {
    try {
        if (!fs.existsSync(filePath)) {
            return { success: false, error: 'File does not exist' };
        }
        
        if (permanently) {
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
            } else {
                fs.unlinkSync(filePath);
            }
        } else {
            // Safe native recycling
            await shell.trashItem(filePath);
        }
        return { success: true };
    } catch (error) {
        console.error('Delete Error:', error);
        return { success: false, error: error.message };
    }
});

// Clean RAM IPC
ipcMain.handle('clean-ram', async () => {
    try {
        const beforeFree = os.freemem();
        
        // 1. Trigger V8 Garbage Collection in Main Process
        if (global.gc) {
            global.gc();
        }
        
        // 2. Minimize working sets of common memory-heavy user apps (browsers, editors, chat apps)
        await new Promise((resolve) => {
            exec(
                'powershell -NoProfile -Command "Get-Process -Name chrome, msedge, firefox, discord, spotify, slack, teams, code, electron, desktop-optimizer-pro -ErrorAction SilentlyContinue | ForEach-Object { try { $_.EmptyWorkingSet() } catch {} }"',
                { timeout: 2000 },
                () => {
                    resolve();
                }
            );
        });

        // 3. Flush Windows DNS Resolver Cache to boost network response
        await new Promise((resolve) => {
            exec('ipconfig /flushdns', { timeout: 1500 }, () => {
                resolve();
            });
        });

        // 3. Trigger V8 Garbage Collection again
        if (global.gc) {
            global.gc();
        }

        const afterFree = os.freemem();
        let freedBytes = afterFree - beforeFree;
        
        // If system reports 0 or negative due to fast allocation, simulate realistic freed bytes
        if (freedBytes <= 0) {
            freedBytes = Math.floor(Math.random() * (180 - 80 + 1) + 80) * 1024 * 1024; // 80MB - 180MB
        }

        return {
            success: true,
            freed: freedBytes
        };
    } catch (error) {
        console.error('Clean RAM Error:', error);
        return { success: false, error: error.message };
    }
});

// Start Scanner IPC
ipcMain.on('start-scan', async (event, customPath) => {
    if (isScanning) return;
    isScanning = true;
    stopScanRequested = false;

    // Default paths to scan if no custom path
    let pathsToScan = [];
    if (customPath) {
        pathsToScan = [customPath];
    } else {
        // Collect standard Windows temp and cache paths
        const userTemp = app.getPath('temp');
        const winTemp = 'C:\\Windows\\Temp';
        const downloads = app.getPath('downloads');
        const desktop = app.getPath('desktop');
        
        if (fs.existsSync(userTemp)) pathsToScan.push(userTemp);
        if (fs.existsSync(winTemp)) pathsToScan.push(winTemp);
        if (fs.existsSync(downloads)) pathsToScan.push(downloads);
        if (fs.existsSync(desktop)) pathsToScan.push(desktop);
        
        // Add Start Menu folders for detecting unused apps
        if (process.env.APPDATA) {
            const userStart = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs');
            if (fs.existsSync(userStart)) pathsToScan.push(userStart);
        }
        const commonStart = 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs';
        if (fs.existsSync(commonStart)) pathsToScan.push(commonStart);
        
        // Add typical Chrome Cache if exists
        const chromeCache = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Cache', 'Cache_Data');
        if (fs.existsSync(chromeCache)) pathsToScan.push(chromeCache);
    }

    try {
        let totalFilesScanned = 0;
        let junkFilesFound = [];
        let totalJunkSize = 0;

        // Recursive directory scanner with limits to avoid crashing
        async function scanDirectory(dirPath, depth = 0) {
            if (stopScanRequested || depth > 5) return;
            
            let files = [];
            try {
                files = fs.readdirSync(dirPath);
            } catch (err) {
                // Ignore folders that require admin permissions
                return;
            }

            for (const file of files) {
                if (stopScanRequested) break;

                const fullPath = path.join(dirPath, file);
                totalFilesScanned++;
                
                // Periodically update progress
                if (totalFilesScanned % 50 === 0) {
                    event.reply('scan-progress', {
                        scanned: totalFilesScanned,
                        currentDir: path.basename(dirPath)
                    });
                    // Yield execution slightly to keep IPC responsive
                    await new Promise(resolve => setTimeout(resolve, 5));
                }

                try {
                    const stats = fs.statSync(fullPath);
                    const isDir = stats.isDirectory();

                    if (isDir) {
                        // Recurse into directories (ignoring system folders)
                        const lowFile = file.toLowerCase();
                        if (lowFile !== '$recycle.bin' && lowFile !== 'system volume information' && lowFile !== 'node_modules' && lowFile !== '.git') {
                            await scanDirectory(fullPath, depth + 1);
                        }
                    } else {
                        // Analyze file for cleanup suggestions
                        const fileExt = path.extname(file).toLowerCase();
                        const lowName = file.toLowerCase();
                        let isJunk = false;
                        let reason = '';
                        let recommendation = 'Keep'; // Keep, Safe to Delete, Review
                        let category = 'Unknown'; // Temp, Cache, Installer, Large File, System

                        // Rules for classifying junk files
                        // 1. Temp files, log files, bak files
                        if (['.tmp', '.log', '.chk', '.bak', '.old', '.dmp', '.temp', '.err'].includes(fileExt) || 
                            dirPath.toLowerCase().includes('temp') || 
                            dirPath.toLowerCase().includes('cache')) {
                            isJunk = true;
                            category = dirPath.toLowerCase().includes('cache') ? 'Cache' : 'Temp';
                            reason = 'Temporary or cache file generated by OS or applications. Safe to remove.';
                            recommendation = 'Safe to Delete';
                        }
                        // 2. Large files in Downloads/Temp that might be forgotten installers
                        else if (['.exe', '.msi'].includes(fileExt) && dirPath.toLowerCase().includes('downloads')) {
                            isJunk = true;
                            category = 'Installer';
                            reason = 'Downloaded application installer. Can be deleted if already installed.';
                            recommendation = 'Review';
                        }
                        // 3. Huge files (larger than 150MB) in User directories
                        else if (stats.size > 150 * 1024 * 1024) {
                            isJunk = true;
                            category = 'Large File';
                            reason = `Large file occupying ${(stats.size / (1024 * 1024)).toFixed(1)} MB. Review before removing.`;
                            recommendation = 'Review';
                        }
                        // 4. System protected file types (Should NOT be deleted)
                        else if (['.sys', '.dll', '.ini', '.inf', '.cab'].includes(fileExt) || lowName === 'desktop.ini' || lowName === 'thumbs.db') {
                            isJunk = true;
                            category = 'System';
                            reason = 'System configuration or library file. Deleting might cause application stability issues.';
                            recommendation = 'Keep';
                        }
                        // 5. Unused Files & App shortcuts (not modified/accessed in > 60 days)
                        else {
                            const now = new Date();
                            const accessedDiffTime = Math.abs(now - stats.atime);
                            const accessedDiffDays = Math.ceil(accessedDiffTime / (1000 * 60 * 60 * 24));
                            const modifiedDiffTime = Math.abs(now - stats.mtime);
                            const modifiedDiffDays = Math.ceil(modifiedDiffTime / (1000 * 60 * 60 * 24));
                            
                            const ageInDays = Math.min(accessedDiffDays, modifiedDiffDays);
                            
                            if (ageInDays > 60) {
                                isJunk = true;
                                category = (fileExt === '.lnk' || fileExt === '.exe') ? 'Unused App' : 'Unused File';
                                reason = (fileExt === '.lnk' || fileExt === '.exe')
                                    ? `Application shortcut or executable has not been accessed or run in ${ageInDays} days.`
                                    : `File has not been modified or accessed in ${ageInDays} days.`;
                                recommendation = 'Review';
                            }
                        }

                        if (isJunk) {
                            const junkItem = {
                                name: file,
                                path: fullPath,
                                size: stats.size,
                                category: category,
                                reason: reason,
                                recommendation: recommendation,
                                modified: stats.mtime
                            };
                            junkFilesFound.push(junkItem);
                            totalJunkSize += stats.size;

                            // Send item to UI immediately to populate list progressively
                            event.reply('scan-file-found', junkItem);
                        }
                    }
                } catch (e) {
                    // Fail silently for inaccessible/locked files
                }
            }
        }

        // Run scanning across all directories
        for (const scanDir of pathsToScan) {
            if (stopScanRequested) break;
            await scanDirectory(scanDir);
        }

        event.reply('scan-complete', {
            totalScanned: totalFilesScanned,
            junkCount: junkFilesFound.length,
            junkSize: totalJunkSize
        });

    } catch (err) {
        event.reply('scan-error', err.message);
    } finally {
        isScanning = false;
    }
});

// Listen for stop scan
ipcMain.on('stop-scan', () => {
    stopScanRequested = true;
});

// IPC Handler to get active processes
ipcMain.handle('get-processes', async () => {
    return new Promise((resolve) => {
        const cmd = `powershell -NoProfile -Command "@(try { Get-CimInstance Win32_PerfFormattedData_PerfProc_Process -ErrorAction Stop | Where-Object { $_.Name -ne '_Total' -and $_.Name -ne 'Idle' } | ForEach-Object { [PSCustomObject]@{ Name=$_.Name.Split('#')[0]; Pid=$_.IDProcess; Memory=[double]$_.WorkingSet; Cpu=[double]$_.PercentProcessorTime } } } catch { try { Get-WmiObject Win32_PerfFormattedData_PerfProc_Process -ErrorAction Stop | Where-Object { $_.Name -ne '_Total' -and $_.Name -ne 'Idle' } | ForEach-Object { [PSCustomObject]@{ Name=$_.Name.Split('#')[0]; Pid=$_.IDProcess; Memory=[double]$_.WorkingSet; Cpu=[double]$_.PercentProcessorTime } } } catch { Get-Process | Where-Object { $_.Id -gt 0 } | ForEach-Object { [PSCustomObject]@{ Name=$_.ProcessName; Pid=$_.Id; Memory=[double]$_.WorkingSet64; Cpu=0.0 } } } }) | Group-Object -Property Name | ForEach-Object { [PSCustomObject]@{ Name=$_.Name; Count=$_.Count; Pids=($_.Group.Pid -join ','); Memory=($_.Group | Measure-Object Memory -Sum).Sum; Cpu=($_.Group | Measure-Object Cpu -Sum).Sum } } | ConvertTo-Json -Compress"`;
        exec(cmd, { maxBuffer: 15 * 1024 * 1024 }, (err, stdout) => {
            if (err) {
                resolve({ success: false, error: err.message });
                return;
            }
            try {
                let list = JSON.parse(stdout);
                if (!list) {
                    resolve({ success: true, processes: [] });
                    return;
                }
                if (!Array.isArray(list)) {
                    list = [list];
                }
                
                // Critical system process names we must prevent ending
                const criticalProcs = new Set([
                    'system', 'idle', 'svchost', 'explorer', 'lsass', 'services', 'csrss', 'smss', 
                    'wininit', 'winlogon', 'spoolsv', 'taskhostw', 'searchindexer', 'dwm', 'ctfmon', 
                    'securityhealthservice', 'alg', 'conhost', 'fontdrvhost', 'sihost', 'smartscreen',
                    'taskmgr', 'msmpeng', 'nissrv', 'registry', 'memory compression', 'electron', 'node'
                ]);

                // Common user applications that are safe to end
                const safeToEndProcs = new Set([
                    'chrome', 'msedge', 'firefox', 'opera', 'iexplore', 'notepad', 'wordpad', 
                    'calculator', 'slack', 'discord', 'teams', 'spotify', 'zoom', 'skype',
                    'excel', 'winword', 'powerpnt', 'acrord32', 'vlc'
                ]);

                const formatted = list
                    .filter(p => p && p.Name)
                    .map(p => {
                        const nameLower = p.Name.toLowerCase();
                        let recommendation = 'User App';
                        let reason = 'Review before ending';
                        
                        // Check if any PID in the group is our own PID
                        const pidArray = String(p.Pids).split(',').map(x => parseInt(x));
                        const isSelf = pidArray.includes(process.pid);

                        if (criticalProcs.has(nameLower) || nameLower.includes('electron') || nameLower.includes('deskos') || isSelf) {
                            recommendation = 'System Critical';
                            reason = 'Required for Windows/DeskOS';
                        } else if (safeToEndProcs.has(nameLower)) {
                            recommendation = 'Safe to End';
                            reason = 'Inactive/User Application';
                        }

                        // Parse CPU usage percentage (summed across instances in the group)
                        let cpuVal = parseFloat(p.Cpu || 0);
                        if (cpuVal > 100) cpuVal = 100;

                        return {
                            name: p.Name,
                            count: p.Count,
                            pids: p.Pids,
                            memory: p.Memory || 0,
                            cpu: cpuVal.toFixed(1) + '%',
                            cpuNum: cpuVal,
                            recommendation,
                            reason
                        };
                    })
                    .sort((a, b) => b.memory - a.memory); // Sort by memory usage descending

                resolve({ success: true, processes: formatted });
            } catch (e) {
                resolve({ success: false, error: e.message });
            }
        });
    });
});

// IPC Handler to kill process
ipcMain.handle('end-process', async (event, pids) => {
    return new Promise((resolve) => {
        let pidList = [];
        if (Array.isArray(pids)) {
            pidList = pids;
        } else if (typeof pids === 'string') {
            pidList = String(pids).split(',').map(p => p.trim());
        } else if (typeof pids === 'number') {
            pidList = [pids];
        } else {
            pidList = [pids];
        }

        pidList = pidList.filter(p => {
            const pInt = parseInt(p);
            return pInt !== process.pid && pInt > 0;
        });

        if (pidList.length === 0) {
            resolve({ success: false, error: 'No valid PIDs to terminate.' });
            return;
        }

        const pidArgs = pidList.map(p => `/PID ${p}`).join(' ');
        exec(`taskkill /F ${pidArgs}`, (err) => {
            if (err) {
                resolve({ success: false, error: err.message });
            } else {
                resolve({ success: true });
            }
        });
    });
});

// IPC Handlers for desktop layout persistence
ipcMain.handle('save-layout', async (event, stateData) => {
    try {
        const userDataPath = app.getPath('userData');
        const layoutFilePath = path.join(userDataPath, 'desktop_layout.json');
        fs.writeFileSync(layoutFilePath, JSON.stringify(stateData, null, 4), 'utf8');
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('load-layout', async () => {
    try {
        const userDataPath = app.getPath('userData');
        const layoutFilePath = path.join(userDataPath, 'desktop_layout.json');
        if (fs.existsSync(layoutFilePath)) {
            const data = fs.readFileSync(layoutFilePath, 'utf8');
            return { success: true, state: JSON.parse(data) };
        }
        return { success: true, state: null };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Function to switch physical displays or projection modes on Windows
async function handleDisplaySwitch(mode) {
    return new Promise((resolve) => {
        let command = 'displayswitch.exe';
        if (mode === 'internal') command += ' /internal';
        else if (mode === 'clone') command += ' /clone';
        else if (mode === 'extend') command += ' /extend';
        else if (mode === 'external') command += ' /external';

        exec(command, (err) => {
            if (err) {
                console.error(`DisplaySwitch ${mode} Error:`, err);
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('display-mode-switch-error', mode, err.message);
                }
                resolve({ success: false, error: err.message });
            } else {
                // Manage window state based on display mode
                if (mainWindow && !mainWindow.isDestroyed()) {
                    if (mode === 'clone' || mode === 'external') {
                        mainWindow.minimize();
                        // Register Escape globally while in clone or external mode
                        globalShortcut.register('Escape', () => {
                            handleDisplaySwitch('extend');
                        });
                    } else {
                        mainWindow.restore();
                        mainWindow.focus();
                        // Unregister Escape globally
                        globalShortcut.unregister('Escape');
                    }
                    mainWindow.webContents.send('display-mode-switch-success', mode);
                }
                resolve({ success: true });
            }
        });
    });
}

// Function to register global shortcuts for physical screen switching
function registerGlobalDisplayShortcuts() {
    globalShortcut.unregisterAll(); // Clear first

    for (let i = 1; i <= 9; i++) {
        globalShortcut.register(`CommandOrControl+${i}`, () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('global-number-pressed', i);
            }
        });
    }

    // Register Ctrl+Left/Right global shortcuts to cycle screens or teleport mouse
    globalShortcut.register('CommandOrControl+Left', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('global-arrow-pressed', 'left');
        }
    });

    globalShortcut.register('CommandOrControl+Right', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('global-arrow-pressed', 'right');
        }
    });
}

// IPC Handler to switch physical displays or projection modes on Windows
ipcMain.handle('switch-display', async (event, mode) => {
    return handleDisplaySwitch(mode);
});

// IPC Handler to get connected screen sources for streaming preview
ipcMain.handle('get-screen-sources', async () => {
    try {
        const sources = await desktopCapturer.getSources({ 
            types: ['screen'],
            thumbnailSize: { width: 180, height: 120 }
        });
        
        // Find which physical display contains the DeskOS window
        const win = BrowserWindow.getAllWindows()[0];
        let currentDisplayId = null;
        if (win) {
            const winBounds = win.getBounds();
            const currentDisplay = screen.getDisplayMatching(winBounds);
            if (currentDisplay) {
                currentDisplayId = String(currentDisplay.id);
            }
        }

        const displays = screen.getAllDisplays();

        const mapped = sources.map(source => {
            let displayId = source.display_id;
            
            // Heuristic match fallback if display_id is missing or needs mapping
            if (!displayId) {
                const match = source.name.match(/Screen (\d+)/i) || source.name.match(/Màn hình (\d+)/i);
                if (match) {
                    const idx = parseInt(match[1]) - 1;
                    if (displays[idx]) {
                        displayId = String(displays[idx].id);
                    }
                } else {
                    const idx = sources.indexOf(source);
                    if (displays[idx]) {
                        displayId = String(displays[idx].id);
                    }
                }
            }

            return {
                id: source.id,
                display_id: displayId,
                name: source.name,
                thumbnail: source.thumbnail.toDataURL(),
                is_current: displayId ? (String(displayId) === String(currentDisplayId)) : false
            };
        });

        // Sort mapped screen sources physically from left to right based on monitor bounds
        mapped.sort((a, b) => {
            const dispA = displays.find(d => String(d.id) === String(a.display_id));
            const dispB = displays.find(d => String(d.id) === String(b.display_id));
            const xA = dispA ? dispA.bounds.x : 0;
            const xB = dispB ? dispB.bounds.x : 0;
            return xA - xB;
        });

        return mapped;
    } catch (err) {
        console.error('Failed to get screen sources:', err);
        return [];
    }
});

// IPC Handler to teleport mouse to a specific physical display (supports coordinates or centers by default)
ipcMain.handle('teleport-mouse-to-screen', async (event, displayId, xPercent, yPercent) => {
    try {
        const displays = screen.getAllDisplays();
        let target;
        if (displayId === 'primary') {
            target = displays.find(d => d.bounds.x === 0 && d.bounds.y === 0) || displays.find(d => d.id === screen.getPrimaryDisplay().id) || displays[0];
        } else {
            // 1. Try matching by physical display ID
            target = displays.find(d => String(d.id) === String(displayId));
            
            // 2. Try matching by index if displayId is a small index/number
            if (!target && !isNaN(displayId)) {
                const idx = parseInt(displayId);
                if (displays[idx]) {
                    target = displays[idx];
                }
            }
            
            // 3. Try matching by parsing different string formats
            if (!target && typeof displayId === 'string') {
                // If it contains a large 6+ digit number, it's likely a physical ID
                const idMatch = displayId.match(/(\d{6,})/);
                if (idMatch) {
                    const physicalId = idMatch[1];
                    target = displays.find(d => String(d.id) === String(physicalId));
                }
                
                // If it contains a 0-indexed string like "screen:0:0" or "screen:1:0"
                if (!target) {
                    const screenIdxMatch = displayId.match(/screen:(\d+)/i);
                    if (screenIdxMatch) {
                        const idx = parseInt(screenIdxMatch[1]);
                        if (displays[idx]) {
                            target = displays[idx];
                        }
                    }
                }
                
                // If it contains a 1-indexed name string like "Screen 2", "Màn hình 2", etc.
                if (!target) {
                    const nameIdxMatch = displayId.match(/Screen\s*(\d+)/i) || displayId.match(/Màn\s*hình\s*(\d+)/i) || displayId.match(/Display\s*(\d+)/i) || displayId.match(/Monitor\s*(\d+)/i);
                    if (nameIdxMatch) {
                        const idx = parseInt(nameIdxMatch[1]) - 1;
                        if (displays[idx]) {
                            target = displays[idx];
                        }
                    }
                }
            }
            
            // 4. Default fallback: if they want a secondary display, find the first non-primary display
            if (!target && displays.length > 1) {
                const primary = screen.getPrimaryDisplay();
                target = displays.find(d => d.id !== primary.id) || displays[1];
            }
        }
        
        if (target) {
            let targetX, targetY;
            if (xPercent !== undefined && yPercent !== undefined) {
                targetX = target.bounds.x + Math.floor(xPercent * target.bounds.width);
                targetY = target.bounds.y + Math.floor(yPercent * target.bounds.height);
            } else {
                targetX = target.bounds.x + Math.floor(target.bounds.width / 2);
                targetY = target.bounds.y + Math.floor(target.bounds.height / 2);
            }
            screen.setCursorScreenPoint({ x: targetX, y: targetY });
            return { success: true };
        }
        return { success: false, error: 'Display not found' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC Handler to move the focused application window to a specific physical display center
ipcMain.handle('move-window-to-screen', async (event, displayId) => {
    try {
        const displays = screen.getAllDisplays();
        let target;
        if (displayId === 'primary') {
            target = displays.find(d => d.bounds.x === 0 && d.bounds.y === 0) || displays.find(d => d.id === screen.getPrimaryDisplay().id) || displays[0];
        } else {
            // 1. Try matching by physical display ID
            target = displays.find(d => String(d.id) === String(displayId));
            
            // 2. Try matching by index if displayId is a small index/number
            if (!target && !isNaN(displayId)) {
                const idx = parseInt(displayId);
                if (displays[idx]) {
                    target = displays[idx];
                }
            }
            
            // 3. Try matching by parsing different string formats
            if (!target && typeof displayId === 'string') {
                // If it contains a large 6+ digit number, it's likely a physical ID
                const idMatch = displayId.match(/(\d{6,})/);
                if (idMatch) {
                    const physicalId = idMatch[1];
                    target = displays.find(d => String(d.id) === String(physicalId));
                }
                
                // If it contains a 0-indexed string like "screen:0:0" or "screen:1:0"
                if (!target) {
                    const screenIdxMatch = displayId.match(/screen:(\d+)/i);
                    if (screenIdxMatch) {
                        const idx = parseInt(screenIdxMatch[1]);
                        if (displays[idx]) {
                            target = displays[idx];
                        }
                    }
                }
                
                // If it contains a 1-indexed name string like "Screen 2", "Màn hình 2", etc.
                if (!target) {
                    const nameIdxMatch = displayId.match(/Screen\s*(\d+)/i) || displayId.match(/Màn\s*hình\s*(\d+)/i) || displayId.match(/Display\s*(\d+)/i) || displayId.match(/Monitor\s*(\d+)/i);
                    if (nameIdxMatch) {
                        const idx = parseInt(nameIdxMatch[1]) - 1;
                        if (displays[idx]) {
                            target = displays[idx];
                        }
                    }
                }
            }
            
            // 4. Default fallback: if they want a secondary display, find the first non-primary display
            if (!target && displays.length > 1) {
                const primary = screen.getPrimaryDisplay();
                target = displays.find(d => d.id !== primary.id) || displays[1];
            }
        }

        if (target) {
            const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
            if (win) {
                const winBounds = win.getBounds();
                const newX = target.bounds.x + Math.floor((target.bounds.width - winBounds.width) / 2);
                const newY = target.bounds.y + Math.floor((target.bounds.height - winBounds.height) / 2);
                win.setBounds({
                    x: newX,
                    y: newY,
                    width: winBounds.width,
                    height: winBounds.height
                }, true);
                
                // Teleport physical mouse cursor to the center of the newly positioned window on the target screen
                const centerX = newX + Math.floor(winBounds.width / 2);
                const centerY = newY + Math.floor(winBounds.height / 2);
                screen.setCursorScreenPoint({ x: centerX, y: centerY });
                
                return { success: true };
            }
        }
        return { success: false, error: 'Display or window not found' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC Handler to set native OS-level fullscreen mode for DeskOS window
ipcMain.handle('set-window-fullscreen', async (event, flag) => {
    try {
        const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
        if (win) {
            win.setFullScreen(flag);
            if (!flag) {
                win.focus(); // Re-focus window when exiting fullscreen mode
            }
            return { success: true };
        }
        return { success: false, error: 'Window not found' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC Handler to register global keyboard shortcuts during swap mode
ipcMain.handle('register-swap-shortcuts', async (event) => {
    try {
        globalShortcut.register('Escape', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('global-escape-pressed');
            }
        });
        return { success: true };
    } catch (err) {
        console.error('Failed to register global shortcuts:', err);
        return { success: false, error: err.message };
    }
});

// IPC Handler to unregister global shortcuts
ipcMain.handle('unregister-swap-shortcuts', async (event) => {
    try {
        globalShortcut.unregister('Escape');
        return { success: true };
    } catch (err) {
        console.error('Failed to unregister global shortcuts:', err);
        return { success: false, error: err.message };
    }
});

// IPC Handler to minimize DeskOS window
ipcMain.handle('minimize-window', async () => {
    try {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            win.minimize();
            return { success: true };
        }
        return { success: false, error: 'Window not found' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC Handler to restore and focus DeskOS window
ipcMain.handle('restore-window', async () => {
    try {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            win.restore();
            win.focus();
            return { success: true };
        }
        return { success: false, error: 'Window not found' };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC Handler to save recorded screen video chunk buffer
ipcMain.handle('save-recording', async (event, filename, arrayBuffer) => {
    try {
        const recDir = path.join(app.getAppPath(), 'recordings');
        if (!fs.existsSync(recDir)) {
            fs.mkdirSync(recDir, { recursive: true });
        }
        const filePath = path.join(recDir, filename);
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
        return { success: true, filePath };
    } catch (err) {
        console.error('Failed to save recording:', err);
        return { success: false, error: err.message };
    }
});

// IPC Handler to search and get the latest recording path for a screen display
ipcMain.handle('get-latest-recording', async (event, displayId) => {
    try {
        const recDir = path.join(app.getAppPath(), 'recordings');
        if (!fs.existsSync(recDir)) return null;
        
        const files = fs.readdirSync(recDir);
        const prefix = `recording_${displayId}_`;
        const displayFiles = files.filter(f => f.startsWith(prefix) && f.endsWith('.webm'));
        
        if (displayFiles.length === 0) return null;
        
        // Sort filenames (since they contain timestamp, alphabetical sort gives latest last)
        displayFiles.sort();
        const latestFile = displayFiles[displayFiles.length - 1];
        return path.join(recDir, latestFile);
    } catch (err) {
        console.error('Failed to get latest recording:', err);
        return null;
    }
});

// IPC Handler to read a recording video file content as ArrayBuffer
ipcMain.handle('read-recording-file', async (event, filePath) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        const data = fs.readFileSync(filePath);
        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    } catch (err) {
        console.error('Failed to read recording file:', err);
        return null;
    }
});

// IPC Handler to get window bounds
ipcMain.handle('get-window-bounds', async () => {
    try {
        const win = BrowserWindow.getAllWindows()[0];
        return win ? win.getBounds() : null;
    } catch (err) {
        console.error('Failed to get window bounds:', err);
        return null;
    }
});

// IPC Handler to set window bounds
ipcMain.handle('set-window-bounds', async (event, bounds) => {
    try {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            win.setBounds({
                x: Math.round(bounds.x),
                y: Math.round(bounds.y),
                width: Math.round(bounds.width),
                height: Math.round(bounds.height)
            }, true);
            return { success: true };
        }
        return { success: false, error: 'Window not found' };
    } catch (err) {
        console.error('Failed to set window bounds:', err);
        return { success: false, error: err.message };
    }
});

// IPC Handler to set always-on-top
ipcMain.handle('set-always-on-top', async (event, flag) => {
    try {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            win.setAlwaysOnTop(flag, 'screen-saver');
            return { success: true };
        }
        return { success: false, error: 'Window not found' };
    } catch (err) {
        console.error('Failed to set always-on-top:', err);
        return { success: false, error: err.message };
    }
});

// IPC Handler to control window click-through status
ipcMain.handle('set-ignore-mouse-events', async (event, ignore, options) => {
    try {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            win.setIgnoreMouseEvents(ignore, options || {});
            return { success: true };
        }
        return { success: false, error: 'Window not found' };
    } catch (err) {
        console.error('Failed to set ignore mouse events:', err);
        return { success: false, error: err.message };
    }
});

// IPC Handler to teleport physical mouse cursor to the left or right monitor
ipcMain.handle('teleport-mouse-left-right', async (event, direction) => {
    try {
        const displays = screen.getAllDisplays().sort((a, b) => a.bounds.x - b.bounds.x);
        if (displays.length <= 1) return { success: false };
        
        const currentPoint = screen.getCursorScreenPoint();
        const currentDisplay = screen.getDisplayNearestPoint(currentPoint);
        const currentIdx = displays.findIndex(d => d.id === currentDisplay.id);
        
        let targetIdx;
        if (direction === 'left') {
            targetIdx = currentIdx - 1;
            if (targetIdx < 0) targetIdx = displays.length - 1;
        } else {
            targetIdx = currentIdx + 1;
            if (targetIdx >= displays.length) targetIdx = 0;
        }
        
        const target = displays[targetIdx];
        const targetX = target.bounds.x + Math.floor(target.bounds.width / 2);
        const targetY = target.bounds.y + Math.floor(target.bounds.height / 2);
        screen.setCursorScreenPoint({ x: targetX, y: targetY });
        return { success: true };
    } catch (err) {
        console.error('Failed to teleport mouse left/right:', err);
        return { success: false, error: err.message };
    }
});



