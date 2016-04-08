<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 9:39
 * Author: Sendya <18x@loacg.com>
 */

namespace Model;

use \Core\Model;
use \Core\Database as DB;
/**
 * Class Invite
 *
 * @table invite
 * @package Model
 */
class Invite extends Model {

    /** @var primaryKey  */
    private $primaryKey = 'uid';// 定义主键

    public $uid; //邀请码归属用户uid   -1代表公共邀请码
    public $dateLine;//创建该 invite 时间 mysql:datetime
    public $expiration;//invite 有效期 (单位:天)
    public $inviteIp;//invite 创建者ip
    public $invite;//邀请码 ( create index) pk
    public $reguid;//使用该邀请码注册的用户uid
    public $regDateLine;//使用该 invite 时间 mysql:datetime
    public $plan; //Invite type
    public $status;//invite状态 (0-未使用, 1-已用, -1过期)

    public static function getInviteArray($status = -1) {
        $sql = "SELECT * FROM invite";
        if($status == 0) {
            $sql .= " WHERE status = 0";
        } else if($status == -1) {
            $sql .= " WHERE status = 0 AND uid=-1";
        } else if($status == 1) {
            $sql .= " WHERE status = 1 OR status = -1 ";
        }
        $statement = DB::getInstance()->prepare($sql);
        $statement->execute();
        return $statement->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    public static function getInviteByInviteCode($invite) {
        $statement = DB::getInstance()->prepare("SELECT * FROM invite AS t1 WHERE t1.invite=? LIMIT 0,1");
        $statement->bindValue(1, $invite, DB::PARAM_STR);
        $statement->execute();
        return $statement->fetchObject(__CLASS__);
    }

}