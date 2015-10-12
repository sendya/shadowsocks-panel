<?php

use Phinx\Migration\AbstractMigration;

class FirstMigration extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-abstractmigration-class
     */
    public function change()
    {
        $users = $this->table('member');
        $users->addColumn('email', 'string', array('limit' => 64))
            ->addColumn('nickname', 'string', array('limit' => 24))
            ->addColumn('password', 'string', array('limit' => 32))
            ->addIndex('email', array('unique' => true))
            ->create();
    }
}
