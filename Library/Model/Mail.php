<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/3/25 23:41
 */


namespace Model;

use Core\Database as DB;
use Core\Model;

/**
 * Class Mail
 * @table mail_queue
 * @package Model
 */
class Mail extends Model
{
    public $id;
    public $to;
    public $subject;
    public $content;

    /**
     * Get mail queue list on limit 2
     * @return Mail
     */
    public static function getQueueList()
    {
        $st = DB::sql("SELECT `id`,`to`,`subject`,`content` FROM mail_queue LIMIT 2");
        $st->execute();
        return $st->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }
}