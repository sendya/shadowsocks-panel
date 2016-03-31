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

class StopExpireUser implements ICron {

    const STEP = 300;

    public function run() {

        $users = User::GetUserArrayByExpire();
        $mailPost = false;
        if (Setting::get('status_mail')) {
            $mailPost = true;
            $mailContent = '';
        }

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