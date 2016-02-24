<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Controller;

use Core\Error;
use Core\Template;
use Helper\Listener;
use Helper\Node as NodeUtil;
use Model\Node as Nodem;
use Model\User;

class Node extends Listener
{
    public function Index()
    {
        throw new Error("无知的人类啊", 555);
    }

    public function QRCode()
    {
        global $user;
        $id = trim($_REQUEST['id']);
        $user = User::GetUserByUserId($user->uid);
        $node = Nodem::GetNodeById($id);
        $info = NodeUtil::NodeQr($node->server, $user->port, $user->sspwd, $node->method);
        if (Node::CheckPlan($user->plan, $node->type)) {
            include Template::load('/node/QrCode');
        } else {
            throw new \Core\Error("your not vip", 233);
        }
        exit();
    }

    public function Json()
    {
        global $user;
        $id = trim($_REQUEST['id']);
        $user = User::GetUserByUserId($user->uid);
        $node = Nodem::GetNodeById($id);
        $info = NodeUtil::NodeJson($node->server, $user->port, $user->sspwd, $node->method, $node->name);
        if (Node::CheckPlan($user->plan, $node->type)) {
            include Template::load('/node/Json');
        } else {
            throw new \Core\Error("your not vip", 233);
        }
        exit();
    }

    public function JsonList()
    {
        global $user;
        $id = trim($_REQUEST['id']);
        $nodeList = Nodem::GetNodeArray();
        $info = "";
        foreach ($nodeList as $node) {
            $info .= NodeUtil::NodeJson($node->server, $node->port, $user->sspwd, $node->method) . ",";
        }
        include Template::load('/node/JsonAll');
        exit();
    }

    private static function CheckPlan($plan, $nodeType)
    {
        if ($nodeType == 1) {
            if ($plan == 'VIP') {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }


    }

}