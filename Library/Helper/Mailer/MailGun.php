<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/16 23:28
 */


namespace Helper\Mailer;


use Contactable\IMailer;
use Helper\Option;
use Helper\Utils;
use Model\Mail;
use Mailgun\Mailgun as MG;

/**
 * MailGun 邮件代发服务
 * webSite: https://mailgun.com/
 * apiDocs: http://documentation.mailgun.com/
 * Class MailGun
 * @package Helper\Mailer
 */
class MailGun implements IMailer
{
    private $config;

    public function isAvailable()
    {
        $className = Utils::getShortName($this);

        $config = Option::get('MAIL_' . $className);
        if (!$config) {
            $_config = array(
                "mailgun_key" => "key-********************",
                'mailgun_domain' => 'post.mloli.com',
                'from' => 'no-reply@'
            );
            Option::set('MAIL_' . $className, json_encode($_config)); // 设定默认配置
            return false;
        }
        return true;
    }

    public function send(Mail $mail)
    {
        $mg = new MG($this->config['mailgun_key']);
        $status = $mg->sendMessage($this->config['mailgun_domain'], array('from'    => $this->config['from'].$this->config['mailgun_domain'],
            'to'      => $mail->to,
            'subject' => $mail->subject,
            'html'    => $mail->content));
        if(!$status) {
            return false;
        }
        return true;
    }


}