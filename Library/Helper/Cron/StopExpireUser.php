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
use Helper\Utils;
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
        $notificationMail = Option::get('mail_stop_expire_notification');
        $mailContent = Option::get('custom_mail_stop_expire_content');

        if(!$notificationMail) {
            Option::set('mail_stop_expire_notification', 0); // 设置邮件提醒的系统参数
        }

        $mailer = Mailer::getInstance();
        $mailer->toQueue(true);

        foreach ($users as $user) {
            $user->stop();
            if ($notificationMail) {
                $mail = new Mail();
                $mail->to = $user->email;
                $mail->subject = '[' . SITE_NAME . '] ' . "用户 {$user->nickname}，您的账户由于未续费或流量超用已被暂停服务";
                $params = [
                    'nickname'  => $user->nickname,
                    'email'     => $user->email,
                    'useTraffic'=> Utils::flowAutoShow($user->flow_up+$user->flow_down),
                    'transfer'  => Utils::flowAutoShow($user->transfer),
                    'expireTime'=> date('Y-m-d H:i:s', $user->expireTime)
                ];
                $mailContent = Utils::placeholderReplace($mailContent, $params);
                $mail->content = $mailContent;
                $mailer->send($mail);
            }
        }
        // 避免频繁更新 Option 单例对象，循环结束后再执行
        if ($notificationMail) {
            Option::set('mail_queue', 1);
        }

        User::getUserArrayByExpireEnable(); // 启用已续费且流量未超过的用户
    }

    public function getStep()
    {
        return time() + self::STEP;
    }
}