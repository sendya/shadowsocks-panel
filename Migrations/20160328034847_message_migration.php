<?php

use Phinx\Migration\AbstractMigration;

class MessageMigration extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     *
     * The following commands can be used in this method and Phinx will
     * automatically reverse them when rolling back:
     *
     *    createTable
     *    renameTable
     *    addColumn
     *    renameColumn
     *    addIndex
     *    addForeignKey
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change()
    {
        $sql = <<<EOF
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` varchar(500) DEFAULT NULL COMMENT '内容',
  `pushTime` int(11) NOT NULL DEFAULT '0' COMMENT '推送时间',
  `addTime` int(11) NOT NULL DEFAULT '0' COMMENT '添加时间',
  `pushUsers` varchar(1000) DEFAULT NULL COMMENT '消息推送给用户，空或 -1将推送给所有用户',
  `type` int(3) NOT NULL DEFAULT '0' COMMENT '消息类型：-3 套餐处说明 -2 系统公告 -1 重复推送，0 正常消息，大于0 推送次数',
  `pushEndTime` int(11) NOT NULL DEFAULT '0' COMMENT '结束推送时间',
  `order` int(3) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8;

INSERT INTO `message` (`id`, `content`, `pushTime`, `addTime`, `pushUsers`, `type`, `pushEndTime`, `order`) VALUES ('1000', '公告：<br/>由于服务器遭到攻击，为补偿用户。本月不计费。（悲剧的事情莫过于挂SS主站的服务器居然被封了25端口）<br/>', '1457320205', '1457320205', '-2', '-2', '1488856205', '0');
INSERT INTO `message` (`id`, `content`, `pushTime`, `addTime`, `pushUsers`, `type`, `pushEndTime`, `order`) VALUES ('1001', '套餐等级如下：<br /><br />套餐A： 5GB(免费) (体验服务)<br />套餐B： 100GB(13RMB)<br />套餐C： 200GB(20RMB)<br />套餐D： 500GB(35RMB)<br /><br />套餐VIP： 无限制流量,优先端口转发(仅内部开放)', '1457320205', '1457320205', '-2', '-3', '1488856205', '0');
INSERT INTO `message` (`id`, `content`, `pushTime`, `addTime`, `pushUsers`, `type`, `pushEndTime`, `order`) VALUES ('1002', '首页浮动提示公告测试。。', '0', '0', '-2', '-4', '0', '0');
EOF;

        $this->execute($sql);
    }

    public function up()
    {

    }
}
