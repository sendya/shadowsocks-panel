<?php
/**
 * shadowsocks-panel
 * Add: 2016/03/27 03:50
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper\Cron;

use Contactable\ICron;

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
        $notificationMail = false;

        foreach ($users as $user) {
            $user->stop();
            if ($notificationMail) {
                new Mailer(new Mail($user->uid, '用户 {$user->nickname}，您的账户由于未续费超时已停用', $mailContent));
            }
        }

    }

    public function getStep()
    {
        return time() + self::STEP;
    }
}