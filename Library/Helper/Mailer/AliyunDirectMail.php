<?php
/**
 * Project: shadowsocks-panel
 * Author: Acris <i@mrx.one>
 * Time: 2016/5/21 00:10
 */


namespace Helper\Mailer;

use Contactable\IMailer;
use Helper\Option;
use Helper\Utils;
use Model\Mail;

include_once ROOT_PATH . 'Library/Helper/SDK/Aliyun/aliyun-php-sdk-core/Config.php';
use Dm\Request\V20151123 as Dm;
use DefaultProfile;
use DefaultAcsClient;

/**
 * Class AliyunDirectMail
 * @package Helper\Mailer
 */
class AliyunDirectMail implements IMailer
{
    private $config;

    public function isAvailable()
    {
        $className = Utils::getShortName($this);

        $config = Option::get('MAIL_' . $className);
        if (!$config) {
            $_config = array(
                'region' => 'cn-hangzhou',
                'accessKey' => 'yourAccessKey',
                'accessSecret' => 'yourAccessSecret',
                'accountName' => 'notice-no-reply@sendmail.aliyun.xxx.com',
                'tagName' => 'yourTagName',
                'alias' => 'SS Cat'
            );
            Option::set('MAIL_' . $className, json_encode($_config)); // 设定默认配置
            return false;
        }
        return true;
    }

    /**
     * Send mail
     * @param Mail $mail
     * @return bool true if the mail was successfully accepted for delivery, false otherwise.
     */
    public function send(Mail $mail)
    {
        $iClientProfile = DefaultProfile::getProfile($this->config['region'], $this->config['accessKey'], $this->config['accessSecret']);
        $client = new DefaultAcsClient($iClientProfile);
        $request = new Dm\SingleSendMailRequest();
        $request->setAccountName($this->config['accountName']);
        $request->setFromAlias($this->config['alias']);
        $request->setAddressType(1);
        $request->setTagName($this->config['tagName']);
        $request->setReplyToAddress("true");
        $request->setToAddress($mail->to);
        $request->setSubject($mail->subject);
        $request->setHtmlBody($mail->content);
        $response = $client->getAcsResponse($request);
        return true;
    }

    public function __construct()
    {
        $className = Utils::getShortName($this);
        $this->isAvailable();

        $config = Option::get('MAIL_' . $className);
        if (!$config) {
            throw new Error("邮件模块 " . $className . " 配置不完整，无法使用。");
        }

        $this->config = json_decode($config, true);
    }

}