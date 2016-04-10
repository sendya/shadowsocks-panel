<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 12:02
 */

namespace Controller\Admin;

use Core\Template;
use Model\Cron as CronModel;
use Model\User;

/**
 * Class Cron
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Cron {

    public function index() {
        $data['user'] = User::getCurrent();
        $data['cronList'] = CronModel::getCronArray();
        Template::setContext($data);
        Template::setView('admin/cron');
    }

}