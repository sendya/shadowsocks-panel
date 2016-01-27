Shadowsocks Panel
===================

### update
```
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

### Rewrite 路由
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


Based KK-Framework :
https://github.com/kookxiang/KK-Framework

shadowsocks-manyuser ：
```
https://github.com/sendya/shadowsocks-rm/tree/manyuser
```