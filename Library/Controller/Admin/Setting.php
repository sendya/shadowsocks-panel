<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/11 9:53
 * Author: Sendya <18x@loacg.com>
 */

namespace Controller\Admin;

use Core\Template;
use Helper\Option;
use Model\User;

/**
 * Class Setting
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Setting {

    /**
     * 系统设置 页面
     */
    public function index() {
        $data['user'] = User::getCurrent();
        $data['custom_plan_name'] = json_decode(Option::get('custom_plan_name'), true);
        $data['custom_transfer_level'] = json_decode(Option::get('custom_transfer_level'), true);
        $data['check_transfer_max'] = Option::get('check_transfer_max');
        $data['check_transfer_min'] = Option::get('check_transfer_min');
        $data['user_test_day'] = Option::get('user_test_day');

        Template::setContext($data);
        Template::setView("admin/setting");
    }

    /**
     * 详细参数 页面
     */
    public function system() {
        $data['user'] = User::getCurrent();
        $data['options'] = Option::getOptions();

        Template::setContext($data);
        Template::setView("admin/system");
    }

    /**
     * 读取option详细配置
     *
     * @JSON
     */
    public function query() {
        $result['error'] = 0;
        $result['message'] = 'success';

        $result['modal'] = Option::get(trim($_GET['option']));
        $result['isArray'] = false;
        return $result;
    }

    /**
     * 修改
     * @JSON
     */
    public function update() {

        $result['error'] = 0;
        $result['message'] = '保存完成';
        if($_POST['option_v'] != null && $_POST['option_k'] != null) {
            Option::set(trim($_POST['option_k']), trim($_POST['option_v']));
            // 初始化一次系统设置
            Option::init();
        }
        return $result;
    }


    /**
     * @JSON
     */
    public function saveOther() {
        // TODO 保存其他设置
        $result['error'] = 1;
        $result['message'] = '功能尚未完成';
        return $result;
    }

    /**
     * @JSON
     */
    public function saveTransfer() {
        // TODO 保存套餐流量定额
        $result['error'] = 1;
        $result['message'] = '功能尚未完成';
        return $result;
    }

    /**
     * @JSON
     */
    public function savePlanCustom() {
        // TODO 保存自定义套餐名称
        $result['error'] = 1;
        $result['message'] = '功能尚未完成';
        return $result;
    }
}