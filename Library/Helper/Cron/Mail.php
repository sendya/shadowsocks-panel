<?php
/**
 * shadowsocks-panel
 * Add: 2016/5/25 8:56
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper\Cron;


use Interfaces\ICron;
use Helper\Logger;
use Helper\Mailer;
use Helper\Option;
use Model\Mail as MMail;

class Mail implements ICron
{
    const STEP = 60; // 1分钟执行一次

    public function run()
    {
        if (!Option::get('mail_queue')) {
            return;
        }
        Logger::getInstance()->info('mail queue running..');
        $mailer = Mailer::getInstance();
        $mailer->toQueue(false, true); // set to queue.
        $mailQueue = MMail::getQueueList();
        if (count($mailQueue) >0) {
            foreach ($mailQueue as $mail) {
                $mail->delete();
                $mail->content = htmlspecialchars_decode($mail->content);
                Logger::getInstance()->info('send mail to ' . $mail->to);
                $mailer->send($mail);
            }
        } else {
            Option::set('mail_queue', 0);
        }
    }

    public function getStep()
    {
        return time() + self::STEP;
    }

}