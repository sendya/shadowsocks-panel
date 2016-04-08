<?php

use Phinx\Migration\AbstractMigration;

class AdminTable extends AbstractMigration
{
    public function change()
    {
        $this->table("admin", array('comment' => '管理员权限表'))
            ->addColumn('uid', 'integer', ['limit' => 11, 'comment' => '用户id'])
            ->create();
    }
}
