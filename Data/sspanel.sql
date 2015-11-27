SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for invite
-- ----------------------------
DROP TABLE IF EXISTS `invite`;
CREATE TABLE `invite` (
  `uid` int(11) NOT NULL DEFAULT '-1' COMMENT '邀请码所属用户uid， -1为公共邀请码',
  `dateLine` int(11) DEFAULT NULL,
  `expiration` int(3) DEFAULT '10' COMMENT '有效期',
  `inviteIp` varchar(32) DEFAULT NULL,
  `invite` varchar(128) NOT NULL,
  `reguid` int(11) DEFAULT NULL COMMENT '邀请码被哪个用户注册',
  `regDateLine` int(11) DEFAULT NULL,
  `plan` varchar(10) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0' COMMENT '-1过期 0-未使用 1-已用',
  PRIMARY KEY (`invite`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for member
-- ----------------------------
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
  `plan` varchar(3) DEFAULT 'A' COMMENT '账户类型 ex :  A /B/ C/ VIP',
  `enable` tinyint(1) DEFAULT '1' COMMENT '是否启用SS，0 不启用 1启用',
  `money` double DEFAULT '0',
  `invite` varchar(128) DEFAULT NULL,
  `invite_num` int(11) DEFAULT NULL,
  `regDateLine` int(11) DEFAULT NULL,
  `lastConnTime` int(11) DEFAULT NULL,
  `lastCheckinTime` int(11) DEFAULT NULL,
  `lastFindPasswdTime` int(11) DEFAULT NULL,
  `lastFindPasswdCount` tinyint(255) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=10003 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for node
-- ----------------------------
DROP TABLE IF EXISTS `node`;
CREATE TABLE `node` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `type` tinyint(1) DEFAULT NULL COMMENT '类型',
  `server` varchar(128) DEFAULT NULL,
  `method` varchar(64) DEFAULT NULL,
  `info` varchar(128) DEFAULT NULL COMMENT '节点信息备注',
  `status` varchar(128) DEFAULT NULL COMMENT '状态',
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8;
