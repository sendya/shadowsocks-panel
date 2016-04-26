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
     * Get mail queue on limit 3
     * @return Mail
     */
    public static function getMailQueue()
    {
        $st = DB::sql("SELECT * FROM mail_queue AS t1 JOIN (SELECT ROUND(RAND() * ((SELECT MAX(id) FROM mail_queue)-(SELECT MIN(id) FROM mail_queue))+(SELECT MIN(id) FROM mail_queue)) AS id) AS t2 WHERE t1.id >= t2.id ORDER BY t1.id LIMIT 3");
        $st->execute();
        return $st->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }
}