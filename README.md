Shadowsocks Panel
===================

一个比较简单的 ss panel  
采用全页面的 Ajax请求  
支持PHP5.2+ ~ PHP7 (需要 PDO支持模块, nginx url重写)  

旧版本分支 [old-sspanel（原V2上改版）](https://github.com/sendya/shadowsocks-panel/tree/old-sspanel)  
### 程序截图
![后台](https://static-2.loacg.com/open/static/ss-panel-github/Admin.png)
![前台](https://static-2.loacg.com/open/static/ss-panel-github/member.png)
![前台](https://static-2.loacg.com/open/static/ss-panel-github/member2.png)
![前台](https://static-2.loacg.com/open/static/ss-panel-github/member3.png)

### 1. 安装
```bash
$ git clone https://github.com/sendya/shadowsocks-panel.git
$ cd shadowsocks-panel
$ composer install
```

### 2. 更改面板程序配置/导入MySQL数据  
(暂无法支持phinx自动导入MySQL数据库)
```bash
$ cp ./Data/Config.simple.php ./Data/Config.php
$ vim ./Data/Config.php
$ chmod -R 777 ./Data/
$ mysql -uroot -p
```

#### 2.1 线上环境时请关闭配置文件中的几项配置  
```php
define('DEBUG_ENABLE', false);
define('TEMPLATE_UPDATE', false);

// 数据库连接
Core\Database::register('mysql:dbname=sspanel;host=localhost;charset=UTF8', 'user', 'password');
```

```mysql
create database sspanel;
use sspanel;
source /你的sspanel目录/Data/Shadowsocks-planel-DB.sql
```

### 3. 配置程序路由
(不配置只能访问 首页,其余页面全部404！注)
#### 3.1 NGINX
```nginx
if (!-e $request_filename) {
    rewrite (.*) /index.php last;
}
```
#### 3.2 APACHE
```apache
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```
----------


### 4. 安装Shadowsocks-manyuser服务端

目前支持版本：  原版 `manyuser` , `UDP support manyuser` , `manyuser-rss`
请选其一，还有一个golang manyuser的。   
其实也支持最初始的 manyuser版本，请自行修改sql查询字符串即可  
```bash
# 版本1 （支持udp， 有点小问题，基本上一天会炸一次线程导致连不上数据库无法同步）
$ git clone -b manyuser https://github.com/sendya/shadowsocks-rm.git
$ cd shadowsocks-rm/shadowsocks
# 版本2 （原 shadowsocks py manyuser）
$ git clone -b manyuser https://github.com/sendya/shadowsocks.git
$ cd shadowsocks/shadowsocks
# 版本3 （*版 shadowsocks-R manyuser）
$ git clone -b manyuser-rss https://github.com/sendya/shadowsocks.git
$ cd shadowsocks/shadowsocks
```
#### 4.1 CentOS:
```bash
$ yum install m2crypto python-setuptools
$ easy_install pip
```
#### 4.2 Debian / Ubuntu:
```bash
$ apt-get install python-pip python-m2crypto
```
#### 4.3 安装 cymysql支持
```bash
pip install cymysql
```

#### 4.4 编辑多用户版配置文件
```bash
$ vim ./Config.py
$ python server.py
```
#### 4.5 多用户版`UDP support manyuser``支持UDP,请注意开放端口  
#### 4.6 多用户版`shadowsocks-R manyuser` 启动不需要带config.json配置文件，原本需要  

### *. 可选更换composer中国地区同步源
if your in china , please edit `composer.json` content, add content to composer config
```
		,
    "repositories": {
        "packagist": {
            "type": "composer",
            "url": "http://packagist.phpcomposer.com"
        }
    }
```

提供一个 `systemd` 服务脚本，写进 `/etc/systemd/system/shadowsocks-py.service` 即可，记得修改其中的运行组以及运行路径

```systemd
[Unit]
Description=Shadowsocks Proxy Services(Py ManyUser)
After=syslog.target
After=network.target

[Service]
Type=simple
User=shadowsocks
Group=shadowsocks
WorkingDirectory=/home/shadowsocks
ExecStart=/usr/bin/python /home/shadowsocks/shadowsocks/server.py -c /home/shadowsocks/shadowsocks/config.json
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s QUIT $MAINPID
Restart=always
Environment="USER=shadowsocks","HOME=/home/shadowsocks"

[Install]
WantedBy=multi-user.target
```

框架基于 [KK-Framework](https://github.com/kookxiang/KK-Framework)。
使用SS服务端：`shadowsocks-manyuser`
shadowsocks-manyuser ：
```
https://github.com/sendya/shadowsocks-rm/tree/manyuser
```

### update logs
```
2016.03.17 :
    测试版发布.
    
2016.02.11~03.03 :
    Added Mailer
    ForgePassword is available
    Node info send to Mail

2016.02.05~02.06 :
	Update sql(default db insert.)
	Add admin page
	Add nodeList/nodeAdd/nodeModify/nodeDelete

2016.01.13~01.27 :
	Fix bug
	Login diff
	Add migr
	create Alpha.01 version.

2016.01.02 :
	Create install setp
	Fix bug

2015.12.14 : 
	Fix admin/ router
	Add user power(admin table)
	Update sql

2015.12.09 : 
	Add register page auto value func
	exp: http://local.dev/Auth/login?invite=9973C1D6A6557CCF#register
	(?invite=your invite code)
	Fix login/register page Button disabled check
	----------------
	body on ajax load

2015.12.08 : 
	upport PHP7.
	Fix user register
	Fix inviteCode check
	Fix inivte update info
	Fix member lastConnTime
	...
	Add Message model & db sql
	Fix member node number count

2015.11.29 :
	Add page invite, changepassword

2015.11.27 :

	Add page template.
2015.11.05 :

	Add Invite model. 
```
