/*
Navicat MySQL Data Transfer

Source Server         : local.dev
Source Server Version : 50538
Source Host           : localhost:3306
Source Database       : sspanel

Target Server Type    : MYSQL
Target Server Version : 50538
File Encoding         : 65001

Date: 2015-12-08 14:08:45
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
  `status` tinyint(1) DEFAULT '0' COMMENT '-1过期 0-未使用 1-已用'
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
  `plan` varchar(3) DEFAULT 'A' COMMENT '账户类型 ex :  A /B/ C/ VIP',
  `enable` tinyint(1) DEFAULT '1' COMMENT '是否启用SS，0 不启用 1启用',
  `money` double DEFAULT '0',
  `invite` varchar(128) DEFAULT NULL COMMENT '使用的邀请码',
  `invite_num` int(11) NOT NULL DEFAULT '0' COMMENT '邀请码数量',
  `regDateLine` int(11) NOT NULL DEFAULT '0' COMMENT '注册时间',
  `lastConnTime` int(11) NOT NULL DEFAULT '0' COMMENT '上次使用时间',
  `lastCheckinTime` int(11) NOT NULL DEFAULT '0' COMMENT '上次签到时间',
  `lastFindPasswdTime` int(11) NOT NULL DEFAULT '0' COMMENT '找回密码时间(临时记录用而已)',
  `lastFindPasswdCount` tinyint(255) NOT NULL DEFAULT '0' COMMENT '找回密码次数(临时记录用而已)',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=10000 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` varchar(500) DEFAULT NULL COMMENT '内容',
  `pushTime` int(11) NOT NULL DEFAULT '0' COMMENT '推送时间',
  `addTime` int(11) NOT NULL DEFAULT '0' COMMENT '添加时间',
  `pushUsers` varchar(255) DEFAULT NULL COMMENT '消息推送给用户，空或 -1将推送给所有用户',
  `type` tinyint(3) NOT NULL DEFAULT '0' COMMENT '消息类型：0 正常消息，1 重复推送',
  `pushEndTime` int(11) NOT NULL DEFAULT '0' COMMENT '结束推送时间',
  `order` int(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
