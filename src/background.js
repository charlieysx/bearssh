'use strict';

import { app, protocol, BrowserWindow, Menu } from 'electron';
import {
    createProtocol,
    installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib';
import './node/node-ssh.js';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 750,
        useContentSize: true,
        autoHideMenuBar: true,
        skipTaskbar: false,
        transparent: false,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true
        }
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        console.log(process.env.WEBPACK_DEV_SERVER_URL);
        // Load the url of the dev server if in development mode
        mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        mainWindow.loadURL('app://./index.html');
    }

    mainWindow.on('closed', (e) => {
        mainWindow = null;
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // if (process.platform !== 'darwin') {
    app.quit();
    // }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
        try {
            installVueDevtools();
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString());
        }

    }
    //注册菜单
    const menu = Menu.buildFromTemplate(getMenuData());
    Menu.setApplicationMenu(menu);
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}

/**
 * 注册菜单
 * @returns {[*,*,*,*]}
 */
const getMenuData = function () {
    const template = [
        {
            label: app.getName(),
            submenu: [
                { role: 'about', label: 'bearssh' },
                { type: 'separator' },
                {
                    label: '设置',
                    accelerator: 'CmdOrCtrl+,',
                    click() {
                        mainWindow.webContents.send('config:edit');
                    }
                },
                { type: 'separator' },
                {
                    label: '重新加载',
                    accelerator: 'CmdOrCtrl+R',
                    click() {
                        if (mainWindow) {
                            mainWindow.reload();
                        }
                    }
                },
                { role: 'toggledevtools', label: '开发者工具'},
                { type: 'separator' },
                { role: 'quit', label: '退出' },
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        }
    ];
    return template;
};