<?php

use Phinx\Migration\AbstractMigration;

class MessageDefaultDb extends AbstractMigration
{
    public function up()
    {
        $rows = [
            [
                'id' => 1,
                'content'   => '登陆页公告：<br/>由于服务器遭到攻击，为补偿用户。本月不计费。<br/><br/>发布时间: '. date('Y-m-d H:i:s', time()) . " - " . SITE_NAME,
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
    }
}
