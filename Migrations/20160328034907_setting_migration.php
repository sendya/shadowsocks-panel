<?php

use Phinx\Migration\AbstractMigration;

class SettingMigration extends AbstractMigration
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
DROP TABLE IF EXISTS `setting`;
CREATE TABLE `setting` (
  `k` varchar(32) NOT NULL,
  `v` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`k`),
  KEY `setting_key` (`k`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
EOF;

        $this->execute($sql);


    }
}
