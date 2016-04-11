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

    public function index() {
        $data['user'] = User::getCurrent();
        $data['options'] = Option::getOptions();

        Template::setContext($data);
        Template::setView("admin/setting");
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
}