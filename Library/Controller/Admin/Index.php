<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use \Core\Template;
use \Model\User;
use \Helper\Util;
use \Helper\Stats;
use Helper\Message;

/**
 * Class Index
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Index
{

    public function index()
    {
        $data['user'] = User::getCurrent();
        $data['flow_num10'] = Stats::dataUsage(0);
        $data['flow_num30'] = Stats::dataUsage(1);
        $data['flow_num100'] = Stats::dataUsage(2);
        $data['flow_max'] = Stats::dataUsage(3);
        $data['userCount'] = Stats::countUser();
        $data['money'] = Stats::countMoney();
        Template::setContext($data);
        Template::setView('admin/index');
    }

}
