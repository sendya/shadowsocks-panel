<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;
use Helper\Logger;
use Helper\Mailer;
use Helper\Option;
use Helper\Payment\alipay\Alipay;
use Helper\Utils;
use Model\Mail;
use Model\Node;

class Index
{

    /**
     * 进入首页
     */
    public function index()
    {
        Template::setView('Home/index');
    }

    public function test()
    {
        $alipay = new Alipay(Option::get('alipay_conf'));
        $alipay->run();

    }


    public function notify()
    {
        $log = Logger::getInstance();
        $log->debug('ALIPAY Notify');
        echo 'success';
        exit();
    }
}
