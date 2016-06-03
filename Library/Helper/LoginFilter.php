<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 14:01
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;


use Core\Error;
use Core\Filter;
use Core\IFilter;
use Core\Template;
use Helper\Message;
use Model\User;
use ReflectionMethod;
use ReflectionObject;

class LoginFilter implements IFilter
{

    private $data = array('error' => 1, 'message' => '尚未登录或上次登录已失效，请重新登录');
    protected $isJson = false;
    protected $black = false;

    public function preRoute(&$path)
    {
        if (substr($path, -5) == '.json') {
            $this->isJson = true;
        }
    }

    public function afterRoute(&$className, &$method)
    {

        $user = User::getCurrent();


        $reflection = new ReflectionMethod($className, $method);
        $docComment = $reflection->getDocComment();
        // $this->isJson = $this->isJSON($docComment);
        if (strpos($docComment, '@Authorization') !== false && !$user) {
            $this->black = true;
        }
        $reflection = new ReflectionObject(new $className);
        $docCommentC = $reflection->getDocComment();
        if (strpos($docCommentC, '@Authorization') !== false && !$user) {
            $this->black = true;
        }
        if (strpos($docComment, '@Admin') !== false || strpos($docCommentC, '@Admin') !== false) {
            if ($user && !$user->isAdmin()) {
                $this->data['message'] = '你不是管理员，无法访问此页面';
                $this->black = true;
            }
        }
        if ($this->black) {
            if ($this->isJson) {
                Template::setContext($this->data);
                Filter::preRender();
            } else {
                Message::show($this->data['message'], 'auth/login', 3);
            }
        }
    }

    public function preRender()
    {

    }

    public function afterRender()
    {


    }

    public function redirect(&$targetUrl)
    {

    }

    private function isJSON($docComment)
    {
        if (strpos($docComment, '@JSON') !== false) {
            return true;
        }
        return false;
    }

}