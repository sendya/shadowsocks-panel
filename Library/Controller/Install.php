<?php

namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Encrypt;
use Helper\Key;

class Install {
//GetConfig
    
    public function index() {
        
    }
    
    public function initSalt() {
        $lockFile = ROOT_PATH . "install.lock";
        //判断是否已经安装.
        if(!file_exists($lockFile)) {
            Key::SetConfig("ENCRYPT_KEY", Key::CreateKey());
            Key::SetConfig("COOKIE_KEY", Key::CreateKey());
            file_put_contents($lockFile, "");
        } else {
            throw new Error("程序已经安装，重置KEY将导致账户无法登陆，已禁止操作。<br/>若要强制重置，请删除程序目录下的install.lock", 555);
        }
    }

}