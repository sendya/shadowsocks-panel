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
     * @JSON
     * @return array
     */
    public function getNodeInfo()
    {
        $id = trim($_REQUEST['id']);
        $result = array('error' => -1, 'message' => 'Request failed');
        $user = User::getUserByUserId(User::getCurrent()->uid);
        $node = NodeModel::getNodeById($id);
        $method = $node->method;
        if($node->custom_method == 1 && $user->method != '' && $user->method != null) {
            $method = $user->method;
        }
        $info = self::nodeDetail($node->server, $user->port, $user->sspwd, $method, $node->name);
        if (self::verifyPlan($user->plan, $node->type)) {
            $result = array('error' => 0, 'message' => '获取成功', 'info' => $info, 'node' => $node);
        } else {
            $result = array('error' => -1, 'message' => '你不是 VIP, 无法使用高级节点！');
        }
        return $result;
    }

    private static function nodeDetail($server, $server_port, $password, $method, $name)
    {
        $ssurl = $method . ":" . $password . "@" . $server . ":" . $server_port;
        $ssurl = "ss://" . base64_encode($ssurl);
        $ssjsonAry = array("server" => $server, "server_port" => $server_port, "password" => $password, "timeout" => 600, "method" => $method, "remarks" => $name);
        $ssjson = json_encode($ssjsonAry, JSON_PRETTY_PRINT);
        return array("ssurl" => $ssurl, "ssjson" => $ssjson);
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