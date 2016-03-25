<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/26 0:07
 */


namespace Helper;


class Mailer {

    private $setting;

    function __construct() {

    }

    public function send() {


    }

    public function isAvailable() {
        return false;
    }

    public function getSetting($key) {
        if(!$this->setting) $this->loadSetting();
        return $this->setting[$key];
    }

    public function loadSetting() {
        $this->setting = Setting::get("mail_".$this->id);
        if($this->setting) return;
        $this->setting = array();

        if($this->config) {
            foreach($this->config as $k => $v) {

            }
        }

    }

}