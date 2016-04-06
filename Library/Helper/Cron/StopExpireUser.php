<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 3:50
 */

namespace Helper\Cron;

use Contactable\ICron;

use Helper\Setting;
use Model\User;

/**
 * 计划任务 - StopExpireUser
 * 自动停止 超流量/使用时间到期 用户
 *
 * @package Helper\Cron
 */
class StopExpireUser implements ICron {

    const STEP = 300; // 5分钟执行一次

    public function run() {

        $users = User::GetUserArrayByExpire();
        $mailPost = false;
//        if (Setting::get('status_mail')) {
//            $mailPost = true;
//            $mailContent = '';
//        }

        foreach ($users as $user) {
            $user->stop();
            /*
            if($mailPost)
                new Mailer(new Mail($user->uid, '用户 {$user->nickname}，您的账户由于未续费超时已停用', $mailContent));
            */
        }

    }
    public function getStep() {
        return time()+self::STEP;
    }
}