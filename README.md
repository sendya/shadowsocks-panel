Shadowsocks Panel
===================

### update
```
2015.12.08 : Support PHP7.
						 Fix user register
						 Fix inviteCode check
						 Fix inivte update info
						 Fix member lastConnTime
2015.11.29 : Add page invite, changepassword..
2015.11.27 : Add page template.
2015.11.05 : Add Invite model. 
```

### Nginx config

    if (!-e $request_filename) {
        rewrite (.*) /index.php last;
    }




Based KK-Framework :
https://github.com/kookxiang/KK-Framework
