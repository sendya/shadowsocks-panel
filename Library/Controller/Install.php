<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Helper\Key;
use Core\Response;

class Install {
//GetConfig

    public function index() {
        // Default router
    }

    public function initSalt() {
        $lockFile = ROOT_PATH . 'install.lock';
        $configFile = DATA_PATH . 'Config.php';
        // sql
        //Migrations

        //判断是否已经安装.
        if (!file_exists($configFile)) {
            copy(DATA_PATH . 'Config.simple.php', $configFile);
        }
        if (!file_exists($lockFile)) {
            Key::SetConfig("ENCRYPT_KEY", Key::CreateKey());
            Key::SetConfig("COOKIE_KEY", Key::CreateKey());
            file_put_contents($lockFile, "");
            echo "安装成功..即将跳转";
            Response::redirect("/");
        } else {
            throw new Error("程序已经安装，重置KEY将导致账户无法登陆，已禁止操作。<br/>若要强制重置，请删除程序目录下的install.lock", 555);
        }
    }

}