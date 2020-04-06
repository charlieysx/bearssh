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

const mkdirLocalDir = (localPath, root)=> {
    if (root.type === '-') {
        return [root];
    }
    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath);
    }
    const list = [];
    for (let i = 0;i < root.list.length;++i) {
        const item = root.list[i];
        const path = localPath + '/' + item.filename;
        if (item.type === '-') {
            item.localPath = path;
            list.push(item);
        } else {
            list.push(...mkdirLocalDir(path, item));
        }
    }
    return list;
};

let keepAliveInterval = null;
ipcMain.on(IPC.SSH, async (e, type, {data, id}) => {
    switch (type) {
    case SSHTYPE.CONNECT:
        sshClient
            .removeAllListeners()
            .on('ready', ()=> {
                sshClient.shell({rows: 150, cols: 250, term: 'vt100'}, {}, (err, stream) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (stream === false) {
                        console.log('log', 'stream false');
                    } else {
                        if (keepAliveInterval) {
                            clearInterval(keepAliveInterval);
                        }
                        keepAliveInterval = setInterval(() => {
                            if (stream.writable) {
                                // 保持连接
                                stream.write('\b');
                            }
                        }, 1500);
                        stream.once('close', () => {
                            console.log('close');
                        });
                        stream.on('error', err => sendFail(e.sender, id, err));
                        stream.on('data', data => {
                            // console.log('data', data);
                        });
                    }
                });
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
    case SSHTYPE.DOWNLOADFILE:
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }, (files)=> {
            if (files && files.length > 0) {
                sshClient.sftp(function(err, sftp) {
                    if (err) {
                        sendFail(e.sender, id, err);
                        console.log(err);
                        return;
                    }
                    try {
                        sftp.fastGet(data.file.path, files[0] + '/' + data.file.filename, function(err, data) {
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
            }
        });
        break;
    case SSHTYPE.DOWNLOADDIR:
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }, (files)=> {
            if (files && files.length > 0) {
                sshClient.sftp(async function(err, sftp) {
                    if (err) {
                        sendFail(e.sender, id, err);
                        console.log(err);
                        return;
                    }
                    try {
                        const list = mkdirLocalDir(files[0], data.root);
                        for (let i = 0;i < list.length;++i) {
                            console.log(list[i]);
                            await new Promise((resolve, reject)=> {
                                sftp.fastGet(list[i].path, list[i].localPath, function(err, data) {
                                    if (err) {
                                        sftp.end();
                                        reject();
                                        console.log(err);
                                        return;
                                    }
                                    resolve();
                                });
                            });
                        }
                        sendSuccess(e.sender, id, '');
                    } catch(err) {
                        sftp.end();
                        sendFail(e.sender, id, err);
                        console.log(err);
                    }
                });
            }
        });
        break;
    case 'exit':
        break;
    }
});