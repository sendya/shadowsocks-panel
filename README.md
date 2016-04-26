## Shadowsocks Panel

**A simple Shadowsocks management system**

全新面板发布啦

> 更加安全的权限管理
> 超简洁的 注解式代码
> 优化各种操作
> 	1. 用户端个人资料修改/卡号充值优化
> 	2. 邀请码添加逻辑优化, 全无刷新展示列表
> 	3. 管理端各个增删改功能优化
> 	4. 各项系统属性动态控制
> 	5. 计划任务管控

程序要求PHP版本为 **PHP5.5** ~ **PHP7** ，推荐使用PHP7。

### Quick Start
```bash
# 方式一：克隆最新版本
cd /home/wwwroot/
git clone https://github.com/sendya/shadowsocks-panel.git
cd shadowsocks-panel

# 方式二：下载稳定版本（推荐）
# 前往 https://github.com/sendya/shadowsocks-panel/releases ，下载最新的release版本（当前版本：v1.04）
wget https://github.com/sendya/shadowsocks-panel/releases/download/sspanel-v1.04/shadowsocks-panel-v1.04.zip -O shadowsocks-panel.zip
# 解压到 /home/wwwroot/shadowsocks-panel/
$ unzip -o -d /home/wwwroot/shadowsocks-panel/ shadowsocks-panel.zip
$ cd /home/wwwroot/shadowsocks-panel/

# 设定 Data 目录读写权限
chmod -R 777 ./Data/
# 复制一份 ./Data/Config.simple.php 为 ./Data/Config.php
cp ./Data/Config.simple.php ./Data/Config.php
# 配置数据库名及数据库账户密码(代码最下面)
vim ./Data/Config.php

# 开始执行安装
php index.php install
```

### Documentation
详细的安装配置文档请移步 [Wiki](https://github.com/sendya/shadowsocks-panel/wiki)
