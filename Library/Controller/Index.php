<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Template;
use Helper\Mailer;
use Model\Mail;

class Index
{

    /**
     * 进入首页
     */
    public function index()
    {
        Template::setView('home/index');
    }

    public function test()
    {
        $mail = new Mailer();
        $message = new Mail();

        $message->address = 'yladmxa@qq.com';
        $message->content = '<h1>这是h1标题</h1><br/><p>P标签</p><br/><ul><li>aaaaaaaaa</li><li>bbbbbbbbbb</li><li>cccccccccc</li></ul><p>这是一封测试邮件，发送方为：<b>SS Cat Mailer system</b>.</p>';
        $message->subject = '[' . SITE_NAME . '] 听说你有进行PY交易?';

        $result = $mail->send($message);
        var_dump($result);
        exit();
    }

}
