<?php
/**
 * Project: shadowsocks-panel
 * Time: 2016/11/9 10:41
 */

namespace Core;

class RedisCluster
{
    // 是否使用 Master/Slave 的读写集群方案
    private $_isUseCluster = false;

    // Slave 句柄标记
    private $_sn = 0;

    // 服务器连接句柄
    private $_linkHandle = array(
        'master' => null, // 只支持一台 Master
        'slave' => array(), // 可以有多台 Slave
    );

    public function __construct($isUseCluster = false)
    {
        $this->_isUseCluster = $isUseCluster;
    }

    /**
     * 使用长连接，不会自动关闭
     *
     * @param array $config Redis 服务器配置
     * @param bool $isMaster 当前添加的服务器是否为 Master 服务器
     * @return mixed
     */
    public function connect($config = array('host' => '127.0.0.1', 'port' => 6379), $isMaster = true)
    {
        if (!isset($config['port'])) {
            $config['port'] = 6379;
        }

        if ($isMaster) {
            $this->_linkHandle['master'] = new Redis();
            $ret = $this->_linkHandle['master']->pconnect($config['host'], $config['port']);
        } else {
            // 多个 Slave 连接
            $this->_linkHandle['slave'][$this->_sn] = new Redis();
            $ret = $this->_linkHandle['slave'][$this->_sn]->pconnect($config['host'], $config['port']);
            ++$this->_sn;
        }
        return $ret;
    }


    public function close($flag = 2)
    {
        switch ($flag) {
            case 0:
                $this->getRedis()->close();
                break;
            case 1:
                for ($i = 0; $i < $this->_sn; ++$i) {
                    $this->_linkHandle['slave'][$i]->close();
                }
                break;
            case 2:
            default:
                $this->getRedis()->close();
                for ($i = 0; $i < $this->_sn; ++$i) {
                    $this->_linkHandle['slave'][$i]->close();
                }
                break;
        }
        return true;
    }


    /**
     * 条件形式设置缓存，如果 key 不存时就设置，存在时设置失败
     *
     * @param string $key 缓存KEY
     * @param string $value 缓存值
     * @return boolean
     */
    public function setnx($key, $value)
    {
        return $this->getRedis()->setnx($key, $value);
    }

    /**
     * 删除缓存
     *
     * @param string || array $key 缓存KEY，支持单个健:"key1" 或多个健:array('key1','key2')
     * @return int 删除的健的数量
     */
    public function remove($key)
    {
        // $key => "key1" || array('key1','key2')
        return $this->getRedis()->delete($key);
    }

    /**
     * 写缓存
     *
     * @param string $key 组存KEY
     * @param string $value 缓存值
     * @param int $expire 过期时间， 0:表示无过期时间
     */
    public function set($key, $value, $expire = 0)
    {
        // 永不超时
        if ($expire == 0) {
            $ret = $this->getRedis()->set($key, $value);
        } else {
            $ret = $this->getRedis()->setex($key, $expire, $value);
        }
        return $ret;
    }

    /**
     * 读缓存
     *
     * @param string $key 缓存KEY,支持一次取多个 $key = array('key1','key2')
     * @return string || boolean 失败返回 false, 成功返回字符串
     */
    public function get($key)
    {
        // 是否一次取多个值
        $func = is_array($key) ? 'mGet' : 'get';
        // 没有使用M/S
        if (!$this->_isUseCluster) {
            return $this->getRedis()->{$func}($key);
        }
        // 使用了 M/S
        return $this->_getSlaveRedis()->{$func}($key);
    }

    /**
     * 值加加操作,类似 ++$i ,如果 key 不存在时自动设置为 0 后进行加加操作
     *
     * @param string $key 缓存KEY
     * @param int $default 操作时的默认值
     * @return int　操作后的值
     */
    public function incr($key, $default = 1)
    {
        if ($default == 1) {
            return $this->getRedis()->incr($key);
        } else {
            return $this->getRedis()->incrBy($key, $default);
        }
    }

    /**
     * 值减减操作,类似 --$i ,如果 key 不存在时自动设置为 0 后进行减减操作
     *
     * @param string $key 缓存KEY
     * @param int $default 操作时的默认值
     * @return int　操作后的值
     */
    public function decr($key, $default = 1)
    {
        if ($default == 1) {
            return $this->getRedis()->decr($key);
        } else {
            return $this->getRedis()->decrBy($key, $default);
        }
    }

    /**
     * 添空当前数据库
     *
     * @return boolean
     */
    public function clear()
    {
        return $this->getRedis()->flushDB();
    }

    public function getRedis($isMaster = true, $slaveOne = true)
    {
        if ($isMaster) {
            return $this->_linkHandle['master'];
        } else {
            return $slaveOne ? $this->_getSlaveRedis() : $this->_linkHandle['slave'];
        }
    }


    public function __call($name, $arguments)
    {
        return call_user_func($name, $arguments);
    }


    /**
     * 随机 HASH 得到 Redis Slave 服务器句柄
     *
     * @return redis object
     */
    private function _getSlaveRedis()
    {
        // 就一台 Slave 机直接返回
        if ($this->_sn <= 1) {
            return $this->_linkHandle['slave'][0];
        }
        // 随机 Hash 得到 Slave 的句柄
        $hash = $this->_hashId(mt_rand(), $this->_sn);
        return $this->_linkHandle['slave'][$hash];
    }

    /**
     * 根据ID得到 hash 后 0～m-1 之间的值
     *
     * @param string $id
     * @param int $m
     * @return int
     */
    private function _hashId($id, $m = 10)
    {
        //把字符串K转换为 0～m-1 之间的一个值作为对应记录的散列地址
        $k = md5($id);
        $l = strlen($k);
        $b = bin2hex($k);
        $h = 0;
        for ($i = 0; $i < $l; $i++) {
            //相加模式HASH
            $h += substr($b, $i * 2, 2);
        }
        $hash = ($h * 1) % $m;
        return $hash;
    }

    /**
     *  lpush
     */
    public function lpush($key, $value)
    {
        return $this->getRedis()->lpush($key, $value);
    }

    /**
     *  add lpop
     */
    public function lpop($key)
    {
        return $this->getRedis()->lpop($key);
    }

    /**
     * lrange
     */
    public function lrange($key, $start, $end)
    {
        return $this->getRedis()->lrange($key, $start, $end);
    }

    /**
     *  set hash opeation
     */
    public function hset($name, $key, $value)
    {
        if (is_array($value)) {
            return $this->getRedis()->hset($name, $key, serialize($value));
        }
        return $this->getRedis()->hset($name, $key, $value);
    }

    /**
     *  get hash opeation
     */
    public function hget($name, $key = null, $serialize = true)
    {
        if ($key) {
            $row = $this->getRedis()->hget($name, $key);
            if ($row && $serialize) {
                unserialize($row);
            }
            return $row;
        }
        return $this->getRedis()->hgetAll($name);
    }

    /**
     *  delete hash opeation
     */
    public function hdel($name, $key = null)
    {
        if ($key) {
            return $this->getRedis()->hdel($name, $key);
        }
        return $this->getRedis()->hdel($name);
    }

    /**
     * Transaction start
     */
    public function multi()
    {
        return $this->getRedis()->multi();
    }

    /**
     * Transaction send
     */
    public function exec()
    {
        return $this->getRedis()->exec();
    }
}
