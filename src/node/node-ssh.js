import { app, protocol, ipcMain, dialog } from 'electron';
import IPC from '../IPC';
import SSHTYPE from '../plugins/ssh/type';
const fs = require('fs');
const path = require('path');
const ssh2 = require('ssh2');

const sshClient = new ssh2.Client();

const connectSSH = ({host, username, password})=> {
    return new Promise((resove, reject)=> {
        sshClient.once('ready', (res)=> {
            resove(res);
            console.log('Client :: ready');

            // conn.sftp(function(err, sftp) {
            //     sftp.fastGet('/codebear/www/game/snake/main.js', '/Users/codebear/snake.js', function (data) {
                    
            //         console.log(data);
            //     });
            // });
            // conn.shell(function(err, stream) {
            //     if (err) throw err;
            //     stream.on('close', function() {
            //         console.log('Stream :: close');
            //         // conn.end();
            //         // conn.sftp(function(err, sftp) {
            //         //     if (err) throw err;
            //         //     sftp.readdir('/codebear/www/kanjiaapi', function(err, list) {
            //         //         if (err) throw err;
            //         //         console.dir(list);
            //         //         conn.end();
            //         //     });
            //         // });
            //     }).on('data', function(data) {
            //         console.log('OUTPUT2222: ' + data);
            //         mainWindow.webContents.send('ssh', {
            //             type: 'log',
            //             data
            //         });
            //     }).on('error', function(data) {
            //         console.log('OUTPUT: ' + data);
            //     });
            //     // console.log(stream);
            //     mainWindow.webContents.send('ssh', {
            //         type: 'log',
            //         data: stream
            //     });
            //     // stream.write('showkey -a\n');
            //     // stream.write('cd /codebear\n');
            //     // stream.write('cd test\n');
            // });
        }).once('error', (e)=> {
            console.log(e);
            reject(e);
        }).connect({
            host,
            port: 22,
            username,
            password
        });
    });
};

ipcMain.on('open-directory-dialog', (e)=> {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, (files)=> {
        if (files) {
            e.sender.send('selectedItem', files[0]);
        }
    });
});

const sendSuccess = (sender, id, data)=> {
    sender.send(IPC.SSH, {
        id,
        success: true,
        data
    });
};

const sendFail = (sender, id, data)=> {
    sender.send(IPC.SSH, {
        id,
        success: false,
        data
    });
};

ipcMain.on(IPC.SSH, async (e, type, {data, id}) => {
    switch (type) {
    case SSHTYPE.CONNECT:
        sshClient
            .removeAllListeners()
            .on('ready', ()=> {
                sendSuccess(e.sender, id);
            }).on('error', (err)=> {
                console.log('err', err);
                sendFail(e.sender, id, err);
            }).on('close', (err)=> {
                sendFail(e.sender, -1, {type: 'close'});
            }).connect(data);
        break;
    case SSHTYPE.READDIR:
        sshClient.sftp(function(err, sftp) {
            if (err) {
                sendFail(e.sender, id, err);
                console.log(err);
                return;
            }
            sftp.readdir(data, function(err, list) {
                sftp.end();
                if (err) {
                    console.log(err);
                    sendFail(e.sender, id, err);
                    return;
                }
                sendSuccess(e.sender, id, list);
            });
        });
        break;
    case SSHTYPE.READFILE:
        sshClient.sftp(function(err, sftp) {
            if (err) {
                sendFail(e.sender, id, err);
                console.log(err);
                return;
            }
            try {
                sftp.readFile(data.path, data.encoding, function(err, data) {
                    sftp.end();
                    if (err) {
                        sendFail(e.sender, id, err);
                        console.log(err);
                        return;
                    }
                    sendSuccess(e.sender, id, data);
                });
            } catch(err) {
                sftp.end();
                sendFail(e.sender, id, err);
                console.log(err);
            }
        });
        break;
    case 'exit':
        break;
    }
});