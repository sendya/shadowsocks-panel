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
use Model\User;

/**
 * Controller: 消息管理
 * @Admin
 * @Authorization
 */
class Message
{

    public function index()
    {
        $data['user'] = User::getCurrent();
        $data['lists'] = MessageModel::getPushMessage(-1);
        Template::setContext($data);
        Template::setView('admin/message');
    }

    /**
     * 修改 or 新增
     *
     * @JSON
     * @return array
     */
    public function update()
    {

        $result = array('error' => 1, 'message' => 'Request failed');

        if ($_POST['message_id'] != null) { // 修改
            $msg = MessageModel::getMessageById(trim($_POST['message_id']));
            if ($msg) { // 修改
                $msg->content = $_POST['message_content'] == null ? "" : $_POST['message_content'];
                $msg->pushTime = $_POST['message_pushTime'] == null ? 0 : strtotime($_POST['message_pushTime']);
                $msg->pushUsers = $_POST['message_pushUsers'] == null ? -1 : $_POST['message_pushUsers'];
                $msg->type = $_POST['message_type'];
                $msg->pushEndTime = $_POST['message_pushEndTime'] == null ? 0 : strtotime($_POST['message_pushEndTime']);
                $msg->enable = $_POST['message_enable'] == null ? 0 : $_POST['message_enable'];
                $msg->save();
                $result = array('error' => 0, 'message' => '更新成功');
            }
        } else {
            $msg = new MessageModel();
            $msg->content = $_POST['message_content'] == null ? "" : $_POST['message_content'];
            $msg->pushTime = $_POST['message_pushTime'] == null ? 0 : strtotime($_POST['message_pushTime']);
            $msg->pushUsers = $_POST['message_pushUsers'] == null ? 0 : $_POST['message_pushUsers'];
            $msg->type = $_POST['message_type'];
            $msg->pushEndTime = $_POST['message_pushEndTime'] == null ? 0 : strtotime($_POST['message_pushEndTime']);
            $msg->enable = $_POST['message_enable'] == null ? 0 : $_POST['message_enable'];
            $msg->save();
            $result = array('error' => 0, 'message' => '添加新消息成功');
        }
        $msg->content = nl2br(mb_substr(htmlspecialchars($msg->content), 0, 20, 'utf-8'));
        $msg->pushEndTime = date('Y-m-d H:i:s', $msg->pushEndTime);
        $type = "";
        switch ($msg->type) {
            case '-1':
                $type = "重复消息";
                break;
            case '-2':
                $type = "系统公告";
                break;
            case '-3':
                $type = "套餐处说明";
                break;
            case '-4':
                $type = "首页浮动提示";
                break;
            case '-5':
                $type = "登录页公告";
                break;
            case '0':
            default:
                $type = "正常消息";
                break;
        }
        $msg->type = $type;
        $pushTo = "";
        switch ($msg->pushUsers) {
            case '-2':
                $pushTo = "系统固定消息";
                break;
            case '-1':
                $pushTo = "系统消息";
                break;
            default:
                $pushTo = "用户：" . $msg->pushUsers;
                break;
        }
        $msg->pushUsers = $pushTo;
        $result['modal'] = $msg;

        return $result;
    }

    /**
     * 删除
     * @JSON
     */
    public function delete()
    {
        $result = array('error' => 1, 'message' => 'Request failed');

        if ($_POST['message_id'] != null) {
            MessageModel::deleteMessageById(intval(trim($_POST['message_id'])));
            $result = array('error' => 0, 'message' => '删除成功');
        }
        return $result;
    }

    /**
     * 查询
     * @JSON
     */
    public function query()
    {
        $result = array('error' => 1, 'message' => 'Request failed');
        $result['message_id'] = $_GET['message_id'];
        if ($_GET['message_id'] != null) {

            $rs = MessageModel::getMessageById(trim($_GET['message_id']));
            $rs->pushTime = date('Y-m-d H:i:s', $rs->pushTime);
            $rs->pushEndTime = date('Y-m-d H:i:s', $rs->pushEndTime);
            if ($rs) {
                $result = array('error' => 0, 'message' => 'success', 'modal' => $rs);
            }
        }
        return $result;
    }

}