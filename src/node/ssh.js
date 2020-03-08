import { app, protocol, ipcMain } from 'electron';
const fs = require('fs');
const path = require('path');
const node_ssh = require('node-ssh');

const ssh = new node_ssh();
let mainWindow = null;

const connectSSH = ({host, username, password})=> {
    return new Promise((resove, reject)=> {
        ssh.connect({host, username, password})
            .then(()=> {
                console.log('连接成功');
                resove();
            }).catch(e=> {
                console.log(e);
                reject(e);
            });
    });
};

ipcMain.on('ssh', async (sender, type, data) => {
    // console.log(data);
    switch (type) {
    case 'connect':
        connectSSH(data)
            .then(()=> {
                mainWindow.webContents.send('ssh', {
                    type: 'connect',
                    data: 'success'
                });
            })
            .catch(err=> {
                mainWindow.webContents.send('ssh', {
                    type: 'connect',
                    data: 'error'
                });
            });
        break;
    case 'command:ls':
    case 'command:cat':
    case 'command:xxd':
    case 'command:echo':
        ssh.execCommand(data).then(res=> {
            mainWindow.webContents.send('ssh', {
                type,
                data: {
                    res: res.stdout,
                    command: data
                }
            });
        }).catch(e=> {
            console.log('出错了', e);
            mainWindow.webContents.send('ssh', {
                type,
                data: 'error'
            });
        });
        break;
    case 'exit':
        break;
    }
});

export default (win)=> {
    mainWindow = win;
};