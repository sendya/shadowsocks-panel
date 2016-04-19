<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/16 23:58
 */


namespace Controller\Admin;


use Core\Template;
use Helper\Option;
use Model\Mail;
use Model\User;
use Helper\Mailer as Mailer1;

class Mailer
{

    public function index()
    {

        $data['user'] = User::getCurrent();
        Template::setContext($data);
        Template::setView('admin/mailer');
    }

    public function postAll()
    {
        $subject = $_POST['mailer_subject'];
        $content = $_POST['mailer_content'];
        if($subject == null || $subject == '' || $content == null || $content == '') {
            return array('error' => 1, 'message' => '请求错误，您提交的参数不对。');
        }

        $users = User::getUserList();

        $mailer = Mailer1::getInstance();
        $mailer->toQueue(true);

        $mail = new Mail();
        $mail->subject = $subject;
        $mail->content = $content;

        foreach($users as $user) {
            $mail->to = $user->email;
            $mailer->send($mail);
        }

        Option::set('mail_queue', 1);

        return array('error' => 1, 'message' => '群邮件已经加入列队正在发送中..');
    }

}