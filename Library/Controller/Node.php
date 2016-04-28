<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Message;
use Helper\Utils;
use Model\User;
use Model\Node as NodeModel;

/**
 * Class Node
 * @Authorization
 * @package Controller
 */
class Node
{
    public function Index()
    {
        throw new Error("无知的人类啊", 555);
    }

    /**
     * @throws Error
     */
    public function qrCode()
    {
        $id = trim($_REQUEST['id']);
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $node = NodeModel::getNodeById($id);
        $method = $node->method;
        if($node->custom_method == 1 && $user->method != '' && $user->method != null) {
            $method = $user->method;
        }
        $info = self::nodeQr($node->server, $user->port, $user->sspwd, $method);
        if (self::verifyPlan($user->plan, $node->type)) {
            Template::putContext('info', $info);
            Template::putContext('node', $node);
            Template::setView('node/QrCode');
        } else {
            Message::show('你不是 VIP, 无法使用高级节点！', 'member/node');
        }
    }

    public function json()
    {
        $id = trim($_REQUEST['id']);
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $node = NodeModel::getNodeById($id);
        $method = $node->method;
        if($node->custom_method == 1 && $user->method != '' && $user->method != null) {
            $method = $user->method;
        }
        $info = self::nodeJson($node->server, $user->port, $user->sspwd, $method, $node->name);
        if (self::verifyPlan($user->plan, $node->type)) {
            Template::putContext('info', $info);
            Template::putContext('node', $node);
            Template::setView('node/Json');
        } else {
            Message::show('你不是 VIP, 无法使用高级节点！', 'member/node');
        }
    }

    /**
     * 导出节点列表
     */
    public function jsonList()
    {
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $nodeList = NodeModel::getNodeArray();
        $info = "";

        foreach ($nodeList as $node) {
            $method = $node->method;
            if($node->custom_method == 1 && $user->method != '' && $user->method != null) {
                $method = $user->method;
            }
            if (self::verifyPlan($user->plan, $node->type)) {
                $info .= self::nodeJson($node->server, $user->port, $user->sspwd, $method, $node->name) . ",";
            }
        }
        Template::putContext('info', $info);
        Template::setView('node/JsonAll');
    }


    private static function nodeJson($server, $server_port, $password, $method, $name)
    {
        return '{"server":"' . $server . '","server_port":' . $server_port . ',"local_port":1080,' . '"password":"' . $password . '","timeout":600,' . '"method":"' . $method . '", "remarks": "' . $name . '"}';
    }

    private static function nodeQr($server, $server_port, $password, $method)
    {
        $ssurl = $method . ":" . $password . "@" . $server . ":" . $server_port;
        $ssqr = "ss://" . base64_encode($ssurl);
        return array("ssurl" => $ssurl, "ssqr" => $ssqr);
    }

    private static function verifyPlan($plan, $nodeType)
    {
        if ($nodeType == 1) {
            if ($plan == 'VIP' || $plan == 'SVIP') {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

}