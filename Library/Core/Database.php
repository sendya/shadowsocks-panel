<?php
/**
 * KK Forum
 * A simple bulletin board system
 * Author: kookxiang <r18@ikk.me>
 */
namespace Core;

class Database {
    const MASTER = 'MASTER';
    const SLAVE = 'SLAVE';
    private static $inTransaction = false;
    private static $ConnectionPool = array(self::MASTER => array(), self::SLAVE => array());

    /**
     * Register a new database into connection pool
     * @link http://php.net/manual/pdo.construct.php
     * @param string $dsn Data Source Name, contains the information required to connect to the database.
     * @param string $username Username for the DSN string
     * @param string $password Password for the DSN string
     * @param array $options A key=>value array of driver-specific connection options.
     * @param string $type Connection type (MASTER / SLAVE)
     */
    public static function register(
        $dsn,
        $username = null,
        $password = null,
        $options = array(),
        $type = self::MASTER
    ) {
        self::$ConnectionPool[$type][] = array(
            'dsn' => $dsn,
            'username' => $username,
            'password' => $password,
            'options' => $options,
        );
    }

    /**
     * Prepares a statement for execution and returns a statement object
     * @link http://php.net/manual/pdo.prepare.php
     * @param string $statement This must be a valid SQL statement for the target database server.
     * @param array $driver_options Please refer to the document of PDO prepare method
     * @return \PDOStatement
     */
    public static function prepare($statement, array $driver_options = array()) {
        $connection = self::AutoDecideServer($statement);
        return $connection->prepare($statement, $driver_options);
    }

    /**
     * Select a database connection automatically
     * @param $statement string SQL statement
     * @return \PDO PDO Connection
     * @throws Error
     */
    public static function AutoDecideServer($statement) {
        if (self::$inTransaction) {
            return self::GetServer(self::MASTER);
        }
        static $keywords = array('INSERT', 'REPLACE', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP');
        list($operation) = explode(' ', strtoupper(trim($statement)), 2);
        if (in_array($operation, $keywords)) {
            return self::GetServer(self::MASTER);
        } else {
            return self::GetServer(self::SLAVE);
        }
    }

    /**
     * Get a database connection
     * @param string $type Connection type (MASTER / SLAVE)
     * @return \PDO PDO Connection
     * @throws Error
     */
    public static function GetServer($type = self::MASTER) {
        static $SelectedConnection = array();
        if (empty(self::$ConnectionPool[self::SLAVE])) {
            $type = self::MASTER;
        }
        if ($SelectedConnection[$type]) {
            return $SelectedConnection[$type];
        }
        $offset = array_rand(self::$ConnectionPool[$type]);
        $config = self::$ConnectionPool[$type][$offset];
        if (!$config) {
            throw new Error('No available database connection');
        }
        return $SelectedConnection[$type] = new \PDO($config['dsn'], $config['username'], $config['password'],
            $config['options']);
    }

    /**
     * Execute an SQL statement and return the number of affected rows
     * @link http://php.net/manual/pdo.exec.php
     * @param string $statement The SQL statement to prepare and execute.
     * @return int <b>PDO::exec</b> returns the number of rows that were modified or deleted by the SQL statement
     * you issued. If no rows were affected, <b>PDO::exec</b> returns 0.
     */
    public static function exec($statement) {
        $connection = self::AutoDecideServer($statement);
        return $connection->exec($statement);
    }

    /**
     * Executes an SQL statement, returning a result set as a PDOStatement object
     * @link http://php.net/manual/pdo.query.php
     * @param string $statement The SQL statement to prepare and execute.
     * @return \PDOStatement <b>PDO::query</b> returns a PDOStatement object, or <b>FALSE</b> on failure.
     */
    public static function query($statement) {
        $connection = self::AutoDecideServer($statement);
        return $connection->query($statement);
    }

    /**
     * Returns the ID of the last inserted row or sequence value
     * @link http://php.net/manual/pdo.lastinsertid.php
     * @param string $name Name of the sequence object from which the ID should be returned
     * @return string <p>If a sequence name was not specified for the <i>name</i> parameter, <b>PDO::lastInsertId</b>
     * returns a string representing the row ID of the last row that was inserted into the database.</p><p>If
     * a sequence name was specified for the <i>name</i> parameter, <b>PDO::lastInsertId</b> returns a string
     * representing the last value retrieved from the specified sequence object.</p>
     */
    public static function lastInsertId($name = null) {
        $connection = self::GetServer(self::MASTER);
        return $connection->lastInsertId($name);
    }

    /**
     * Initiates a transaction
     * @link http://php.net/manual/pdo.begintransaction.php
     * @return bool <b>TRUE</b> on success or <b>FALSE</b> on failure.
     */
    public static function beginTransaction() {
        $connection = self::GetServer(self::MASTER);
        $result = $connection->beginTransaction();
        if ($result) {
            self::$inTransaction = true;
        }
        return $result;
    }

    /**
     * Commits a transaction
     * @link http://php.net/manual/pdo.commit.php
     * @return bool <b>TRUE</b> on success or <b>FALSE</b> on failure.
     */
    public static function commit() {
        $connection = self::GetServer(self::MASTER);
        $result = $connection->commit();
        if ($result) {
            self::$inTransaction = false;
        }
        return $result;
    }

    /**
     * Rolls back a transaction
     * @link http://php.net/manual/pdo.rollback.php
     * @return bool <b>TRUE</b> on success or <b>FALSE</b> on failure.
     */
    public static function rollBack() {
        $connection = self::GetServer(self::MASTER);
        $result = $connection->rollBack();
        if ($result) {
            self::$inTransaction = false;
        }
        return $result;
    }

    /**
     * Checks if inside a transaction
     * @link http://php.net/manual/pdo.intransaction.php
     * @return bool <b>TRUE</b> if a transaction is currently active, and <b>FALSE</b> if not.
     */
    public static function inTransaction() {
        return self::$inTransaction;
    }
}