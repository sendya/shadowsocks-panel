<?php

use Phinx\Migration\AbstractMigration;

class NodeMigration extends AbstractMigration
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

    }

    public function up()
    {
        $sql = <<<EOF
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
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
EOF;
        $this->execute($sql);

    }
}
