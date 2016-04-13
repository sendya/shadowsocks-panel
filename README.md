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

程序最低要求PHP版本为 **PHP5.5+** ~ **PHP7**

### 安装教程
将最新的 `releases` 下载并解压
复制一份 `./Data/Config.simple.php` 为 `./Data/Config.php`
```bash
# 设定 Data 目录读写权限
chmod -R 777 ./Data/
# 配置数据库名及数据库账户密码
vim ./Data/Config.php

# 开始执行安装
php index.php install
```
请将`nginx`的 网站根目录路径指向到 `Public` 而不是 `shadowsocks-panel` 目录。
[nginx 配置例子](#setNginx)

配置`nginx`伪静态规则
```nginx
if (!-e $request_filename) {
    rewrite (.*) /index.php last;
}
```

配置`CRON`计划任务
```bash
$ crontab -l
$ * * * * * /usr/bin/curl https://domain.com/cron
# 保存退出
```

##### 访问您的网站并注册第一个账户（默认第一个账户为 管理员账户）


> 注意：
> 由于旧版本与新版本加密函数完全不同，既无法从旧版本平滑迁移数据到新版本。
> 从旧版本导入用户数据到新版本后 请通知用户使用`找回密码`功能重置一次密码(请设定好服务器mail配置)
> 请不要直接 `git clone` 代码下来安装。 除非你愿意自己构建 `js`和`css`。


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
	location ~ .*\.(php|php5)?$  {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi.conf;
    }
}
```
