<?php

use Phinx\Migration\AbstractMigration;

class TableDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            ['id' => 'clearInviteOld', 'enable' => 0, 'nextrun' => time(), 'order' => 110],
            ['id' => 'clearTransfer', 'enable' => 1, 'nextrun' => time(), 'order' => 10],
            ['id' => 'daily', 'enable' => 0, 'nextrun' => time(), 'order' => 100],
            ['id' => 'mail', 'enable' => 0, 'nextrun' => time(), 'order' => 80],
            ['id' => 'stopExpireUser', 'enable' => 1, 'nextrun' => time(), 'order' => 30],
        ];

        $this->insert('cron', $rows);

        $rows = [
            ['id'   => 1, 'uid'  => 1]
        ];
        $this->insert('admin', $rows);

        $options = [
            [
                'k'     =>  'update_notification',
                'v'     =>  '1'
            ],[
                'k'     =>  'version',
                'v'     =>  'v0.41'
            ],[
                'k'     =>  'current_port',
                'v'     =>  '5000'
            ],[
                'k'     =>  'user_test_day',
                'v'     =>  '7'
            ],[
                'k'     =>  'check_transfer_min',
                'v'     =>  '10'
            ],[
                'k'     =>  'check_transfer_max',
                'v'     =>  '50'
            ],[
                'k'     =>  'custom_transfer_level',
                'v'     =>  '{"A":10,"B":50,"C":150,"D":300,"VIP":500}'
            ],[
                'k'     =>  'custom_plan_name',
                'v'     =>  '{"A":"\u514d\u8d39\u7528\u6237","B":"\u666e\u901a\u7528\u6237","C":"\u9ad8\u7ea7\u7528\u6237","D":"\u8d85\u7ea7\u7528\u6237","VIP":"\u7279\u6743\u4f1a\u5458"}'
            ]
        ];

        $this->insert('options', $options);

        $rows = [
            [
                'uid' => -1, 'dateLine' => time(), 'expiration' => 10, 'inviteIp' => '127.0.0.1', 'invite' => '334ab1a9fbc19b4c688ca7fd5f8f9ffa', 'regDateLine' => 0, 'plan' => 'VIP', 'status' => 0
            ],[
                'uid' => 1, 'dateLine' => time(), 'expiration' => 10, 'inviteIp' => '127.0.0.1', 'invite' => '0914e68a1527352c5c6ccee132e303eb', 'regDateLine' => 0, 'plan' => 'VIP', 'status' => 0
            ]
        ];
        $this->insert('invite', $rows);

        $rows = [
            [
                'name' => 'Suki-S1', 'type' => 0, 'server' => 'server1.shadowsocks.org', 'method' => 'aes-128-cfb', 'info' => '节点说明', 'order' => 1
            ],[
                'name' => 'Suki-S2', 'type' => 1, 'server' => 'server1.shadowsocks.org', 'method' => 'aes-256-cfb', 'info' => 'VIP节点', 'order' => 1
            ]
        ];
        $this->insert('node', $rows);


        $rows = [
            [
                'id' => 1,
                'content'   => '登录页公告：<br/>由于服务器遭到攻击，为补偿用户。本月不计费。<br/><br/>发布时间: '. date('Y-m-d H:i:s', time()) . " - " . SITE_NAME,
                'pushTime'  => time(),
                'addTime'   => time(),
                'pushUsers' => '-2',
                'type'      => -4,
                'pushEndTime'=> 0,
                'order'     => 0,
                'enable'    => 1
            ],[
                'id' => 2,
                'content'   => '公告：<br/>由于服务器遭到攻击，为补偿用户。本月不计费。（悲剧的事情莫过于挂SS主站的服务器居然被封了25端口）<br/>',
                'pushTime'  => time(),
                'addTime'   => time(),
                'pushUsers' => '-2',
                'type'      => -2,
                'pushEndTime'=> 0,
                'order'     => 0,
                'enable'    => 1
            ],[
                'id' => 3,
                'content'   => '套餐等级如下：<br /><br />套餐A： 5GB(免费) (体验服务)<br />套餐B： 100GB(13RMB)<br />套餐C： 200GB(20RMB)<br />套餐D： 500GB(35RMB)<br /><br />套餐VIP： 无限制流量,优先端口转发(仅内部开放)',
                'pushTime'  => time(),
                'addTime'   => time(),
                'pushUsers' => '-2',
                'type'      => -3,
                'pushEndTime'=> 0,
                'order'     => 0,
                'enable'    => 1
            ],[
                'id' => 4,
                'content'   => '首页浮动提示公告测试',
                'pushTime'  => time(),
                'addTime'   => time(),
                'pushUsers' => '-2',
                'type'      => -4,
                'pushEndTime'=> 0,
                'order'     => 0,
                'enable'    => 1
            ],
        ];

        $this->insert('message', $rows);

        $this->execute("ALTER TABLE `message` AUTO_INCREMENT=1000;"); // set default AUTO_INCREMENT value

        $rows = [
            [
                'card'      =>  '0dba460855d8562294c1f761dd477014',
                'add_time'  =>  time(),
                'type'      =>  '0',
                'info'      =>  'B',
                'status'    =>  1
            ],[
                'card'      =>  'd1aa89e8002275fa586501ddbe77b4b0',
                'add_time'  =>  time(),
                'type'      =>  '1',
                'info'      =>  '100',
                'status'    =>  1
            ]
        ];

        $this->insert('card', $rows);

        $val = [
            "A" => "免费用户",
            "B" => "普通用户",
            "C" => "高级用户",
            "D" => "超级用户",
            "VIP" => "特权会员",
            "Z" => "固定流量套餐"
        ];
        $option = [
            [
                'k'     =>  'custom_plan_name',
                'v'     =>  '{"A":"\u514d\u8d39\u7528\u6237","B":"\u666e\u901a\u7528\u6237","C":"\u9ad8\u7ea7\u7528\u6237","D":"\u8d85\u7ea7\u7528\u6237","VIP":"\u7279\u6743\u4f1a\u5458","Z":"\u56fa\u5b9a\u6d41\u91cf\u5957\u9910"}'
            ]
        ];

        $this->execute("DELETE FROM `options` WHERE `k` = 'custom_plan_name'");
        $this->insert('options', $option);

        // 2016-04-26 add custom mail content.
        $option = [
            [
                'k'     =>  'custom_mail_stop_expire_content',
                'v'     =>  '您的账户已用流量 {useTraffic}, 账户到期时间为 {expireTime} 已经被停止使用<br/><br/>Yours, The {SITE_NAME} Team'
            ], [
                'k'     =>  'custom_mail_forgePassword_content',
                'v'     =>  'Dear {nickname}:<br/>Use this code to disable your password and access your {SITE_NAME} account:<br/>(这个验证码是用于停止您当前 {SITE_NAME} 所在账户的旧密码):<br/><br/>Code: {code}<br/><br/><b>请将验证码在找回密码页面输入才能确认重置密码！</b><br/>Yours,The {SITE_NAME} Team'
            ],[
                'k'     =>  'custom_mail_forgePassword_content_2',
                'v'     =>  'Dear {nickname}:<br/>Here\'s your new password<br/>(这是你的新密码)<br/><br/>Password: {newPassWord}<br/><br/><b>ATTENTION: PLEASE CHANGE THE PASSWORD AND DELETE THIS EMAIL IMMEDIATELY ALTER LOG IN YOUR ACCOUNT FOR SECURITY PURPOSES.</b><b>请在登录后立即修改密码，并且删除此邮件.</b><br/><br/>Yours, The {SITE_NAME} Team'
            ], [
                'k'     =>  'custom_mail_register_content',
                'v'     =>  'Dear {nickname}:<br/>this is your registration email for {SITE_NAME} Service.<br/><br/>Yours, The {SITE_NAME} Team'
            ]
        ];

        $this->execute("DELETE FROM `options` WHERE `k` LIKE '%custom_mail_%'");
        $this->insert('options', $option);

        // update table column 20160427073456
        $table = $this->table('card');
        $table->renameColumn('pram1', 'expireTime');
        $table->changeColumn('expireTime', 'integer', ['null'=> true, 'default'=> 0]);
        $table->save();
    }
}
