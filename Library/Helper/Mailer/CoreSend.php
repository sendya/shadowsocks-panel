<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/31 22:34
 */


namespace Helper\Mailer;

use Contactable\Mailer;
use Helper\Option;
use Model\Mail as MailModel;

/**
 * Class CoreSend
 * @description 通过 PHP 的 Mail() 函数发送邮件
 * @package Helper\Mailer
 */
class CoreSend implements Mailer
{

    /**
     * Send mail
     * @param MailModel $mail
     * @return bool true if the mail was successfully accepted for delivery, false otherwise.
     */
    public function send(MailModel $mail)
    {
        $address = $mail->address;
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html;charset=utf-8\r\n";
        $headers .= "Content-Transfer-Encoding: Base64\r\n";
        $headers .= 'From: =?UTF-8?B?' . base64_encode(SITE_NAME) . '?= <' . $this->_get_setting('from') . ">\r\n";
        $result = mail($address, '=?UTF-8?B?' . base64_encode($mail->subject) . '?=', base64_encode($mail->message),
            $headers);
        return $result;
    }

}