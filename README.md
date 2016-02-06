Shadowsocks Panel
===================

一个比较简单的 ss panel
采用全页面的 Ajax请求
支持PHP7

### 程序截图
![后台](https://static-2.loacg.com/open/static/ss-panel-github/Admin.png)
![前台](https://static-2.loacg.com/open/static/ss-panel-github/member.png)
![前台](https://static-2.loacg.com/open/static/ss-panel-github/member2.png)
![前台](https://static-2.loacg.com/open/static/ss-panel-github/member3.png)

### 配置 Rewrite 路由
nginx
```
if (!-e $request_filename) {
    rewrite (.*) /index.php last;
}
```
apache
```
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]
```

### Composer libs
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
and run comm `php composer install`


Based KK-Framework :
https://github.com/kookxiang/KK-Framework

shadowsocks-manyuser ：
```
https://github.com/sendya/shadowsocks-rm/tree/manyuser
```

### update logs
```
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

Install Shadowsocks-panel
```
git clone https://github.com/sendya/shadowsocks-panel.git
cd shadowsocks-panel
composer install

```