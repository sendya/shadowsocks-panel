<?php
/**
 * Created by PhpStorm.
 * User: Sendya
 * Date: 2016/3/27
 * Time: 0:13
 */

namespace Model;


use Core\Database;

class Cron {

    public $id;
    public $enabled;
    public $nextRun;
    public $order;

    public static function getCronArray() {
        $st = Database::prepare("SELECT id, enabled, nextrun, `order` FROM cron");
        $st->execute();
        return $st->fetchAll(\PDO::FETCH_CLASS, '\\Model\\Cron');
    }
}