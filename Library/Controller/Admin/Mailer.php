<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/16 23:58
 */


namespace Controller\Admin;


use Core\Template;
use Helper\Option;
use Model\Mail;
use Model\User;
use Helper\Mailer as Mailer1;

/**
 * Class Mailer
 * @Admin
 * @Authorization
 * @package Controller\Admin
 */
class Mailer
{

    public function index()
    {
        $data['selectMail'] = Option::get('MAIL_AVAILABLE');
        $data['user'] = User::getCurrent();
        Template::setContext($data);
        Template::setView('admin/mailer');
    }

    /**
     * @JSON
     */
    public function test()
    {
        $result = array('error' => 1, 'message' => '发送邮件错误，请检查邮件配置');
        $user = User::getCurrent();
        $mailer = Mailer1::getInstance();

        $mail = new Mail();
        $mail->to = $user->email;
        $mail->subject = '[' . SITE_NAME . '] 这是一封测试邮件';
        $mail->content = '这是一封<b>单条发送</b>测试邮件';
        if (!$mailer->send($mail)) {
            return $result;
        }
        $mailer->toQueue(true);
        $mail->subject = '[' . SITE_NAME . '] 这是一封多条发送测试邮件';
        $mail->content = '这是一封<b>多条发送</b>测试邮件';
        $mailer->send($mail);
        if (!$mailer->send($mail)) {
            return $result;
        } else {
            $result = array('error' => 0, 'message' => '邮件已经发送到您的邮箱上');
            return $result;
        }
    }

    /**
     * @JSON
     * @return array
     * @throws \Core\Error
     */
    public function postAll()
    {
        $subject = $_POST['mailer_subject'];
        $content = $_POST['mailer_content'];
        if ($subject == null || $subject == '' || $content == null || $content == '') {
            return array('error' => 1, 'message' => '请求错误，您提交的参数不对。');
        }

        $users = User::getUserList();

        $mailer = Mailer1::getInstance();
        $mailer->toQueue(true);

        $mail = new Mail();
        $mail->subject = $subject;
        $mail->content = $content;

        foreach ($users as $user) {
            $mail->to = $user->email;
            $mailer->send($mail);
        }

        Option::set('mail_queue', 1);

        return array('error' => 1, 'message' => '群邮件已经加入列队正在发送中..');
    }

    /**
     * @JSON
     */
    public function saveSetting()
    {
        $type = $_POST['mail_type'];
        $mailType = 'MAIL_' . $type;
        $mailer = self::createMailObject($type);
        if (!$mailer->isAvailable()) {
            $config = Option::get($mailType);
        }
        if (!$config) {
            $config = Option::get($mailType);
        }
        $config = json_decode($config, true);
        $_config = [];
        foreach ($config as $key => $val) {
            $k = $key;
            $v = $val;
            if (strpos($k, 'mailer') === false) {
                $_config[] = ['key' => $k, 'value' => $v];
            }
        }
        return array('error' => 0, 'message' => '请设置邮件参数', 'configs' => $_config, 'mailer' => $type);
    }

    /**
     * 更新 邮件系统设置
     *
     * @JSON
     */
    public function update()
    {
        $result['error'] = 0;
        $result['message'] = '保存完成';
        foreach ($_POST as $key => $val) {
            if (!empty($val) && strpos($key, 'mail_') !== false) {
                if (strpos($key, 'mailer') === false) { // 判断是否为 mail_mailer <- 这个字段是用于是被当前设定的邮件类名，此配置无需存入数据库
                    $k = str_replace('mail_', '', $key);
                    $data[$k] = trim($val);
                }
            }
        }
        if (!empty($_POST['mail_mailer'])) {
            $config = json_encode($data);
            $mailer = trim($_POST['mail_mailer']);
            Option::set('MAIL_' . $mailer, $config);
            Option::set('MAIL_AVAILABLE', $mailer);
        } else {
            $result['error'] = 1;
            $result['message'] = '保存失败，参数不完整';
        }
        Option::init();
        return $result;
    }

    private static function createMailObject($mailClass)
    {
        $class = "\\Helper\\Mailer\\{$mailClass}";
        $mailer = new $class;
        return $mailer;
    }

}