<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/11/9 11:00
 */


namespace Model;
use Core\Model;
use Core\Database as DB;
use Helper\Encrypt;

/**
 * Class User
 * @Table User
 * @package Model
 */
class User extends Model
{
    public $id;
    public $email;
    public $nickname;
    public $money;
    public $invite;
    public $invite_num = 0;
    public $registerTime = 0;
    public $lastCheckInTime = 0; // 上次签到时间
    public $lastFindPasswordTime = 0; // 上次找回密码时间 (找回密码时间和次数仅用作限制3次或?次后禁止找回)
    public $lastFindPasswordCount = 0; // 找回密码次数
    public $payTime; // 上次支付时间
    public $expireTime; // 到期时间

    protected $password;

    /** @ignore */
    public $lastActive = 0;
    /** @ignore */
    private $admin = 0;

    public function save($mode = self::SAVE_AUTO)
    {
        if ($_SESSION['currentUser'] instanceof self) {
            if ($this->id == $_SESSION['currentUser']->id) {
                $_SESSION['currentUser'] = $this;
            }
        }
        parent::save($mode);
    }

    public static function getCurrent()
    {
        /** @var User $user */
        $user = $_SESSION['currentUser'];
        if ($user && TIMESTAMP - $user->lastActive > 600) {
            $userObj = self::getUserById($user->uid);
            if (!$userObj) {
                $user = null;
            } else {
                $userObj->lastActive = TIMESTAMP;
                $user = $userObj;
            }
        } elseif (!$user->uid) {
            $uid = Encrypt::decode(base64_decode($_COOKIE['uid']), ENCRYPT_KEY);
            $expire = Encrypt::decode(base64_decode($_COOKIE['expire']), ENCRYPT_KEY);
            $token = Encrypt::decode(base64_decode($_COOKIE['token']), ENCRYPT_KEY);
            if ($uid && $expire && $token) {
                $userObj = self::getUserById($uid);
                if ($userObj) {
                    $validateToken = md5($userObj->uid . ":" . $userObj->email . ":" . $userObj->passwd . ":" . $expire . ":" . COOKIE_KEY);
                    if ($token == $validateToken) {
                        $userObj->lastActive = TIMESTAMP;
                        $user = $userObj;
                    }
                }
            }
        }
        $_SESSION['currentUser'] = $user;
        return $user;
    }

    /**
     * @param $email
     * @return User
     */
    public static function getUserByEmail($email)
    {
        $stm = DB::sql('SELECT t1.*, IF(t2.id>0,1,0) as `admin` FROM `user` t1 LEFT JOIN `admin` t2 ON t1.uid=t2.uid WHERE t1.email = ?');
        $stm->bindValue(1, $email);
        $stm->execute();
        return $stm->fetchObject(__CLASS__);
    }
    /**
     * @param $userId
     * @return User
     */
    public static function getUserById($userId)
    {
        $stm = DB::sql('SELECT t1.*, IF(t2.id>0,1,0) as `admin` FROM `user` t1 LEFT JOIN `admin` t2 ON t1.uid=t2.uid WHERE t1.uid = ?');
        $stm->bindValue(1, $userId, DB::PARAM_INT);
        $stm->execute();
        return $stm->fetchObject(__CLASS__);
    }

    public function verifyPassword($password)
    {
        return password_verify($password, $this->password);
    }

    public function setPassword($password)
    {
        $this->password = password_hash($password, PASSWORD_BCRYPT);
    }

    public function isAdmin()
    {
        return $this->admin;
    }
}