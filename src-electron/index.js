/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process.
 * 
 * This file is compiled to `./app/main.prod.js` using webpack. This gives us
 * some performance wins.
 */

import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';

// Keep a global reference of the window object. If you do not, the window will
// be closed automatically when the Javascript object is garbage collected.
let mainWindow = null;

// Mainwindow Creation
function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            webSecurity: false
        },
        titlebarAppearsTransparent: true
    })

    mainWindow.loadURL(
        isDev 
        ? 'http://localhost:3000' 
        : `file://${path.join(__dirname, '../../build/index.html')}`
    );

    if(isDev) {
        const {
            default: installExtension,
            REACT_DEVELOPER_TOOLS
        } = require('electron-devtools-installer');

        installExtension(REACT_DEVELOPER_TOOLS)
        .then(name => {
            console.log(`Added Extension: ${name}`);
        })
        .catch(err => {
            console.log('An error occurred: ', err);
        });

        // Open the devtools
        mainWindow.webContents.openDevTools();
    }

    // For distribution testing, open dev tools as well
    // mainWindow.webContents.openDevTools();

    ipcMain.on('getDirname', () => {
        mainWindow.webContents.send(
            'getDirname', 
            (isDev) ? path.join(__dirname, "../app/src-electron") : __dirname
        );
    });

    // Once the content is ready to show, display the window
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        ipcMain.on('open-external-window', (event, arg) => {
            shell.openExternal(arg);
        });
    })

    // Emitted when the window is closed
    mainWindow.on('closed', () => {
        // Dereference the window object. Usually you would store windows in an 
        // array if your app supports multi-windows. This is the time when you
        // should delete the corresponding element.
        mainWindow = null;
    })
}

// This method will be called when Electron has finished initialization and is
// ready to create browser windows. Some APIs can only be used after this event
// occurs.
app.on('ready', () => {
    createWindow();
})

app.on('window-all-closed', () => {
    // On macOS, it is common for applications and their menu bar to stay
    // active until the user quits explicitly with Cmd+Q.
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    // On macOS, it is common to re-create a window in the app when the dock
    // icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
})
