<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;


use Core\Template;
use Model\User;
use Model\Node as MNode;

/**
 * Class Node
 * @Authorization
 * @package Controller
 */
class Node
{
    public function Index()
    {
        $data['user'] = User::getCurrent();
        $data['nodes'] = MNode::getNodeArray(0);
        $data['nodeVip'] = MNode::getNodeArray(1);

        Template::setContext($data);
        Template::setView("panel/node");
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
        $node = MNode::getNodeById($id);
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