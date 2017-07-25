<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 8/10/2016 10:49 PM
 */

namespace Controller\Admin;

use \Helper\Stats;
use Helper\Message;
use \Core\Template;
use \Model\User;
/**
 * Class Index
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Home
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
        Template::setView('Xenon/admin/index');
    }
}