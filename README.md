Shadowsocks Panel
===================

### Nginx config

    if (!-e $request_filename) {
        rewrite (.*) /index.php last;
    }

Based KK-Framework :
https://github.com/kookxiang/KK-Framework

SS Python Manyuser.
https://github.com/mengskysama/shadowsocks/tree/manyuser