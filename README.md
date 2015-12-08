Shadowsocks Panel
===================

### update
```
2015.12.09 : 
	Add register page auto value func
	exp: http://local.dev/Auth/login?invite=9973C1D6A6557CCF#register
	(?invite=your invite code)
	Fix login/register page Button disabled check

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

### Nginx config

    if (!-e $request_filename) {
        rewrite (.*) /index.php last;
    }




Based KK-Framework :
https://github.com/kookxiang/KK-Framework
