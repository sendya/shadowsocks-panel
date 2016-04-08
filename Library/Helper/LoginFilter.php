<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 14:01
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;


use Core\Error;
use Core\IFilter;
use Core\Template;
use Helper\Message;
use Model\User;
use ReflectionMethod;
use ReflectionObject;

class LoginFilter implements IFilter {

    private $data = array('error' => 1, 'message' => '尚未登陆或上次登录已失效，请重新登陆');
    protected $isJson = false;
    protected $black = false;

    public function preRoute(&$path) {

    }

    public function afterRoute(&$className, &$method) {

        $user = User::getCurrent();

        $reflection = new ReflectionMethod($className, $method);
        $docComment = $reflection->getDocComment();
        $this->isJson = $this->isJSON($docComment);
        if(strpos($docComment, '@Authorization') !== false && !$user) {
            $this->black = true;
        }
        $reflection = new ReflectionObject(new $className);
        $docComment = $reflection->getDocComment();
        if(strpos($docComment, '@Authorization') !== false && !$user) {
            $this->black = true;
        }

        if($this->black) {
            if($this->isJson) {
                Template::setContext($this->data);
            } else {
                Message::show('a', 'auth/login', 3);
            }
        }
    }

    public function preRender() {

    }

    public function afterRender() {


    }

    public function redirect(&$targetUrl) {

    }

    private function isJSON($docComment) {
        if(strpos($docComment, '@JSON') !== false)
            return true;
        return false;
    }

}