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

程序要求PHP版本为 **PHP5.5+** ~ **PHP7** ，推荐使用PHP7。

### 安装教程
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
**任何情况出现 `Permission denied` 请对该文件设定权限**
**任何情况出现 `system()` 报错，请运行php函数 system**

请将`nginx`的 网站根目录路径指向到 `Public` 而不是 `shadowsocks-panel` 目录。
[nginx 配置例子](#setNginx)

选择1. 配置`nginx`伪静态规则
```nginx
if (!-e $request_filename) {
    rewrite (.*) /index.php last;
}
```
选择2. 配置`apache`伪静态规则
```apache
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```


配置`CRON`计划任务
```bash
$ crontab -e
$ * * * * * /usr/bin/curl https://yourdomain.com/cron
# 保存退出
```

##### 访问您的网站并注册第一个账户（默认第一个账户为 管理员账户）


> 注意：  
> 由于旧版本与新版本加密函数完全不同，既无法从旧版本平滑迁移数据到新版本。
> 从旧版本导入用户数据到新版本后 请通知用户使用`找回密码`功能重置一次密码(请设定好服务器mail配置)


other
-----
<a href="#setNginx">nginx 配置例子</a>
```nginx
server{
    listen 80;
    server_name sscat.it www.sscat.it;
    access_log /home/wwwlogs/sscat_nginx.log combined;
    index index.html index.htm index.php;
    
    if (!-e $request_filename) {
        rewrite (.*) /index.php last;
    }
    root /home/wwwroot/shadowsocks-panel/Public;
    
    location ~ [^/]\.php(/|$) {
        fastcgi_split_path_info ^(.+?\.php)(/.*)$;
        if (!-f $document_root$fastcgi_script_name) {
            return 404;
        }
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```
