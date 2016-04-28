<?php

use Phinx\Migration\AbstractMigration;

class UpdateVersion extends AbstractMigration
{
    public function up()
    {
        // 2016-04-17 update version - by Sendya
        $option = [
            [
                'k'     =>  'version',
                'v'     =>  'v1.04'
            ]
        ];

        $this->execute("DELETE FROM `options` WHERE `k` = 'version'");
        $this->insert('options', $option);
    }
}
