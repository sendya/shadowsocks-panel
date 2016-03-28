<?php

use Phinx\Migration\AbstractMigration;

class MemberMigration extends AbstractMigration
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
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(64) NOT NULL,
  `nickname` varchar(24) DEFAULT NULL,
  `password` varchar(32) NOT NULL,
  `sspwd` varchar(32) DEFAULT NULL,
  `port` int(5) DEFAULT NULL,
  `flow_up` bigint(20) DEFAULT NULL,
  `flow_down` bigint(20) DEFAULT NULL,
  `transfer` bigint(20) DEFAULT NULL COMMENT '总流量',
  `plan` varchar(4) DEFAULT 'A' COMMENT '账户类型 ex :  A /B/ C/ VIP',
  `enable` tinyint(1) DEFAULT '1' COMMENT '是否启用SS，0 不启用 1启用',
  `money` double DEFAULT '0',
  `invite` varchar(128) DEFAULT NULL COMMENT '使用的邀请码',
  `invite_num` int(11) NOT NULL DEFAULT '0' COMMENT '邀请码数量',
  `regDateLine` int(11) NOT NULL DEFAULT '0' COMMENT '注册时间',
  `lastConnTime` int(11) NOT NULL DEFAULT '0' COMMENT '上次使用时间',
  `lastCheckinTime` int(11) NOT NULL DEFAULT '0' COMMENT '上次签到时间',
  `lastFindPasswdTime` int(11) NOT NULL DEFAULT '0' COMMENT '找回密码时间(临时记录用而已)',
  `lastFindPasswdCount` tinyint(255) NOT NULL DEFAULT '0' COMMENT '找回密码次数(临时记录用而已)',
  `forgePwdCode` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  KEY `uid` (`uid`,`email`,`port`),
  KEY `flow` (`uid`,`flow_up`,`flow_down`,`transfer`)
) ENGINE=InnoDB AUTO_INCREMENT=5000 DEFAULT CHARSET=utf8;
EOF;

        $this->execute($sql);
    }

    public function up()
    {

    }
}
