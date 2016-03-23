<?php
/**
 * Created by IntelliJ IDEA.
 * User: Sendya
 * Date: 2016/3/18
 * Time: 11:31
 */

namespace Controller\Admin;

use \Core\Template;

use \Model\Message as MessageModel;

/**
 * Controller: 消息管理
 */
class Message extends AdminListener {

    public function index() {
        global $user;

        $lists = MessageModel::GetPushMsg(-1);

        include Template::load('/admin/message');
    }

    public function change() {
        global $user;
        $result = array('error'=> 1, 'message'=> 'Request failed');

        if($_POST['message_id'] != null) { // 修改

            $msg = MessageModel::GetMessageById(trim($_POST['message_id']));
            if($msg) { // 修改
                $msg->content = $_POST['message_content']==null ? "" : $_POST['message_content'];
                $msg->pushTime = $_POST['message_pushTime']==null ? 0 : $_POST['message_pushTime'];
                $msg->addTime = $_POST['message_addTime']==null ? 0 : $_POST['message_addTime'];
                $msg->pushUsers = $_POST['message_pushUsers']==null ? 0 : $_POST['message_pushUsers'];
                $msg->type = $_POST['message_type']==null ? 0 : $_POST['message_type'];
                $msg->pushEndTime = $_POST['message_pushEndTime']==null ? 0 : $_POST['message_pushEndTime'];
                $msg->order = $_POST['message_order']==null ? 0 : $_POST['message_order'];
            }
        }
        // $msg = new MessageModel(); // 新增

        echo json_encode($result);
        exit();
    }

    public function delete() {
        global $user;
        $result = array('error'=> 1, 'message'=> 'Request failed');

        if($_POST['message_id'] != null) {

            $rs = MessageModel::deleteMsgById(trim($_POST['message_id']));
            if($rs)
                $result =  array('error'=> 0, 'message'=> '删除成功');
        }
        echo json_encode($result);
        exit();
    }

    public function query() {
        global  $user;
        $result = array('error'=> 1, 'message'=> 'Request failed');
        if($_POST['message_id'] != null) {

            $rs = MessageModel::GetMessageById(trim($_POST['message_id']));
            if($rs)
                $result =  array('error'=> 0, 'message'=> 'success', 'data'=> $rs);
        }
        echo json_encode($result);
        exit();
    }

}