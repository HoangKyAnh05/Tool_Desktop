// =========================================================
// DESKOS & PC OPTIMIZER - RENDERER CONTROLLER
// =========================================================

// --- Sound Synthesizer (Web Audio API) ---
class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('desk_muted') === 'true';
        this.radarOsc = null;
        this.radarGain = null;
        this.updateIcon();
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('desk_muted', this.muted);
        this.updateIcon();
        this.playClick();
    }

    updateIcon() {
        const iconOn = document.getElementById('soundIconOn');
        const iconOff = document.getElementById('soundIconOff');
        if (!iconOn || !iconOff) return;
        
        if (this.muted) {
            iconOn.classList.add('hidden');
            iconOff.classList.remove('hidden');
        } else {
            iconOn.classList.remove('hidden');
            iconOff.classList.add('hidden');
        }
    }

    playClick() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playHover() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.setValueAtTime(1200, now + 0.01);

        gain.gain.setValueAtTime(0.008, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
    }

    playFolderOpen() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playFolderClose() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.17);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
    }

    playSuccess() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc2.frequency.setValueAtTime(1046.50, now + 0.24); // C6

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.setValueAtTime(0.06, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.45);
        osc2.start(now + 0.16);
        osc2.stop(now + 0.45);
    }

    playSwoosh() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.25; // 0.25 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.22);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 0.25);
    }

    startRadarSweep() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        this.radarOsc = this.ctx.createOscillator();
        this.radarGain = this.ctx.createGain();
        
        this.radarOsc.type = 'sine';
        this.radarOsc.frequency.setValueAtTime(280, now);
        this.radarOsc.frequency.linearRampToValueAtTime(350, now + 1);
        
        this.radarGain.gain.setValueAtTime(0.005, now);
        this.radarGain.gain.linearRampToValueAtTime(0.015, now + 0.5);
        this.radarGain.gain.linearRampToValueAtTime(0.001, now + 1);
        
        this.radarOsc.connect(this.radarGain);
        this.radarGain.connect(this.ctx.destination);
        
        this.radarOsc.start(now);
    }

    stopRadarSweep() {
        if (this.radarOsc) {
            try {
                this.radarOsc.stop();
            } catch (e) {}
            this.radarOsc = null;
        }
        this.radarGain = null;
    }

    playAppLaunch() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.3);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.35);
        osc2.start(now);
        osc2.stop(now + 0.35);
    }

    playCleanStart() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(440, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.setValueAtTime(0.05, now + 0.16);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playFileTrash() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.linearRampToValueAtTime(200, now + 0.28);
        filter.Q.setValueAtTime(5, now);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.3);
    }

    playError() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(130, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(135, now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.4);
        osc2.start(now);
        osc2.stop(now + 0.4);
    }

    playTabSwitch() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
        
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.08);
    }
}

const sounds = new SoundManager();

// --- Default Desktop Shortcuts Configuration ---
const defaultDesktopState = [
    {
        id: 'folder-sys',
        name: 'System Utilities',
        type: 'folder',
        apps: [
            { name: 'Command Prompt', path: 'C:\\Windows\\System32\\cmd.exe' },
            { name: 'Task Manager', path: 'C:\\Windows\\System32\\taskmgr.exe' },
            { name: 'PowerShell', path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe' },
            { name: 'Calculator', path: 'C:\\Windows\\System32\\calc.exe' }
        ]
    },
    {
        id: 'folder-writing',
        name: 'Office & Productivity',
        type: 'folder',
        apps: [
            { name: 'Notepad', path: 'C:\\Windows\\notepad.exe' },
            { name: 'Wordpad', path: 'C:\\Windows\\System32\\write.exe' }
        ]
    },
    {
        id: 'folder-browsers',
        name: 'Web Browsers',
        type: 'folder',
        apps: [
            { name: 'Microsoft Edge', path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' }
        ]
    }
];

// --- Desktop Controller ---
class DesktopController {
    constructor() {
        this.grid = document.getElementById('desktopGrid');
        this.modal = document.getElementById('folderModal');
        this.modalGrid = document.getElementById('folderContentsGrid');
        this.modalTitleInput = document.getElementById('folderTitleInput');
        this.activeFolderId = null;
        this.state = [];

        this.initController();
    }

    async initController() {
        this.bindEvents();
        await this.loadState();
    }

    async loadState() {
        const res = await window.api.loadLayout();
        if (res && res.success && res.state) {
            this.state = res.state;
        } else {
            // Fallback to localStorage for backward compatibility if present
            const saved = localStorage.getItem('desk_layout_state');
            if (saved) {
                try {
                    this.state = JSON.parse(saved);
                    await this.saveState();
                } catch (e) {
                    this.state = JSON.parse(JSON.stringify(defaultDesktopState));
                }
            } else {
                this.state = JSON.parse(JSON.stringify(defaultDesktopState));
                await this.saveState();
            }
        }
        this.render();
    }

    async saveState() {
        await window.api.saveLayout(this.state);
        // Also update localStorage as local redundancy
        localStorage.setItem('desk_layout_state', JSON.stringify(this.state));
    }

    bindEvents() {
        // Window Control Buttons
        document.getElementById('btnMinimize').addEventListener('click', () => {
            sounds.playClick();
            window.api.windowControl('minimize');
        });
        document.getElementById('btnMaximize').addEventListener('click', () => {
            sounds.playClick();
            window.api.windowControl('maximize');
        });
        document.getElementById('btnClose').addEventListener('click', () => {
            sounds.playClick();
            window.api.windowControl('close');
        });
        document.getElementById('soundToggleBtn').addEventListener('click', () => {
            sounds.toggleMute();
        });

        // Add Folder Button
        document.getElementById('btnNewFolder').addEventListener('click', () => {
            sounds.playClick();
            this.createFolder();
        });

        // Reset Desktop Button
        const btnReset = document.getElementById('btnResetDesktop');
        if (btnReset) {
            btnReset.addEventListener('click', async () => {
                sounds.playClick();
                if (confirm('Reset virtual desktop layout to default?')) {
                    this.state = JSON.parse(JSON.stringify(defaultDesktopState));
                    await this.saveState();
                    this.render();
                    sounds.playSuccess();
                }
            });
        }

        // Modal Events
        document.getElementById('btnFolderClose').addEventListener('click', () => {
            this.closeFolder();
        });
        document.getElementById('btnFolderAddApp').addEventListener('click', () => {
            this.addAppToActiveFolder();
        });

        // Folder Title Rename Action
        this.modalTitleInput.addEventListener('change', (e) => {
            const folder = this.state.find(f => f.id === this.activeFolderId);
            if (folder) {
                folder.name = e.target.value.trim() || 'Unnamed Folder';
                this.saveState();
                this.render();
            }
        });

        // Close modal when clicking overlay
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeFolder();
            }
        });
    }

    render() {
        this.grid.innerHTML = '';
        
        this.state.forEach(item => {
            const el = document.createElement('div');
            el.className = 'desktop-item';
            el.dataset.id = item.id;
            
            // Delete Badge
            const delBadge = document.createElement('div');
            delBadge.className = 'item-delete-badge';
            delBadge.innerText = '×';
            delBadge.title = 'Remove Group';
            delBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                sounds.playSwoosh();
                this.deleteItem(item.id);
            });
            el.appendChild(delBadge);

            if (item.type === 'folder') {
                // Folder structure with previews
                const previewCont = document.createElement('div');
                previewCont.className = 'folder-preview-container';
                
                const previewGrid = document.createElement('div');
                previewGrid.className = 'folder-preview-grid';
                
                // Show up to 4 mini-shortcuts inside the folder icon preview
                const miniApps = item.apps.slice(0, 4);
                for (let i = 0; i < 4; i++) {
                    const miniCell = document.createElement('div');
                    miniCell.className = 'folder-mini-app';
                    if (miniApps[i]) {
                        miniCell.innerHTML = `
                            <svg viewBox="0 0 24 24" style="color: #9feaf9;">
                                <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(30 12 12)" />
                                <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(90 12 12)" />
                                <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(150 12 12)" />
                                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                            </svg>
                        `;
                    }
                    previewGrid.appendChild(miniCell);
                }
                
                previewCont.appendChild(previewGrid);
                el.appendChild(previewCont);
            }

            const label = document.createElement('div');
            label.className = 'item-label';
            label.innerText = item.name;
            el.appendChild(label);

            // Single Click to open folder modal
            el.addEventListener('click', () => {
                sounds.playClick();
                document.querySelectorAll('.desktop-item').forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');
                this.openFolder(item.id);
            });
            
            el.addEventListener('mouseenter', () => {
                sounds.playHover();
            });

            this.grid.appendChild(el);
        });

        // Setup sound hover for dynamic additions
        document.querySelectorAll('.secondary-btn, .primary-btn, .win-btn').forEach(btn => {
            if (!btn.dataset.soundHooked) {
                btn.addEventListener('mouseenter', () => sounds.playHover());
                btn.dataset.soundHooked = 'true';
            }
        });
    }

    createFolder() {
        const newFolder = {
            id: 'folder-' + Date.now(),
            name: 'New Folder',
            type: 'folder',
            apps: []
        };
        this.state.push(newFolder);
        this.saveState();
        this.render();
        sounds.playSuccess();
    }

    deleteItem(id) {
        if (confirm('Delete this folder and all of its shortcuts?')) {
            this.state = this.state.filter(item => item.id !== id);
            this.saveState();
            this.render();
        }
    }

    openFolder(id) {
        const folder = this.state.find(f => f.id === id);
        if (!folder) return;
        
        this.activeFolderId = id;
        this.modalTitleInput.value = folder.name;
        this.renderFolderContents(folder);
        
        this.modal.classList.add('active');
        sounds.playFolderOpen();
    }

    closeFolder() {
        this.modal.classList.remove('active');
        sounds.playFolderClose();
        this.activeFolderId = null;
    }

    renderFolderContents(folder) {
        this.modalGrid.innerHTML = '';
        
        if (folder.apps.length === 0) {
            this.modalGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px 10px; font-size: 13px;">
                    Folder is empty.<br>Click "Add Shortcut" above to add an executable app.
                </div>
            `;
            return;
        }

        folder.apps.forEach((appItem, index) => {
            const el = document.createElement('div');
            el.className = 'desktop-item';
            el.title = appItem.path;
            
            // Delete App Badge
            const delBadge = document.createElement('div');
            delBadge.className = 'item-delete-badge';
            delBadge.innerText = '×';
            delBadge.title = 'Remove Shortcut';
            delBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                sounds.playSwoosh();
                this.removeAppFromFolder(index);
            });
            el.appendChild(delBadge);

            // App Icon
            const iconCont = document.createElement('div');
            iconCont.className = 'app-icon-container';
            iconCont.innerHTML = `
                <svg viewBox="0 0 24 24" width="32" height="32" style="color: #9feaf9;">
                    <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(30 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(90 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(150 12 12)" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
                <div class="shortcut-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </div>
            `;
            el.appendChild(iconCont);

            // Label
            const label = document.createElement('div');
            label.className = 'item-label';
            label.innerText = appItem.name;
            el.appendChild(label);

            // Single click to launch app
            el.addEventListener('click', () => {
                sounds.playAppLaunch();
                this.launchApp(appItem.path);
            });

            el.addEventListener('mouseenter', () => {
                sounds.playHover();
            });

            this.modalGrid.appendChild(el);
        });
    }

    async addAppToActiveFolder() {
        const appInfo = await window.api.selectApp();
        if (!appInfo) return;

        const folder = this.state.find(f => f.id === this.activeFolderId);
        if (folder) {
            // Avoid duplicate additions
            if (folder.apps.some(a => a.path === appInfo.path)) {
                alert('App is already listed in this folder!');
                return;
            }
            folder.apps.push({
                name: appInfo.name,
                path: appInfo.path
            });
            this.saveState();
            this.renderFolderContents(folder);
            this.render(); // update desktop mini-grid
            sounds.playSuccess();
        }
    }

    removeAppFromFolder(index) {
        const folder = this.state.find(f => f.id === this.activeFolderId);
        if (folder) {
            folder.apps.splice(index, 1);
            this.saveState();
            this.renderFolderContents(folder);
            this.render();
        }
    }

    async launchApp(path) {
        const res = await window.api.launchApp(path);
        if (!res.success) {
            sounds.playError();
            alert(`Failed to launch application: ${res.error}`);
        }
    }
}

// --- Display Switcher Controller ---
class DisplayController {
    constructor() {
        this.btnOpenWinP = document.getElementById('btnOpenWinP');
        this.cards = document.querySelectorAll('.display-mode-card');
        this.monitorListContainer = document.getElementById('monitorListContainer');
        this.videoPlayer = document.getElementById('liveScreenPlayer');
        this.videoPlaceholder = document.getElementById('videoPlaceholder');
        this.btnStopStream = document.getElementById('btnStopStream');
        
        // Fullscreen Screen Swap elements
        this.screenSwapOverlay = document.getElementById('screenSwapOverlay');
        this.swapVideoPlayer = document.getElementById('swapVideoPlayer');
        this.swapHud = document.getElementById('swapHud');
        this.swapHudText = document.getElementById('swapHudText');
        this.btnHudCollapse = document.getElementById('btnHudCollapse');
        this.hudCollapsedIndicator = document.getElementById('hudCollapsedIndicator');
        this.btnHudExit = document.getElementById('btnHudExit');
        this.btnHudRecord = document.getElementById('btnHudRecord');
        this.btnHudReplay = document.getElementById('btnHudReplay');
        this.swapActiveStream = null;
        this.isSwapped = false;
        this.isHardwareSwapped = false;
        this.hwCloneDisplayId = null;
        this.targetDisplayId = null;
        this.targetSourceId = null; // Store active stream source id
        
        this.activeStream = null;
        
        this.init();
    }
    
    async init() {
        if (this.btnOpenWinP) {
            this.btnOpenWinP.addEventListener('click', async () => {
                sounds.playClick();
                
                const originalText = this.btnOpenWinP.innerText;
                this.btnOpenWinP.disabled = true;
                this.btnOpenWinP.innerText = 'Opening Menu...';
                
                const res = await window.api.switchDisplay('panel');
                
                setTimeout(() => {
                    this.btnOpenWinP.disabled = false;
                    this.btnOpenWinP.innerText = originalText;
                    if (res && res.success) {
                        sounds.playSuccess();
                    } else {
                        sounds.playError();
                    }
                }, 800);
            });
        }
        
        this.cards.forEach(card => {
            const mode = card.dataset.mode;
            const btn = card.querySelector('.apply-mode-btn');
            
            if (btn) {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    sounds.playClick();
                    
                    // Disable all buttons during change to give feedback
                    const allButtons = document.querySelectorAll('.apply-mode-btn');
                    allButtons.forEach(b => b.disabled = true);
                    const originalText = btn.innerText;
                    btn.innerText = 'Applying...';
                    btn.style.opacity = '0.7';
                    
                    // Trigger change
                    const res = await window.api.switchDisplay(mode);
                    
                    setTimeout(() => {
                        allButtons.forEach(b => {
                            b.disabled = false;
                            b.innerText = 'Apply Mode';
                            b.style.opacity = '1';
                        });
                        if (res && res.success) {
                            sounds.playSuccess();
                        } else {
                            sounds.playError();
                            alert(`Failed to change display mode: ${res.error || 'Unknown error'}`);
                        }
                    }, 1000);
                });
            }
            
            card.addEventListener('mouseenter', () => {
                sounds.playHover();
            });
        });

        // Initialize Live Screen streaming list
        await this.loadScreens();
        
        const btnRefreshScreens = document.getElementById('btnRefreshScreens');
        if (btnRefreshScreens) {
            btnRefreshScreens.addEventListener('click', async () => {
                sounds.playClick();
                await this.loadScreens();
            });
        }

        if (this.btnStopStream) {
            this.btnStopStream.addEventListener('click', () => {
                sounds.playClick();
                this.stopStream();
            });
        }

        if (this.btnHudExit) {
            this.btnHudExit.addEventListener('click', () => {
                this.stopSwapMode();
            });
        }

        // Collapsible HUD toggle listeners
        if (this.btnHudCollapse) {
            this.btnHudCollapse.addEventListener('click', (e) => {
                e.stopPropagation();
                sounds.playClick();
                if (this.swapHud) {
                    this.swapHud.classList.add('collapsed');
                }
            });
        }

        if (this.hudCollapsedIndicator) {
            this.hudCollapsedIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                sounds.playClick();
                if (this.swapHud) {
                    this.swapHud.classList.remove('collapsed');
                }
            });
        }

        // Mouse hover logic on HUD to toggle click-through when swapped
        if (this.swapHud) {
            this.swapHud.addEventListener('mouseenter', () => {
                if (this.isSwapped && this.isHardwareSwapped) {
                    window.api.setIgnoreMouseEvents(false);
                }
            });
            this.swapHud.addEventListener('mouseleave', () => {
                if (this.isSwapped && this.isHardwareSwapped) {
                    window.api.setIgnoreMouseEvents(true, { forward: true });
                }
            });
        }

        // HUD-specific Record and Replay click handlers
        if (this.btnHudRecord) {
            this.btnHudRecord.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.targetSourceId && this.targetDisplayId) {
                    this.toggleRecord(this.targetSourceId, this.targetDisplayId, this.btnHudRecord);
                }
            });
        }

        if (this.btnHudReplay) {
            this.btnHudReplay.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.targetDisplayId) {
                    this.replayRecordingInHud(this.targetDisplayId);
                }
            });
        }

        // System-wide global shortcut handlers for when DeskOS window loses focus
        window.api.onGlobalEscapePressed(() => {
            if (this.isSwapped) {
                this.stopSwapMode();
            }
        });

        window.api.onGlobalNumberPressed(async (num) => {
            try {
                const sources = await window.api.getScreenSources();
                const idx = num - 1;
                if (sources && sources[idx]) {
                    const source = sources[idx];
                    this.startSwapMode(source.id, source.display_id, source.name, source.is_current);
                }
            } catch (err) {
                console.error('Failed to handle global number shortcut:', err);
            }
        });

        window.api.onGlobalArrowPressed(async (direction) => {
            try {
                if (this.isSwapped) {
                    // In swap mode: Switch the controlled screen and move the mouse
                    const sources = await window.api.getScreenSources();
                    if (!sources || sources.length <= 1) return;
                    
                    let currentIdx = sources.findIndex(s => s.display_id === this.targetDisplayId);
                    if (currentIdx === -1) currentIdx = 0;
                    
                    let targetIdx;
                    if (direction === 'left') {
                        targetIdx = currentIdx - 1;
                        if (targetIdx < 0) targetIdx = sources.length - 1;
                    } else {
                        targetIdx = currentIdx + 1;
                        if (targetIdx >= sources.length) targetIdx = 0;
                    }
                    
                    const source = sources[targetIdx];
                    sounds.playClick();
                    this.startSwapMode(source.id, source.display_id, source.name, source.is_current);
                } else {
                    // Not in swap mode: Just move the physical mouse cursor to the left or right display
                    await window.api.teleportMouseLeftRight(direction);
                }
            } catch (err) {
                console.error('Failed to handle global arrow shortcut:', err);
            }
        });

        window.api.onDisplayModeSwitchSuccess((mode) => {
            sounds.playSuccess();
            this.updateActiveDisplayCard(mode);
        });

        window.api.onDisplayModeSwitchError((mode, err) => {
            sounds.playError();
            console.error(`Failed to switch display mode to ${mode}:`, err);
        });

        // Mouse mapping logic for remote screen control
        if (this.screenSwapOverlay) {
            let lastTeleportTime = 0;
            const TELEPORT_THROTTLE_MS = 12; // ~83Hz - highly responsive but prevents CPU saturation

            const handleMouseInteraction = (e) => {
                if (!this.isSwapped || !this.targetDisplayId) return;
                
                // If interacting with the floating HUD bar, let mouse movement and clicks pass natively
                if (e.target.closest('.swap-hud')) {
                    return;
                }
                
                const now = performance.now();
                const isClick = e.type === 'mousedown';
                if (!isClick && (now - lastTeleportTime < TELEPORT_THROTTLE_MS)) {
                    return;
                }
                lastTeleportTime = now;
                
                // Map local coordinates (0 to 1 percentage)
                const pctX = e.clientX / window.innerWidth;
                const pctY = e.clientY / window.innerHeight;
                
                // Teleport physical mouse cursor to matching mapped coordinate on target display
                window.api.teleportMouseToScreen(this.targetDisplayId, pctX, pctY);
            };

            this.screenSwapOverlay.addEventListener('mousemove', handleMouseInteraction);
            this.screenSwapOverlay.addEventListener('mousedown', handleMouseInteraction);
        }
    }

    async loadScreens() {
        if (!this.monitorListContainer) return;
        this.monitorListContainer.innerHTML = '<p style="font-size:12px; color:var(--text-muted); padding: 10px;">Scanning for monitors...</p>';
        
        try {
            const sources = await window.api.getScreenSources();
            this.monitorListContainer.innerHTML = '';
            
            if (!sources || sources.length === 0) {
                this.monitorListContainer.innerHTML = '<p style="font-size:12px; color:var(--danger); padding: 10px;">No screens detected</p>';
                return;
            }
            
            sources.forEach(source => {
                const el = document.createElement('div');
                el.className = 'monitor-source-item';
                el.innerHTML = `
                    <img src="${source.thumbnail}" class="monitor-thumbnail" alt="${source.name}">
                    <div class="monitor-info">
                        <span class="monitor-name">${source.name}</span>
                        <span class="monitor-id">Display: ${source.display_id || 'N/A'}</span>
                    </div>
                    <div class="monitor-actions-row">
                        <button class="primary-btn record-btn" title="Start/Stop recording this screen">Record</button>
                        <button class="secondary-btn replay-btn" title="Replay latest recording of this screen">Replay</button>
                        <button class="secondary-btn hw-swap-btn" title="Hardware Mirror Swap (Ultra Sharp & Lag-free)">Hw Go</button>
                        <button class="secondary-btn move-win-btn" title="Move DeskOS window to this screen">Move</button>
                    </div>
                `;
                
                const btnRecord = el.querySelector('.record-btn');
                if (source.display_id) {
                    btnRecord.addEventListener('click', () => {
                        this.toggleRecord(source.id, source.display_id, btnRecord);
                    });
                } else {
                    btnRecord.disabled = true;
                    btnRecord.style.opacity = '0.4';
                }

                const btnReplay = el.querySelector('.replay-btn');
                if (source.display_id) {
                    btnReplay.addEventListener('click', () => {
                        this.replayRecording(source.display_id);
                    });
                } else {
                    btnReplay.disabled = true;
                    btnReplay.style.opacity = '0.4';
                }

                const btnHwSwap = el.querySelector('.hw-swap-btn');
                if (source.display_id) {
                    btnHwSwap.addEventListener('click', () => {
                        sounds.playClick();
                        this.startSwapMode(source.id, source.display_id, source.name, source.is_current);
                    });
                } else {
                    btnHwSwap.disabled = true;
                    btnHwSwap.style.opacity = '0.4';
                }

                const btnMoveWin = el.querySelector('.move-win-btn');
                if (source.display_id) {
                    btnMoveWin.addEventListener('click', async () => {
                        sounds.playClick();
                        const res = await window.api.moveWindowToScreen(source.display_id);
                        if (res && res.success) {
                            sounds.playSuccess();
                        } else {
                            sounds.playError();
                        }
                    });
                } else {
                    btnMoveWin.disabled = true;
                    btnMoveWin.style.opacity = '0.4';
                }
                
                this.monitorListContainer.appendChild(el);
            });
        } catch (err) {
            console.error('Failed loading screen list:', err);
            this.monitorListContainer.innerHTML = '<p style="font-size:12px; color:var(--danger); padding: 10px;">Scan failed.</p>';
        }
    }

    async startStream(sourceId) {
        try {
            this.stopStream();
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sourceId,
                        minWidth: 1280,
                        maxWidth: 3840, // Support native resolutions up to 4K
                        minHeight: 720,
                        maxHeight: 2160,
                        frameRate: { ideal: 60, max: 60 } // Force 60fps for ultra smoothness
                    }
                }
            });
            
            this.activeStream = stream;
            this.videoPlayer.srcObject = stream;
            
            if (this.videoPlaceholder) this.videoPlaceholder.classList.add('hidden');
            this.videoPlayer.classList.remove('hidden');
            if (this.btnStopStream) this.btnStopStream.classList.remove('hidden');
            
            sounds.playSuccess();
        } catch (err) {
            console.error('Failed to start stream:', err);
            sounds.playError();
            alert('Cannot access display stream. Make sure permissions are granted.');
        }
    }

    stopStream() {
        if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => track.stop());
            this.activeStream = null;
        }
        if (this.videoPlayer) {
            this.videoPlayer.srcObject = null;
            this.videoPlayer.removeAttribute('src'); // Clear video source URL
            this.videoPlayer.load(); // Force release file binding
            this.videoPlayer.controls = false; // Hide controls
            this.videoPlayer.classList.add('hidden');
        }
        if (this.videoPlaceholder) {
            this.videoPlaceholder.classList.remove('hidden');
        }
        if (this.btnStopStream) {
            this.btnStopStream.innerText = 'Stop Live Stream'; // Reset text
            this.btnStopStream.classList.add('hidden');
        }
    }

    async toggleRecord(sourceId, displayId, btn) {
        if (!displayId) return;

        // Initialize state objects if not exists
        if (!this.mediaRecorders) this.mediaRecorders = {};
        if (!this.recordingChunks) this.recordingChunks = {};
        if (!this.isRecording) this.isRecording = {};

        if (!this.isRecording[displayId]) {
            // Start recording
            let stream = null;
            try {
                sounds.playClick();
                
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: sourceId,
                            minWidth: 1280,
                            maxWidth: 3840,
                            minHeight: 720,
                            maxHeight: 2160,
                            frameRate: { ideal: 60 }
                        }
                    }
                });

                let mediaRecorder;
                try {
                    mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'video/webm; codecs=vp9'
                    });
                } catch (codecErr) {
                    console.warn('VP9 codec not supported, falling back to default webm codec:', codecErr);
                    mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'video/webm'
                    });
                }

                this.recordingChunks[displayId] = [];
                this.mediaRecorders[displayId] = mediaRecorder;

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        this.recordingChunks[displayId].push(e.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    try {
                        const blob = new Blob(this.recordingChunks[displayId], { type: 'video/webm' });
                        const arrayBuffer = await blob.arrayBuffer();
                        const filename = `recording_${displayId}_${Date.now()}.webm`;
                        
                        const res = await window.api.saveRecording(filename, arrayBuffer);
                        if (res && res.success) {
                            console.log('Recording saved successfully:', res.filePath);
                            sounds.playSuccess();
                        } else {
                            console.error('Failed to save recording:', res.error);
                            sounds.playError();
                        }
                    } catch (err) {
                        console.error('Error post-processing recording:', err);
                    } finally {
                        // Stop all tracks to release stream
                        stream.getTracks().forEach(track => track.stop());
                    }
                };

                // Request data every 100ms
                mediaRecorder.start(100);
                this.isRecording[displayId] = true;

                // Update UI to recording state
                btn.innerHTML = '<span>🔴 Stop</span>';
                btn.style.background = 'var(--danger)';
                btn.style.borderColor = 'var(--danger)';
                btn.style.color = '#fff';
                btn.classList.add('recording-active');
                this.updateHudRecordButtonState();
            } catch (err) {
                console.error('Failed to start recording:', err);
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                sounds.playError();
                alert('Cannot access screen capture for recording. Check system permissions.');
            }
        } else {
            // Stop recording
            sounds.playClick();
            if (this.mediaRecorders[displayId]) {
                this.mediaRecorders[displayId].stop();
            }
            this.isRecording[displayId] = false;

            // Reset UI to default state
            btn.innerHTML = 'Record';
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            btn.classList.remove('recording-active');
            this.updateHudRecordButtonState();
        }
    }

    async replayRecording(displayId) {
        if (!displayId) return;
        try {
            sounds.playClick();
            const filePath = await window.api.getLatestRecording(displayId);
            
            if (!filePath) {
                sounds.playError();
                alert('Không tìm thấy video quay màn hình nào cho màn này. Hãy bấm quay trước.');
                return;
            }

            // Read recording file as ArrayBuffer and create a local Blob URL
            const arrayBuffer = await window.api.readRecordingFile(filePath);
            if (!arrayBuffer) {
                sounds.playError();
                alert('Không thể đọc tệp tin video.');
                return;
            }

            const blob = new Blob([arrayBuffer], { type: 'video/webm' });
            const blobUrl = URL.createObjectURL(blob);

            // Stop any active stream first
            this.stopStream();

            // Set video player properties
            this.videoPlayer.srcObject = null;
            this.videoPlayer.src = blobUrl;
            this.videoPlayer.controls = true; // Enable playback controls
            this.videoPlayer.autoplay = true;

            // Update UI
            if (this.videoPlaceholder) this.videoPlaceholder.classList.add('hidden');
            this.videoPlayer.classList.remove('hidden');
            if (this.btnStopStream) {
                this.btnStopStream.innerText = 'Stop Replay';
                this.btnStopStream.classList.remove('hidden');
            }

            sounds.playSuccess();
        } catch (err) {
            console.error('Failed to replay recording:', err);
            sounds.playError();
        }
    }

    async replayRecordingInHud(displayId) {
        if (!displayId) return;
        try {
            sounds.playClick();
            const filePath = await window.api.getLatestRecording(displayId);
            
            if (!filePath) {
                sounds.playError();
                alert('Không tìm thấy video quay màn hình nào cho màn này. Hãy bấm quay trước.');
                return;
            }

            // Read recording file as ArrayBuffer and create a local Blob URL
            const arrayBuffer = await window.api.readRecordingFile(filePath);
            if (!arrayBuffer) {
                sounds.playError();
                alert('Không thể đọc tệp tin video.');
                return;
            }

            const blob = new Blob([arrayBuffer], { type: 'video/webm' });
            const blobUrl = URL.createObjectURL(blob);

            // If we are in hardware duplicate/clone mode, temporarily show the video player in overlay
            if (this.isHardwareSwapped) {
                await window.api.setIgnoreMouseEvents(false);
                if (this.screenSwapOverlay) {
                    this.screenSwapOverlay.style.background = '#0f1426';
                }
                if (this.swapVideoPlayer) {
                    this.swapVideoPlayer.classList.remove('hidden');
                }
            }

            // Bind player to replay
            this.swapVideoPlayer.srcObject = null;
            this.swapVideoPlayer.src = blobUrl;
            this.swapVideoPlayer.controls = true; // Show playback controls
            this.swapVideoPlayer.autoplay = true;

            if (this.swapHudText) {
                this.swapHudText.innerText = 'Replaying video...';
            }

            sounds.playSuccess();
        } catch (err) {
            console.error('Failed to replay recording in HUD:', err);
            sounds.playError();
        }
    }

    async startHardwareSwapMode() {
        try {
            sounds.playClick();
            const res = await window.api.switchDisplay('clone');
            if (res && res.success) {
                sounds.playSuccess();
            } else {
                sounds.playError();
                alert('Failed to switch to duplicate screen mode.');
            }
        } catch (err) {
            console.error('Failed to start hardware swap mode:', err);
            sounds.playError();
        }
    }

    async startSwapMode(sourceId, displayId, name, isCurrent) {
        if (isCurrent) {
            // If the user targets the monitor they are already physically on, exit swap mode to prevent recursion loops
            this.stopSwapMode();
            return;
        }
        
        // Teleport mouse cursor immediately to the target display to guarantee high responsiveness
        if (displayId) {
            window.api.teleportMouseToScreen(displayId).catch(err => {
                console.error('Failed to teleport mouse immediately:', err);
            });
        }

        try {
            // Clear any active replay player configuration to restore stream
            if (this.swapVideoPlayer && (this.swapVideoPlayer.src || this.swapVideoPlayer.srcObject)) {
                this.swapVideoPlayer.src = '';
                this.swapVideoPlayer.removeAttribute('src');
                this.swapVideoPlayer.controls = false;
            }
            // Transitioning from HW clone mode back to the mirrored display OR to a different display
            if (this.isHardwareSwapped) {
                if (displayId === this.hwCloneDisplayId) {
                    // Switch back to Hardware Mirror mode
                    if (this.swapVideoPlayer) {
                        this.swapVideoPlayer.classList.add('hidden');
                    }
                    if (this.screenSwapOverlay) {
                        this.screenSwapOverlay.style.background = 'transparent';
                    }
                    await window.api.setIgnoreMouseEvents(true, { forward: true });
                    this.targetDisplayId = displayId;
                    this.targetSourceId = sourceId;
                    if (this.swapHudText) {
                        this.swapHudText.innerText = 'Mirror Mode Active';
                    }
                    
                    const sources = await window.api.getScreenSources();
                    this.populateHudSelector(sources);
                    this.updateHudRecordButtonState();
                    sounds.playSuccess();
                    return;
                } else {
                    // Switch to high-quality streaming for this secondary screen
                    if (this.swapVideoPlayer) {
                        this.swapVideoPlayer.classList.remove('hidden');
                    }
                    if (this.screenSwapOverlay) {
                        this.screenSwapOverlay.style.background = '';
                    }
                    await window.api.setIgnoreMouseEvents(false);
                }
            }

            // Enter native OS fullscreen first
            await window.api.setWindowFullscreen(true);
            await new Promise(r => setTimeout(r, 150)); // Small pause to let window size stabilize

            // Stop any active stream first
            if (this.swapActiveStream) {
                this.swapActiveStream.getTracks().forEach(track => track.stop());
                this.swapActiveStream = null;
            }
            
            // Get screen stream for full-screen swap overlay
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sourceId,
                        minWidth: 1280,
                        maxWidth: 3840, // Support native resolutions up to 4K
                        minHeight: 720,
                        maxHeight: 2160,
                        frameRate: { ideal: 60, max: 60 } // Force 60fps for ultra smoothness
                    }
                }
            });
            
            this.swapActiveStream = stream;
            this.swapVideoPlayer.srcObject = stream;
            
            if (this.swapHudText) {
                this.swapHudText.innerText = `Controlling ${name}`;
            }
            
            if (this.screenSwapOverlay) {
                this.screenSwapOverlay.classList.remove('hidden');
            }
            
            this.isSwapped = true;
            this.targetDisplayId = displayId;
            this.targetSourceId = sourceId;
            
            // Register system-wide global shortcuts during control session
            await window.api.registerSwapShortcuts();
            
            // Fetch screens to populate the selector buttons in HUD
            const sources = await window.api.getScreenSources();
            this.populateHudSelector(sources);
            this.updateHudRecordButtonState();
            
            sounds.playSuccess();
        } catch (err) {
            console.error('Failed to start swap mode:', err);
            sounds.playError();
            alert('Cannot access display stream for swap mode. Make sure permissions are granted.');
        }
    }

    async stopSwapMode() {
        // Revert mouse cursor position back to primary display immediately
        if (this.targetDisplayId) {
            window.api.teleportMouseToScreen('primary').catch(err => {
                console.error('Failed to revert mouse immediately:', err);
            });
        }

        if (this.swapActiveStream) {
            this.swapActiveStream.getTracks().forEach(track => track.stop());
            this.swapActiveStream = null;
        }
        if (this.swapVideoPlayer) {
            this.swapVideoPlayer.srcObject = null;
            this.swapVideoPlayer.src = '';
            this.swapVideoPlayer.removeAttribute('src');
            this.swapVideoPlayer.load();
            this.swapVideoPlayer.classList.remove('hidden'); 
        }
        if (this.screenSwapOverlay) {
            this.screenSwapOverlay.style.background = '';
            this.screenSwapOverlay.classList.add('hidden');
        }
        
        // Restore extended display mode if hardware swap mode was active
        if (this.isHardwareSwapped) {
            await window.api.switchDisplay('extend');
            this.isHardwareSwapped = false;
        }
        
        // Disable window ignore mouse events
        await window.api.setIgnoreMouseEvents(false);

        // Reset HUD collapse state
        if (this.swapHud) {
            this.swapHud.classList.remove('collapsed');
        }
        
        this.isSwapped = false;
        this.targetDisplayId = null;
        this.targetSourceId = null;
        this.hwCloneDisplayId = null;
        
        // Unregister global shortcuts
        await window.api.unregisterSwapShortcuts();
        
        // Exit native OS fullscreen
        await window.api.setWindowFullscreen(false);
        sounds.playClick();
    }

    async populateHudSelector(sources) {
        const container = document.getElementById('hudMonitorSelector');
        if (!container) return;
        container.innerHTML = '';
        
        sources.forEach((source, index) => {
            const btn = document.createElement('button');
            btn.className = `hud-select-btn ${source.display_id === this.targetDisplayId ? 'active' : ''}`;
            btn.innerText = `Màn ${index + 1}`;
            btn.title = `Switch control to ${source.name} (Ctrl+${index + 1})`;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                sounds.playClick();
                if (source.display_id === this.targetDisplayId) return;
                this.startSwapMode(source.id, source.display_id, source.name, source.is_current);
            });
            container.appendChild(btn);
        });
    }

    updateHudRecordButtonState() {
        if (!this.btnHudRecord || !this.targetDisplayId) return;
        const displayId = this.targetDisplayId;
        const isRecording = this.isRecording && this.isRecording[displayId];
        
        if (isRecording) {
            this.btnHudRecord.innerHTML = '<span>🔴 Stop</span>';
            this.btnHudRecord.style.background = 'var(--danger)';
            this.btnHudRecord.style.borderColor = 'var(--danger)';
            this.btnHudRecord.style.color = '#fff';
            this.btnHudRecord.classList.add('recording-active');
        } else {
            this.btnHudRecord.innerHTML = 'Record';
            this.btnHudRecord.style.background = '';
            this.btnHudRecord.style.borderColor = '';
            this.btnHudRecord.style.color = '';
            this.btnHudRecord.classList.remove('recording-active');
        }
    }

    async switchScreenByIndex(index) {
        try {
            const sources = await window.api.getScreenSources();
            if (sources && sources[index]) {
                const source = sources[index];
                if (source.display_id === this.targetDisplayId) return;
                sounds.playClick();
                this.startSwapMode(source.id, source.display_id, source.name, source.is_current);
            }
        } catch (err) {
            console.error('Failed to switch screen by index:', err);
        }
    }

    updateActiveDisplayCard(mode) {
        if (!this.cards) return;
        this.cards.forEach(card => {
            if (card.dataset.mode === mode) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }
}

// --- Tab Swapping Controller ---
function initTabs() {
    const tabs = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sounds.playTabSwitch();
            
            const target = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
            
            // Stop or start real-time task manager updates when switching tabs
            if (target === 'taskmgr-tab') {
                if (window.taskManagerController) {
                    window.taskManagerController.startRealtimeUpdate();
                }
            } else {
                if (window.taskManagerController) {
                    window.taskManagerController.stopRealtimeUpdate();
                }
            }
        });
    });
}

// --- RAM Cleanup Helper ---
async function triggerRAMCleanup() {
    const buttons = [
        document.getElementById('btnCleanRAM'),
        document.getElementById('btnSpecCleanRAM')
    ].filter(btn => btn !== null);

    // If already processing, skip
    if (buttons.some(btn => btn.disabled || btn.classList.contains('processing'))) return;
    
    // Save original HTML and styles
    const originalStates = buttons.map(buttonEl => ({
        el: buttonEl,
        html: buttonEl.innerHTML,
        style: {
            background: buttonEl.style.background,
            borderColor: buttonEl.style.borderColor,
            color: buttonEl.style.color
        }
    }));
    
    // Set all buttons to processing
    buttons.forEach(buttonEl => {
        buttonEl.disabled = true;
        buttonEl.classList.add('processing');
        buttonEl.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" style="animation: rotateAnim 1.2s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;"><path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
            Optimizing...
        `;
    });

    sounds.playRadarSweep();
    
    const ramRing = document.getElementById('ramUsageRing');
    if (ramRing) {
        ramRing.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
        ramRing.style.filter = 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.8))';
    }
    
    const result = await window.api.cleanRAM();
    
    sounds.stopRadarSweep();
    
    if (result.success) {
        sounds.playSuccess();
        
        const formatSize = (bytes) => {
            const k = 1024;
            const dm = 0;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };

        const freedStr = formatSize(result.freed);
        
        buttons.forEach(buttonEl => {
            buttonEl.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Freed ${freedStr}!
            `;
            
            buttonEl.style.background = 'rgba(0, 230, 118, 0.15)';
            buttonEl.style.borderColor = '#00e676';
            buttonEl.style.color = '#00e676';
        });
        
        if (window.specsMonitor) {
            await window.specsMonitor.updateSpecs();
        }
        
        setTimeout(() => {
            originalStates.forEach(state => {
                state.el.disabled = false;
                state.el.classList.remove('processing');
                state.el.innerHTML = state.html;
                state.el.style.background = state.style.background;
                state.el.style.borderColor = state.style.borderColor;
                state.el.style.color = state.style.color;
            });
        }, 3000);
        
    } else {
        alert(`Failed to optimize RAM: ${result.error}`);
        originalStates.forEach(state => {
            state.el.disabled = false;
            state.el.classList.remove('processing');
            state.el.innerHTML = state.html;
        });
    }
    
    if (ramRing) {
        ramRing.style.filter = '';
    }
}

// --- System Monitor (RAM, DISK, CPU details) ---
class SystemSpecsMonitor {
    constructor() {
        this.updateSpecs();
        // Refresh every 3 seconds to keep stats alive
        setInterval(() => this.updateDynamicSpecs(), 3000);
        this.bindEvents();
    }

    bindEvents() {
        const specCleanBtn = document.getElementById('btnSpecCleanRAM');
        if (specCleanBtn) {
            specCleanBtn.addEventListener('click', () => {
                sounds.playClick();
                triggerRAMCleanup();
            });
        }
    }

    async updateSpecs() {
        const info = await window.api.getSystemInfo();
        if (!info) return;

        // Static specs
        document.getElementById('specOS').innerText = `${info.platform} ${info.release}`;
        document.getElementById('specCPU').innerText = info.cpu;
        document.getElementById('specCores').innerText = `${info.cpuCores} Threads`;
        
        // RAM formatted text
        const totalGB = (info.memory.total / (1024 * 1024 * 1024)).toFixed(1);
        document.getElementById('specRAM').innerText = `${totalGB} GB RAM`;

        this.renderDiskUI(info.disk);
        this.renderRamUI(info.memory);
    }

    async updateDynamicSpecs() {
        const info = await window.api.getSystemInfo();
        if (!info) return;

        this.renderDiskUI(info.disk);
        this.renderRamUI(info.memory);
    }

    renderDiskUI(disk) {
        if (!disk) return;
        const freeGB = (disk.free / (1024 * 1024 * 1024)).toFixed(1);
        const totalGB = (disk.total / (1024 * 1024 * 1024)).toFixed(1);
        const usedGB = (disk.used / (1024 * 1024 * 1024)).toFixed(1);

        // Sidebar Widget
        document.getElementById('sidebarDiskUsage').innerText = `${disk.percent}%`;
        document.getElementById('sidebarDiskBar').style.width = `${disk.percent}%`;
        document.getElementById('sidebarDiskDetails').innerText = `${freeGB} GB free of ${totalGB} GB`;

        // Specs Page Radial
        const specDiskDetails = document.getElementById('diskUsageDetails');
        if (specDiskDetails) {
            specDiskDetails.innerText = `Used: ${usedGB} GB\nFree: ${freeGB} GB\nTotal: ${totalGB} GB`;
        }
        
        const specDiskText = document.getElementById('diskPercentText');
        if (specDiskText) specDiskText.innerText = `${disk.percent}%`;

        const ring = document.getElementById('diskUsageRing');
        if (ring) {
            // stroke-dasharray = 314 (diameter 100 * pi)
            const offset = 314 - (314 * disk.percent) / 100;
            ring.style.strokeDashoffset = offset;
        }
    }

    renderRamUI(mem) {
        const freeGB = (mem.free / (1024 * 1024 * 1024)).toFixed(1);
        const usedGB = (mem.used / (1024 * 1024 * 1024)).toFixed(1);
        const totalGB = (mem.total / (1024 * 1024 * 1024)).toFixed(1);

        // Specs Page Radial
        const specRamDetails = document.getElementById('ramUsageDetails');
        if (specRamDetails) {
            specRamDetails.innerText = `Used: ${usedGB} GB\nFree: ${freeGB} GB\nTotal: ${totalGB} GB`;
        }

        const specRamText = document.getElementById('ramPercentText');
        if (specRamText) specRamText.innerText = `${mem.percent}%`;

        const ring = document.getElementById('ramUsageRing');
        if (ring) {
            const offset = 314 - (314 * mem.percent) / 100;
            ring.style.strokeDashoffset = offset;
        }
    }
}

// --- Smart Cleanup Scanner Controller ---
class OptimizerController {
    constructor() {
        this.resultsList = document.getElementById('scanResultsList');
        this.startBtn = document.getElementById('btnStartScan');
        this.cancelBtn = document.getElementById('btnCancelScan');
        this.cleanBtn = document.getElementById('btnCleanSelected');
        this.selectAll = document.getElementById('selectAllCheckbox');
        this.customPathDisplay = document.getElementById('customPathDisplay');
        this.customPathText = document.getElementById('customPathText');
        this.clearPathBtn = document.getElementById('btnClearCustomPath');
        
        this.progressRing = document.getElementById('scanProgressRing');
        this.percentText = document.getElementById('scanPercentText');
        this.statusText = document.getElementById('scanStatusText');
        this.scannedCountEl = document.getElementById('scannedFilesCount');
        this.junkSizeEl = document.getElementById('junkSizeFound');
        this.selectedStatsEl = document.getElementById('selectedJunkStats');
        
        this.customScanPath = null;
        this.scannedFiles = [];
        this.selectedFiles = new Set();
        this.currentFilter = 'all';

        this.bindEvents();
        this.setupIPC();
    }

    bindEvents() {
        const cleanRAMBtn = document.getElementById('btnCleanRAM');
        if (cleanRAMBtn) {
            cleanRAMBtn.addEventListener('click', () => {
                sounds.playClick();
                triggerRAMCleanup();
            });
        }

        this.startBtn.addEventListener('click', () => {
            sounds.playClick();
            this.startScan();
        });
        
        this.cancelBtn.addEventListener('click', () => {
            sounds.playClick();
            window.api.windowControl('stop-scan'); // main handles stopping scan via flag
            this.statusText.innerText = 'Canceling...';
        });

        this.cleanBtn.addEventListener('click', () => {
            sounds.playClick();
            this.cleanSelectedFiles();
        });

        // Select All Checkbox
        this.selectAll.addEventListener('change', (e) => {
            sounds.playClick();
            const checked = e.target.checked;
            const rows = document.querySelectorAll('.result-item-row');
            
            rows.forEach(row => {
                const checkbox = row.querySelector('.row-checkbox');
                if (checkbox && !checkbox.disabled) {
                    checkbox.checked = checked;
                    const filePath = checkbox.dataset.path;
                    if (checked) {
                        this.selectedFiles.add(filePath);
                    } else {
                        this.selectedFiles.delete(filePath);
                    }
                }
            });
            this.updateSelectedStats();
        });

        // Custom Scan Path trigger
        document.getElementById('btnSelectScanPath').addEventListener('click', async () => {
            sounds.playClick();
            const path = await window.api.selectFolderToScan();
            if (path) {
                this.customScanPath = path;
                this.customPathText.innerText = path;
                this.customPathDisplay.classList.remove('hidden');
            }
        });

        // Clear Custom Path
        this.clearPathBtn.addEventListener('click', () => {
            sounds.playClick();
            this.customScanPath = null;
            this.customPathDisplay.classList.add('hidden');
        });

        // Results Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                sounds.playClick();
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                this.currentFilter = tab.dataset.filter;
                this.filterResults();
            });
        });
    }

    setupIPC() {
        // Scan progress update
        window.api.onScanProgress((data) => {
            this.scannedCountEl.innerText = data.scanned;
            this.statusText.innerText = `Scanning: ${data.currentDir}`;
            
            // Pulsing radial loader rotation simulation
            const offset = (data.scanned % 100) * 4.4; // animate ring in small cycles while scanning
            this.progressRing.style.strokeDashoffset = offset;
            
            // Radar sound sweeps periodically
            if (data.scanned % 200 === 0) {
                sounds.playRadarSweep();
            }
        });

        // Dynamic file additions
        window.api.onScanFileFound((item) => {
            this.scannedFiles.push(item);
            if (item.recommendation === 'Safe to Delete') {
                this.selectedFiles.add(item.path);
            }
            
            // Incremental totals to avoid O(N^2) calculations on each file
            this.totalJunkSize = (this.totalJunkSize || 0) + item.size;
            if (item.recommendation === 'Safe to Delete') {
                this.selectedJunkSize = (this.selectedJunkSize || 0) + item.size;
            }
            
            this.junkSizeEl.innerText = this.formatSize(this.totalJunkSize);
            this.selectedStatsEl.innerText = `Selected: ${this.selectedFiles.size} files (${this.formatSize(this.selectedJunkSize)})`;

            // Limit rendering in DOM to the first 1000 items to avoid painting overhead and freezing
            if (this.scannedFiles.length <= 1000) {
                this.renderRow(item);
            } else if (this.scannedFiles.length === 1001) {
                const el = document.createElement('div');
                el.className = 'placeholder-message';
                el.style.padding = '12px';
                el.style.textAlign = 'center';
                el.style.color = 'var(--text-muted)';
                el.innerText = '... and more files found (only showing first 1000 for UI performance) ...';
                this.resultsList.appendChild(el);
            }
        });

        // Scan completion handler
        window.api.onScanComplete((summary) => {
            sounds.stopRadarSweep();
            sounds.playSuccess();
            
            this.progressRing.style.strokeDashoffset = 0; // filled
            this.percentText.innerText = '100%';
            this.statusText.innerText = 'Completed';
            this.scannedCountEl.innerText = summary.totalScanned;
            
            this.startBtn.classList.remove('hidden');
            this.cancelBtn.classList.add('hidden');
            
            if (this.scannedFiles.length > 0) {
                this.cleanBtn.classList.remove('hidden');
            }
            
            // Check all safe items automatically
            this.scannedFiles.forEach(file => {
                if (file.recommendation === 'Safe to Delete') {
                    this.selectedFiles.add(file.path);
                }
            });
            this.updateSelectedStats();
            this.refreshCheckboxes();
        });

        window.api.onScanError((err) => {
            sounds.stopRadarSweep();
            alert(`Scanner Error: ${err}`);
            this.statusText.innerText = 'Scan Failed';
            this.startBtn.classList.remove('hidden');
            this.cancelBtn.classList.add('hidden');
        });
    }

    startScan() {
        this.resultsList.innerHTML = '';
        this.scannedFiles = [];
        this.selectedFiles.clear();
        this.selectAll.checked = true;
        this.cleanBtn.classList.add('hidden');
        
        // Reset running totals
        this.totalJunkSize = 0;
        this.selectedJunkSize = 0;
        
        this.startBtn.classList.add('hidden');
        this.cancelBtn.classList.remove('hidden');
        
        this.percentText.innerText = '--';
        this.statusText.innerText = 'Walking system files...';
        this.scannedCountEl.innerText = '0';
        this.junkSizeEl.innerText = '0 MB';
        this.selectedStatsEl.innerText = 'Selected: 0 files (0 MB)';

        sounds.playCleanStart();
        sounds.startRadarSweep();
        
        // Start IPC call to main
        window.api.startScan(this.customScanPath);
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    updateJunkTotals() {
        const totalSize = this.scannedFiles.reduce((acc, f) => acc + f.size, 0);
        this.junkSizeEl.innerText = this.formatSize(totalSize);
    }

    updateSelectedStats() {
        const selectedList = this.scannedFiles.filter(f => this.selectedFiles.has(f.path));
        const totalSize = selectedList.reduce((acc, f) => acc + f.size, 0);
        this.selectedStatsEl.innerText = `Selected: ${selectedList.length} files (${this.formatSize(totalSize)})`;
        
        if (selectedList.length === 0) {
            this.cleanBtn.setAttribute('disabled', 'true');
        } else {
            this.cleanBtn.removeAttribute('disabled');
        }
    }

    renderRow(item) {
        // Clear placeholder if first item
        const placeholder = this.resultsList.querySelector('.placeholder-message');
        if (placeholder) {
            this.resultsList.innerHTML = '';
        }

        const row = document.createElement('div');
        row.className = 'result-item-row';
        row.dataset.category = item.category;
        row.dataset.path = item.path;

        // Checkbox column
        const checkCol = document.createElement('div');
        checkCol.className = 'col-check';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox';
        checkbox.dataset.path = item.path;
        
        // Autocheck safe to delete items
        const isSafe = item.recommendation === 'Safe to Delete';
        checkbox.checked = isSafe;
        if (item.recommendation === 'Keep') {
            checkbox.disabled = true;
            checkbox.checked = false;
        }

        checkbox.addEventListener('change', (e) => {
            sounds.playClick();
            if (e.target.checked) {
                this.selectedFiles.add(item.path);
            } else {
                this.selectedFiles.delete(item.path);
            }
            this.updateSelectedStats();
        });
        checkCol.appendChild(checkbox);
        row.appendChild(checkCol);

        // Name column
        const nameCol = document.createElement('div');
        nameCol.className = 'result-file-details';
        nameCol.innerHTML = `
            <span class="file-name" title="${item.name}">${item.name}</span>
            <span class="file-path" title="${item.path}">${item.path}</span>
        `;
        row.appendChild(nameCol);

        // Recommendation badge column
        const recCol = document.createElement('div');
        recCol.className = 'col-rec';
        let recClass = 'keep';
        if (item.recommendation === 'Safe to Delete') recClass = 'safe';
        if (item.recommendation === 'Review') recClass = 'review';
        
        recCol.innerHTML = `
            <span class="rec-badge ${recClass}" title="${item.reason}">${item.recommendation}</span>
        `;
        row.appendChild(recCol);

        // Size column
        const sizeCol = document.createElement('div');
        sizeCol.className = 'col-size result-size';
        sizeCol.innerText = this.formatSize(item.size);
        row.appendChild(sizeCol);

        // Action direct recycle column
        const actionCol = document.createElement('div');
        actionCol.className = 'col-action';
        
        if (item.recommendation !== 'Keep') {
            const trashBtn = document.createElement('button');
            trashBtn.className = 'action-icon-btn';
            trashBtn.title = 'Clean item now';
            trashBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            `;
            trashBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                sounds.playFileTrash();
                
                const deleteRes = await window.api.deleteFile(item.path, false);
                if (deleteRes.success) {
                    row.classList.add('deleted');
                    setTimeout(() => {
                        row.remove();
                        this.scannedFiles = this.scannedFiles.filter(f => f.path !== item.path);
                        this.selectedFiles.delete(item.path);
                        this.updateJunkTotals();
                        this.updateSelectedStats();
                        this.checkIfEmpty();
                    }, 300);
                } else {
                    alert(`Failed to delete: ${deleteRes.error}`);
                }
            });
            actionCol.appendChild(trashBtn);
        }
        row.appendChild(actionCol);

        // Append to list respecting filters
        const isMatch = this.currentFilter === 'all' || 
                        item.category === this.currentFilter || 
                        (this.currentFilter === 'Unused' && (item.category === 'Unused App' || item.category === 'Unused File'));
        if (!isMatch) {
            row.classList.add('hidden');
        }

        this.resultsList.appendChild(row);
    }

    refreshCheckboxes() {
        const checkboxes = this.resultsList.querySelectorAll('.row-checkbox');
        checkboxes.forEach(box => {
            if (!box.disabled) {
                box.checked = this.selectedFiles.has(box.dataset.path);
            }
        });
    }

    filterResults() {
        const rows = this.resultsList.querySelectorAll('.result-item-row');
        rows.forEach(row => {
            const cat = row.dataset.category;
            const isMatch = this.currentFilter === 'all' || 
                            cat === this.currentFilter || 
                            (this.currentFilter === 'Unused' && (cat === 'Unused App' || cat === 'Unused File'));
            if (isMatch) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
        this.checkIfEmpty();
    }

    checkIfEmpty() {
        const visibleRows = this.resultsList.querySelectorAll('.result-item-row:not(.hidden)');
        if (visibleRows.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder-message';
            placeholder.innerHTML = `
                <svg viewBox="0 0 24 24" width="48" height="48" class="placeholder-icon">
                    <path fill="currentColor" opacity="0.3" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <p>No optimization files found in this category.</p>
            `;
            // Keep the placeholder clean
            const existingPlaceholder = this.resultsList.querySelector('.placeholder-message');
            if (!existingPlaceholder && this.resultsList.querySelectorAll('.result-item-row').length === 0) {
                this.resultsList.appendChild(placeholder);
            }
        } else {
            const placeholder = this.resultsList.querySelector('.placeholder-message');
            if (placeholder) placeholder.remove();
        }
    }

    async cleanSelectedFiles() {
        const toDelete = [...this.selectedFiles];
        if (toDelete.length === 0) return;

        if (!confirm(`Are you sure you want to clean up ${toDelete.length} items? They will be moved to the Recycle Bin.`)) {
            return;
        }

        this.cleanBtn.setAttribute('disabled', 'true');
        this.statusText.innerText = 'Cleaning files...';
        sounds.playFileTrash();
        
        let deletedCount = 0;
        let freedBytes = 0;

        for (const filePath of toDelete) {
            const fileItem = this.scannedFiles.find(f => f.path === filePath);
            const size = fileItem ? fileItem.size : 0;
            
            // Delete file using API
            const res = await window.api.deleteFile(filePath, false); // false = move to trash
            if (res.success) {
                deletedCount++;
                freedBytes += size;
                this.selectedFiles.delete(filePath);
                this.scannedFiles = this.scannedFiles.filter(f => f.path !== filePath);
                
                // Animate row removal in DOM
                const row = this.resultsList.querySelector(`.result-item-row[data-path="${filePath.replace(/\\/g, '\\\\')}"]`);
                if (row) {
                    row.classList.add('deleted');
                    setTimeout(() => row.remove(), 250);
                }
            }
        }

        sounds.playSuccess();
        alert(`Cleanup Complete!\nSuccessfully removed ${deletedCount} files.\nFreed ${this.formatSize(freedBytes)} of space.`);
        
        this.statusText.innerText = 'Optimization Complete';
        this.cleanBtn.classList.add('hidden');
        this.updateJunkTotals();
        this.updateSelectedStats();
        
        // Refresh specs immediately to show updated disk size
        if (window.specsMonitor) {
            window.specsMonitor.updateSpecs();
        }

        setTimeout(() => this.filterResults(), 300);
    }
}

// --- Active Process Manager Controller ---
class TaskManagerController {
    constructor() {
        this.scanBtn = document.getElementById('btnScanProcesses');
        this.processList = document.getElementById('processList');
        this.statsEl = document.getElementById('processStatsSummary');
        this.updateInterval = null;
        this.terminatedPids = new Set(); // Keep track of terminated PIDs to filter out immediately
        
        this.bindEvents();
    }

    bindEvents() {
        if (this.scanBtn) {
            this.scanBtn.addEventListener('click', () => {
                sounds.playCleanStart();
                this.startRealtimeUpdate();
            });
        }
    }

    startRealtimeUpdate() {
        this.stopRealtimeUpdate();
        // Initial scan to show progress
        this.scanProcesses(false);
        // Silent updates every 2 seconds
        this.updateInterval = setInterval(() => {
            this.scanProcesses(true);
        }, 2000);
    }

    stopRealtimeUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    async scanProcesses(silent = false) {
        if (!silent) {
            this.processList.innerHTML = `
                <div class="placeholder-message">
                    <svg viewBox="0 0 24 24" width="48" height="48" class="placeholder-icon animate-pulse" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <p>Retrieving active system processes...</p>
                </div>
            `;
            this.statsEl.innerText = 'Scanning...';
        }
        
        const res = await window.api.getProcesses();
        if (!res.success) {
            if (!silent) {
                sounds.playError();
                this.processList.innerHTML = `<div class="placeholder-message font-error"><p>Error: ${res.error}</p></div>`;
            }
            this.statsEl.innerText = 'Scan failed.';
            return;
        }

        if (!silent) {
            sounds.playSuccess();
        }
        this.renderProcesses(res.processes);
    }

    formatMemory(bytes) {
        if (!bytes) return '0.0 MB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    renderProcesses(processes) {
        const scrollPos = this.processList.scrollTop;
        
        // Filter out any process group where all PIDs are already marked terminated
        const activeProcesses = processes.filter(proc => {
            const pids = String(proc.pids).split(',').map(p => p.trim());
            const allTerminated = pids.every(pid => this.terminatedPids.has(pid));
            return !allTerminated;
        });

        this.processList.innerHTML = '';
        if (activeProcesses.length === 0) {
            this.processList.innerHTML = '<div class="placeholder-message"><p>No active processes found.</p></div>';
            this.statsEl.innerText = 'Scanned: 0 active processes';
            return;
        }

        this.statsEl.innerText = `Scanned: ${activeProcesses.length} process groups. Sorted by memory usage.`;

        activeProcesses.forEach(proc => {
            const row = document.createElement('div');
            row.className = 'process-item-row';
            row.dataset.pids = proc.pids;

            // Name
            const nameCol = document.createElement('div');
            nameCol.className = 'col-proc-name';
            const countSuffix = proc.count > 1 ? ` (${proc.count})` : '';
            nameCol.innerText = proc.name + countSuffix;
            nameCol.title = `${proc.name} (PIDs: ${proc.pids})`;
            row.appendChild(nameCol);

            // CPU
            const cpuCol = document.createElement('div');
            cpuCol.className = 'col-proc-cpu';
            cpuCol.innerText = proc.cpu;
            row.appendChild(cpuCol);

            // Memory
            const memCol = document.createElement('div');
            memCol.className = 'col-proc-mem';
            memCol.innerText = this.formatMemory(proc.memory);
            row.appendChild(memCol);

            // Recommendation
            const recCol = document.createElement('div');
            recCol.className = 'col-proc-rec';
            let badgeClass = 'user-app';
            if (proc.recommendation === 'System Critical') badgeClass = 'system-critical';
            if (proc.recommendation === 'Safe to End') badgeClass = 'safe-end';

            recCol.innerHTML = `
                <span class="proc-rec-badge ${badgeClass}" title="${proc.reason}">${proc.recommendation}</span>
            `;
            row.appendChild(recCol);

            // Action
            const actionCol = document.createElement('div');
            actionCol.className = 'col-proc-action';

            if (proc.recommendation !== 'System Critical') {
                const killBtn = document.createElement('button');
                killBtn.className = 'btn-endtask';
                killBtn.innerText = 'End Task';
                killBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    sounds.playFileTrash();
                    killBtn.setAttribute('disabled', 'true');
                    killBtn.innerText = 'Ending...';

                    // Track PIDs immediately so they disappear in subsequent updates
                    const pids = String(proc.pids).split(',').map(p => p.trim());
                    pids.forEach(pid => this.terminatedPids.add(pid));

                    // Auto clean-up tracking set after 12 seconds to prevent PID recycling overlap
                    setTimeout(() => {
                        pids.forEach(pid => this.terminatedPids.delete(pid));
                    }, 12000);

                    // Visually terminate and fade out row immediately
                    row.classList.add('terminated');
                    setTimeout(() => {
                        row.style.transition = 'all 0.3s ease';
                        row.style.opacity = '0';
                        row.style.height = '0';
                        row.style.padding = '0';
                        row.style.border = 'none';
                        setTimeout(() => row.remove(), 300);
                    }, 300);
                    
                    const endRes = await window.api.endProcess(proc.pids);
                    if (!endRes.success) {
                        // Revert tracking on failure
                        pids.forEach(pid => this.terminatedPids.delete(pid));
                        sounds.playError();
                        alert(`Failed to end process ${proc.name}: ${endRes.error}`);
                        this.scanProcesses(true); // reload list to restore row
                    }
                });
                actionCol.appendChild(killBtn);
            }
            row.appendChild(actionCol);

            this.processList.appendChild(row);
        });

        this.processList.scrollTop = scrollPos;
    }
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize tabs navigation
    initTabs();

    // 2. Initialize Virtual Desktop grid and app actions
    window.desktopController = new DesktopController();

    // 3. Initialize hardware specifications monitor
    window.specsMonitor = new SystemSpecsMonitor();

    // 4. Initialize PC System Optimizer
    window.optimizerController = new OptimizerController();

    // 5. Initialize active Process Manager
    window.taskManagerController = new TaskManagerController();

    // 6. Initialize Display Switcher
    window.displayController = new DisplayController();

    // 7. Trigger AudioContext initialization on first physical interaction
    const initAudioContextOnInteraction = () => {
        sounds.init();
        document.removeEventListener('click', initAudioContextOnInteraction);
        document.removeEventListener('keydown', initAudioContextOnInteraction);
    };
    document.addEventListener('click', initAudioContextOnInteraction);
    document.addEventListener('keydown', initAudioContextOnInteraction);
});
