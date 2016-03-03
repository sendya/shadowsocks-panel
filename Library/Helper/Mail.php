<?php
/**
 * Project: SS-Panel
 * Author: Sendya <18x@loacg.com>
 * Date: 2016/3/3 22:12
 */

namespace Helper;

use Nette\Mail\Message;
use Nette\InvalidArgumentException;

class Mail extends Message
{

    public $config;
    protected $from;
    protected $to;
    protected $title;
    protected $body;

    /**
     * @param $to 收件人，可多人（多人容易被标记为垃圾邮件）
     * @param $title 邮件标题
     * @param $content 邮件内容
     * @throws InvalidArgumentException
     */
    public static function mail_send($to, $title, $content) {
        global $MAIL;
        $mail = Mail::to($to)
                    ->from($MAIL['from'])
                    ->title($title)
                    ->content($content);
                    if ( $mail instanceof Mail ) {
                        $mailer = new \Nette\Mail\SmtpMailer($mail->config);
                        $mailer->send($mail);
                    }
    }

    function __construct($to)
    {
        global $MAIL;
        $this->config = $MAIL;

        $this->setFrom($this->config['username']);

        if (is_array($to)) {
            foreach ($to as $email) {
                $this->addTo($email);
            }
        } else {
            $this->addTo($to);
        }
    }

    public function from($from = null)
    {
        if (!$from) {
            throw new InvalidArgumentException("邮件发送地址不能为空！");
        }
        $this->setFrom($from);
        return $this;
    }

    public static function to($to = null)
    {
        if (!$to) {
            throw new InvalidArgumentException("邮件接收地址不能为空！");
        }
        return new Mail($to);
    }

    public function title($title = null)
    {
        if (!$title) {
            throw new InvalidArgumentException("邮件标题不能为空！");
        }
        $this->setSubject($title);
        return $this;
    }

    public function content($content = null)
    {
        if (!$content) {
            throw new InvalidArgumentException("邮件内容不能为空！");
        }
        $this->setHTMLBody($content);
        return $this;
    }

}