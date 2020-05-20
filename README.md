## bearssh

这是一个基于electron-vue和ssh2开发的ssh可视化操作软件，UI模仿mac osx系统

使用ssh2连接：[https://github.com/mscdex/ssh2](https://github.com/mscdex/ssh2)

自带编辑器使用monaco-editor开发：[https://github.com/microsoft/monaco-editor](https://github.com/microsoft/monaco-editor)

### 图片预览

![1.gif](http://bearfile.codebear.cn/bearssh/1.gif)

![login.jpg](http://bearfile.codebear.cn/bearssh/login.jpg)

![home.jpg](http://bearfile.codebear.cn/bearssh/home.jpg)

![folder.jpg](http://bearfile.codebear.cn/bearssh/folder.jpg)

![editor.jpg](http://bearfile.codebear.cn/bearssh/editor.jpg)

![image.jpg](http://bearfile.codebear.cn/bearssh/image.jpg)

### 功能

- [ ] 支持播放音乐、视频文件
- [ ] 支持编辑文件内容
- [ ] 添加日历、计算器等工具
- [ ] 支持重命名文件、文件夹
- [ ] 支持复制、移动、粘贴、剪切文件、文件夹
- [x] 支持删除文件
- [x] 支持上传文件、文件夹
- [x] 支持下载文件、文件夹
- [x] 支持查看图片
- [x] 支持查看部分文件内容
- [x] 查看文件夹、文件
- [x] 登录

### 说明

目前只在mac osx系统上跑，没有在其他平台测试过。

### 使用
1、下载代码
```
git clone https://github.com/CB-ysx/bearssh.git
```
2、安装依赖
```
npm i
```
3、调试
```
npm run electron:serve
```
4、构建成app
```
npm run electron:build
```

以上功能如有其他更好的实现思路，欢迎讨论~