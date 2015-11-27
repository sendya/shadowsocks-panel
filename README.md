Shadowsocks Panel
===================

### update
```
2015.11.27 : Add page template.
2015.11.05 : Add Invite model. 
```

### Nginx config

    if (!-e $request_filename) {
        rewrite (.*) /index.php last;
    }

Based KK-Framework :
https://github.com/kookxiang/KK-Framework

SS Python Manyuser.
https://github.com/mengskysama/shadowsocks/tree/manyuser