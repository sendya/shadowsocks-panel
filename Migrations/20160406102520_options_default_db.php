<?php

use Phinx\Migration\AbstractMigration;

class OptionsDefaultDb extends AbstractMigration
{
    public function up()
    {
        $options = [
            [
                'k'     =>  'update_notification',
                'v'     =>  '1'
            ],[
                'k'     =>  'version',
                'v'     =>  'v0.41'
            ],[
                'k'     =>  'current_port',
                'v'     =>  '5000'
            ],[
                'k'     =>  'user_test_day',
                'v'     =>  '7'
            ]
        ];

        $this->insert('options', $options);
    }
}
