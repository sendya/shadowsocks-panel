<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Helper;

class PHPLock
{
    private $_PHP_LOCK = array();
    private $code;
    private $lockId = 1;

    public function __construct(&$code)
    {
        $this->code = &$code;
        $this->_PHP_LOCK = array();
    }

    public function acquire()
    {
        $this->code = preg_replace_callback('/<\?php.+?\?>/is', array($this, '_lockContent'), $this->code);
    }

    public function release()
    {
        foreach ($this->_PHP_LOCK as $LOCK_ID => $sourceCode) {
            $this->code = str_replace($LOCK_ID, $sourceCode, $this->code);
        }
        $this->_PHP_LOCK = array();
    }

    public function syncContent($newCode)
    {
        $this->code = $newCode;
        return $this;
    }

    public function getContent()
    {
        return $this->code;
    }

    private function _lockContent($matches)
    {
        $LOCK = '___PHP_CODE_LOCK_' . ($this->lockId++) . '___';
        $this->_PHP_LOCK[$LOCK] = $matches[0];
        return $LOCK;
    }
}