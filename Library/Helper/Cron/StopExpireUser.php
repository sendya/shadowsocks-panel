<?php
/**
 * shadowsocks-panel
 * Add: 2016/03/27 03:50
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper\Cron;

use Contactable\ICron;

use Helper\Mailer;
use Helper\Option;
use Model\Mail;
use Model\User;

/**
 * 计划任务 - StopExpireUser
 * 自动停止 超流量/使用时间到期 用户
 *
 * @package Helper\Cron
 */
class StopExpireUser implements ICron
{
    const STEP = 300; // 5分钟执行一次

    public function run()
    {
        $users = User::getUserArrayByExpire();
        $notificationMail = Option::get('mail_stop_expire_notification');;
        $mailContent = Option::get('mail_stop_expire_content');

        $mailer = Mailer::getInstance();
        $mailer->toQueue(true);

        foreach ($users as $user) {
            $user->stop();
            if ($notificationMail) {
                $mail = new Mail();
                $mail->to = $user->email;
                $mail->subject = "用户 {$user->nickname}，您的账户由于未续费超时已停用";
                $mail->content = $mailContent;
                $mailer->send($mail);
            }
        }
        // 避免频繁更新 Option 单例对象，循环结束后再执行
        if ($notificationMail) {
            Option::set('mail_queue', 1);
        }
    }

    public function getStep()
    {
        return time() + self::STEP;
    }
}