<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/31 22:34
 */


namespace Helper\Mailer;

use Contactable\IMailer;
use Helper\Option;
use Helper\Utils;
use Model\Mail;

/**
 * Class CoreSend
 * @description 通过 PHP 的 Mail() 函数发送邮件
 * @package Helper\Mailer
 */
class CoreSend implements IMailer
{
    private $config;

    public function isAvailable()
    {
        $className = Utils::getShortName($this);

        $config = Option::get('MAIL_' . $className);
        if (!$config) {
            $_config = array(
                'from' => '某科学的H本 <h@loacg.com>'
            );
            Option::set('MAIL_' . $className, json_encode($_config)); // 设定默认配置
            return false;
        }
        return true;
    }

    /**
     * Send mail
     * @param Mail $mail
     * @return bool true if the mail was successfully accepted for delivery, false otherwise.
     */
    public function send(Mail $mail)
    {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html;charset=utf-8\r\n";
        $headers .= "Content-Transfer-Encoding: Base64\r\n";
        $headers .= 'From: ' . $this->config['from'] . "\r\n";
        $result = mail($mail->to, $mail->subject, base64_encode($mail->content), $headers);
        return $result;
    }

    public function __construct()
    {
        $className = Utils::getShortName($this);
        $this->isAvailable();

        $config = Option::get('MAIL_' . $className);
        if (!$config) {
            throw new Error("邮件模块 " . $className . " 配置不完整，无法使用。");
        }

        $this->config = json_decode($config, true);
    }

}