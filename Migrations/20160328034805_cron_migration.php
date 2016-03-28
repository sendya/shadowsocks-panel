<?php

use Phinx\Migration\AbstractMigration;

class CronMigration extends AbstractMigration
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
DROP TABLE IF EXISTS `cron`;
CREATE TABLE `cron` (
  `id` varchar(40) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `nextrun` int(10) unsigned NOT NULL,
  `order` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `cron` VALUES ('clearInviteOld', '0', '1461690331', '110');
INSERT INTO `cron` VALUES ('clearTransfer', '1', '1459025349', '10');
INSERT INTO `cron` VALUES ('daily', '0', '1459094400', '100');
INSERT INTO `cron` VALUES ('mail', '0', '1459011931', '80');
INSERT INTO `cron` VALUES ('stopExpireUser', '1', '1459024168', '30');
EOF;

        $this->execute($sql);
    }

    public function up()
    {

    }
}
