Shadowsocks Panel
===================

一个比较简单的 ss panel
采用全页面的 Ajax请求
支持PHP5.2+ ~ PHP7 (需要 PDO支持模块, nginx url重写)

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
```mysql
create table sspanel;
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
```bash
$ git clone -b manyuser https://github.com/sendya/shadowsocks.git
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
$ vim ./config.json
```


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


框架基于 [KK-Framework](https://github.com/kookxiang/KK-Framework)。
使用SS服务端：`shadowsocks-manyuser`
shadowsocks-manyuser ：
```
https://github.com/sendya/shadowsocks-rm/tree/manyuser
```

### update logs
```
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
