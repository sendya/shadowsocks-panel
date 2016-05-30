<?php
/**
 * shadowsocks-panel
 * Add: 2016/4/8 9:39
 * Author: Sendya <18x@loacg.com>
 */

namespace Model;

use \Core\Model;
use \Core\Database as DB;
use Helper\Utils;

/**
 * Class Invite
 *
 * @table invite
 * @package Model
 */
class Invite extends Model
{

    public $id; // 改主键
    public $uid; //邀请码归属用户uid   -1代表公共邀请码
    public $dateLine = TIMESTAMP;//创建该 invite 时间 mysql:datetime
    public $expiration = 10;//invite 有效期 (单位:天)
    public $inviteIp;//invite 创建者ip
    public $invite;//邀请码
    public $reguid = 0;//使用该邀请码注册的用户uid
    public $regDateLine = 0;//使用该 invite 时间 mysql:datetime
    public $plan = 'A'; //Invite type
    public $status = 0;//invite状态 (0-未使用, 1-已用, -1过期)

    public static function getInviteArray($status = -1)
    {
        $sql = "SELECT * FROM invite";
        if ($status == 0) {
            $sql .= " WHERE status = 0";
        } else {
            if ($status == -1) {
                $sql .= " WHERE status = 0 AND uid=-1";
            } else {
                if ($status == 1) {
                    $sql .= " WHERE status = 1 OR status = -1 ";
                }
            }
        }
        $statement = DB::getInstance()->prepare($sql);
        $statement->execute();
        return $statement->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    /**
     * Get a invite object by inviteCode
     * @param $invite
     * @return mixed
     */
    public static function getInviteByInviteCode($invite)
    {
        $statement = DB::getInstance()->prepare("SELECT * FROM invite AS t1 WHERE t1.invite=? LIMIT 0,1");
        $statement->bindValue(1, $invite, DB::PARAM_STR);
        $statement->execute();
        return $statement->fetchObject(__CLASS__);
    }

    public static function getInviteById($id)
    {
        $statement = DB::getInstance()->prepare("SELECT * FROM invite WHERE `id`=? LIMIT 0,1");
        $statement->bindValue(1, $id, DB::PARAM_STR);
        $statement->execute();
        return $statement->fetchObject(__CLASS__);
    }

    /**
     * Get invites by uid
     * @param int $uid
     * @param string $status
     * @return array
     */
    public static function getInvitesByUid($uid = -1, $status = "")
    {
        $sql = "SELECT * FROM invite WHERE uid={$uid} ";
        if ($status != "") {
            $sql .= "AND status={$status} ";
        }

        $sql .= "ORDER BY dateLine DESC";
        $stn = DB::sql($sql);
        $stn->execute();
        return $stn->fetchAll(DB::FETCH_CLASS, __CLASS__);
    }

    /**
     * Add a invite
     * @param $uid
     * @param string $plan
     * @param bool $isTransfer
     * @return bool
     */
    public static function addInvite($uid, $plan = 'A', $isTransfer = false)
    {
        $inviteStr = substr(hash("sha256", $uid . Utils::randomChar(10)), 0, 26) . $uid;
        $obj = new self();
        $obj->inviteIp = Utils::getUserIP();
        $obj->invite = $inviteStr;
        $obj->plan = $plan;
        $obj->uid = $uid;
        if ($isTransfer) {
            $user = User::getUserByUserId($uid);
            $user->transfer = $user->transfer - Utils::GB * 10;
            $user->invite_num = $user->invite_num - 1;
            $user->save();
        }
        $result = $obj->save();
        return $obj;
    }

}