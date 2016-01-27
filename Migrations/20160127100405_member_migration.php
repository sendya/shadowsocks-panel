<?php

use Phinx\Migration\AbstractMigration;

class MemberMigrations extends AbstractMigration
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
        $member = $this->table("member");

        $member->addColumn('email', 'string', array('limit'=>64));
        $member->addColumn('nickname', 'string', array('limit'=>32));
        $member->addColumn('password', 'string', array('limit'=>32));
        $member->addColumn('sspwd', 'string', array('limit'=>32));
        $member->addColumn('port', 'integer', array('limit'=>5));
        $member->addColumn('flow_up', 'bigint', array('limit'=>21));
        $member->addColumn('flow_down', 'bigint', array('limit'=>20));
        $member->addColumn('transfer', 'bigint', array('limit'=>20));
        $member->addColumn('plan', 'string', array('limit'=>3, 'default'=>'A'));
        $member->addColumn('enable', 'tinyint', array('limit'=>1, 'default'=>1));


    }
}