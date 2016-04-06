<?php

use Phinx\Migration\AbstractMigration;

class UserPowerTable extends AbstractMigration
{
    public function change()
    {
        $this->table("user_power", array('comment' => '管理员权限表'))
            ->addColumn('uid', 'integer', ['limit' => 11, 'comment' => '用户id'])
            ->create();
    }
}
