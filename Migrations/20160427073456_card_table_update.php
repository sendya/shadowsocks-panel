<?php

use Phinx\Migration\AbstractMigration;

class CardTableUpdate extends AbstractMigration
{
    public function up()
    {
        $table = $this->table('card');
        $table->renameColumn('pram1', 'expireTime');
        $table->changeColumn('expireTime', 'integer', ['null'=> true, 'default'=> 0]);
        $table->save();
    }
}
