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

class Cron extends AdminListener {

    public function index() {
        global $user;
        $cronList = CronModel::getCronArray();

        include Template::load('/admin/cron');
    }

}