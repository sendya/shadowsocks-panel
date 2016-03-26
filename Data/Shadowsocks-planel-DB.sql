/*
Navicat MariaDB Data Transfer

Source Server         : SS Cat
Source Server Version : 100112
Source Host           : hk.suki.im:3306
Source Database       : sspanel

Target Server Type    : MariaDB
Target Server Version : 100112
File Encoding         : 65001

Date: 2016-03-23 22:05:01
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for invite
-- ----------------------------
DROP TABLE IF EXISTS `invite`;
CREATE TABLE `invite` (
  `uid` int(11) NOT NULL DEFAULT '-1' COMMENT '邀请码所属用户uid， -1为公共邀请码',
  `dateLine` int(11) DEFAULT NULL COMMENT '添加时间',
  `expiration` int(3) DEFAULT '10' COMMENT '有效期',
  `inviteIp` varchar(32) DEFAULT NULL,
  `invite` varchar(128) NOT NULL,
  `reguid` int(11) DEFAULT NULL COMMENT '邀请码被哪个用户注册',
  `regDateLine` int(11) NOT NULL DEFAULT '0' COMMENT '注册时间',
  `plan` varchar(10) DEFAULT 'A',
  `status` tinyint(1) DEFAULT '0' COMMENT '-1过期 0-未使用 1-已用',
  PRIMARY KEY (`invite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `payTime` int(11) DEFAULT '0' COMMENT '上次支付时间',
  `expireTime` int(11) DEFAULT '0' COMMENT '到期时间',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=5000 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for message
-- ----------------------------
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
  `status` varchar(128) DEFAULT '1' COMMENT '状态 1 可用 ，0 或其他不可用',
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for setting
-- ----------------------------
DROP TABLE IF EXISTS `setting`;
CREATE TABLE `setting` (
  `k` varchar(32) NOT NULL,
  `v` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`k`),
  KEY `setting_key` (`k`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for tempUser
-- ----------------------------
DROP TABLE IF EXISTS `tempUser`;
CREATE TABLE `tempUser` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for user_power
-- ----------------------------
DROP TABLE IF EXISTS `user_power`;
CREATE TABLE `user_power` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT '0' COMMENT '用户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='管理员表';


-- ----------------------------
-- Table structure for cron
-- ----------------------------
DROP TABLE IF EXISTS `cron`;
CREATE TABLE `cron` (
  `id` varchar(40) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `nextrun` int(10) unsigned NOT NULL,
  `order` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------
-- Default db
-- --------------------------
INSERT INTO `user_power` (`id`, `uid`) VALUES ('1', '5000');
INSERT INTO `invite` (`uid`, `dateLine`, `expiration`, `inviteIp`, `invite`, `reguid`, `regDateLine`, `plan`, `status`) VALUES ('-1', '1454638687', '999', '127.0.0.1', '334ab1a9fbc19b4c688ca7fd5f8f9ffa', NULL, '0', 'VIP', '0');
INSERT INTO `node` (`id`, `name`, `type`, `server`, `method`, `info`, `status`, `order`) VALUES ('1', 'Suki-S1', '0', 'server1.shadowsocks.org', 'aes-128-cfb', '节点说明', '可用', '1');


INSERT INTO `message` (`id`, `content`, `pushTime`, `addTime`, `pushUsers`, `type`, `pushEndTime`, `order`) VALUES ('1000', '公告：<br/>由于服务器遭到攻击，为补偿用户。本月不计费。（悲剧的事情莫过于挂SS主站的服务器居然被封了25端口）<br/>', '1457320205', '1457320205', '-2', '-2', '1488856205', '0');
INSERT INTO `message` (`id`, `content`, `pushTime`, `addTime`, `pushUsers`, `type`, `pushEndTime`, `order`) VALUES ('1001', '套餐等级如下：<br /><br />套餐A： 5GB(免费) (体验服务)<br />套餐B： 100GB(13RMB)<br />套餐C： 200GB(20RMB)<br />套餐D： 500GB(35RMB)<br /><br />套餐VIP： 无限制流量,优先端口转发(仅内部开放)', '1457320205', '1457320205', '-2', '-3', '1488856205', '0');
INSERT INTO `message` (`id`, `content`, `pushTime`, `addTime`, `pushUsers`, `type`, `pushEndTime`, `order`) VALUES ('1002', '首页浮动提示公告测试。。', '0', '0', '-2', '-4', '0', '0');

-- ----------------------------
-- Records of cron
-- ----------------------------
INSERT INTO `cron` VALUES ('clearInviteOld', '0', '1461690331', '110');
INSERT INTO `cron` VALUES ('clearTransfer', '1', '1459025349', '10');
INSERT INTO `cron` VALUES ('daily', '0', '1459094400', '100');
INSERT INTO `cron` VALUES ('mail', '0', '1459011931', '80');
INSERT INTO `cron` VALUES ('stopExpireUser', '1', '1459024168', '30');