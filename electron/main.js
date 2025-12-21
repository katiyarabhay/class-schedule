const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextApp;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';

    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
const { ipcMain } = require('electron');

app.on('ready', () => {
    // Handle Schedule Generation IPC
    ipcMain.handle('generate-schedule', async (event, data) => {
        return new Promise((resolve, reject) => {
            // Determine script path:
            // In dev: process.cwd() / scripts / scheduler.py
            // In prod: process.resourcesPath / scripts / scheduler.py (we need to ensure scripts are copied)
            const scriptPath = app.isPackaged
                ? path.join(process.resourcesPath, 'scripts', 'scheduler.py')
                : path.join(__dirname, '..', 'scripts', 'scheduler.py');

            // Python Path
            // Ideally should be bundled or configurable. For now using the known system path as per previous config.
            const pythonPath = 'C:\\Users\\abhay\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe';

            console.log('Spawning Python:', pythonPath, scriptPath);

            const pythonProcess = spawn(pythonPath, [scriptPath]);
            let outputData = '';
            let errorData = '';

            pythonProcess.stdin.write(JSON.stringify(data));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (chunk) => {
                outputData += chunk.toString();
            });

            pythonProcess.stderr.on('data', (chunk) => {
                errorData += chunk.toString();
                console.error('Python Stderr:', chunk.toString());
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Scheduler process exited with code ${code}: ${errorData}`));
                } else {
                    try {
                        const result = JSON.parse(outputData);
                        resolve(result);
                    } catch (e) {
                        reject(new Error(`Failed to parse output: ${outputData}`));
                    }
                }
            });
        });
    });

    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

