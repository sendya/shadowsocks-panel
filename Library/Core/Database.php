<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

class Database extends \PDO
{
    private static $instance;

    /**
     * Initialize database config
     * @link http://php.net/manual/pdo.construct.php
     * @param string $dsn Data Source Name, contains the information required to connect to the database.
     * @param string $username Username for the DSN string
     * @param string $password Password for the DSN string
     * @param array $options A key=>value array of driver-specific connection options.
     * @throws Error
     */
    public static function initialize($dsn, $username = null, $password = null, $options = array())
    {
        if (self::$instance) {
            throw new Error('Cannot re-initialize database');
        }
        self::$instance = new Database($dsn, $username, $password, $options);
        self::$instance->setAttribute(self::ATTR_ERRMODE, self::ERRMODE_EXCEPTION);

        $currentSqlMode = Database::getInstance()->query('SELECT @@GLOBAL.SQL_MODE')->fetchColumn();
        if (strpos($currentSqlMode, 'STRICT_TRANS_TABLES')) {
            $currentSqlMode = explode(',', $currentSqlMode);
            $strictTransTable = array_search('STRICT_TRANS_TABLES', $currentSqlMode);
            unset($currentSqlMode[$strictTransTable]);
            $statement = self::$instance->prepare('SET SESSION sql_mode = ?');
            $statement->bindValue('1', implode(',', $currentSqlMode));
            $statement->execute();
        }
    }

    /**
     * Prepares a statement for execution and returns a statement object
     * @link http://php.net/manual/en/pdo.prepare.php
     * @param string $statement
     * @param array $driver_options [optional]
     * @return \PDOStatement
     */
    public static function sql($statement, array $driver_options = array())
    {
        return self::getInstance()->prepare($statement, $driver_options);
    }

    /**
     * Get current database connection
     * @return Database
     */
    public static function getInstance()
    {
        return self::$instance;
    }

    /**
     * Magic method: shorten code Database::getInstance()->xxx() to Database::_xxx()
     * @param $name string method name
     * @param $arguments array
     */
    public static function __callStatic($name, $arguments)
    {
        if ($name{0} == '_') {
            $name = substr($name, 1);
        }
        if (method_exists(self::$instance, $name)) {
            call_user_func_array(array(self::$instance, $name), $arguments);
        }
    }
}
