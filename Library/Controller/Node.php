<?php
/**
 * SS-Panel
 * A simple bulletin board system
 * Author: Sendya <18x@mloli.com>
 */

namespace Controller;



use Core\Error;
use Core\Template;
use Helper\Node as NodeUtil;
use Model\Node as Nodem;
use Model\User;

class Node
{
    public function Index() {
        throw new Error("无知的人类啊", 555);
    }

    public function QRCode() {
        global $uid;
        $id = trim($_REQUEST['id']);
        $user = User::GetUserByUserId($uid);
        $node = Nodem::GetNodeById($id);
        $info = NodeUtil::NodeQr($node->server, $node->port, $user->sspwd, $node->method);
        include Template::load('/node/QrCode');
        exit();
    }

    public function Json() {
        global $uid;
        $id = trim($_REQUEST['id']);
        $user = User::GetUserByUserId($uid);
        $node = Nodem::GetNodeById($uid);
        $info = NodeUtil::NodeJson($node->server, $node->port, $user->sspwd, $node->method);
        include Template::load('/node/Json');
        exit();
    }

    public function JsonList() {
        global $uid;
        $id = trim($_REQUEST['id']);
        $user = User::GetUserByUserId($uid);
        $nodeList = Nodem::GetNodeArray();
        $info = "";
        foreach($nodeList as $node) {
            $info.= NodeUtil::NodeJson($node->server, $node->port, $user->sspwd, $node->method);
        }
        include Template::load('/node/JsonAll');
        exit();
    }

}