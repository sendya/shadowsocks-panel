<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 13:14
 */

namespace Controller;


class Test {

    public function index() {
        $plan = 'B';
        if(!ENABLE_PLAN_A || $plan != 'A')
            echo '执行端口设定';
    }
}