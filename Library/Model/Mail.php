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
 * @package Model
 */
class Mail extends Model
{
    public $id;
    public $to;
    public $subject;
    public $content;

    /**
     * Get mail queue on limit 1
     * @return Mail
     */
    public static function getMailQueue()
    {
        $st = DB::sql("SELECT * FROM mail_queue LIMIT 0,1");
        $st->execute();
        return $st->fetchObject(__CLASS__);
    }
}