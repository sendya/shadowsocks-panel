<?php
/**
 * shadowsocks-panel
 * Add: 2016/5/23 14:36
 * Author: Sendya <18x@loacg.com>
 */

namespace Helper;


class Logger
{
    static $LOG_LEVEL_NAMES = array('FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG');

    private static $_instance;
    private $level = LOG_LEVEL;

    static function getInstance()
    {
        if (!(self::$_instance instanceof self)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    function debug($message, $name = 'DEBUG')
    {
        $this->_log(4, $message, $name);
    }

    function info($message, $name = 'INFO')
    {
        $this->_log(3, $message, $name);
    }

    function warn($message, $name = 'WARN')
    {
        $this->_log(2, $message, $name);
    }

    function error($message, $name = 'ERROR')
    {
        $this->_log(1, $message, $name);
    }

    function fatal($message, $name = 'FATAL')
    {
        $this->_log(0, $message, $name);
    }

    private function _log($level, $message, $name)
    {
        if ($level > $this->level) {
            return;
        }
        $day = date('Ymd');
        $log_file_path = DATA_PATH . "logs/{$name}-{$day}.log";
        self::createDir(dirname($log_file_path));
        $log_level_name = Logger::$LOG_LEVEL_NAMES[$level];
        $content = '[' . date('Y-m-d H:i:s') . '] ' . $log_level_name . ': ' . $message . "\n";
        file_put_contents($log_file_path, $content, FILE_APPEND);
    }

    private static function createDir($dir, $permission = 0777)
    {
        if (is_dir($dir)) {
            return;
        }
        self::createDir(dirname($dir), $permission);
        @mkdir($dir, $permission);
    }
}