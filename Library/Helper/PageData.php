<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Helper;

use Core\Database;

class PageData
{
    protected $recordPrePage = 10;
    protected $query;
    protected $countQuery;
    protected $currentPage = 1;
    protected $context = array();

    /**
     * Create a new PageData object.
     * @param string $tableName Target table name
     * @param string $extras Such as where statement or order statement
     * @param array $column Column names needs to be fetch
     */
    public function __construct($tableName, $extras = '', $column = array('*'))
    {
        $columns = implode(',', $column);
        $this->countQuery = Database::getInstance()->prepare("SELECT COUNT(*) FROM `{$tableName}` {$extras}");
        $this->query = Database::getInstance()->prepare("SELECT {$columns} FROM `{$tableName}` {$extras} LIMIT :pageDataStart,:pageDataRPP");

        if ($_GET['page']) {
            $this->setPage($_GET['page']);
        }
    }

    /**
     * Binds a parameter to the specified variable name
     * @link http://php.net/manual/en/pdostatement.bindparam.php
     * @see \PDOStatement::bindParam
     * @param mixed $parameter
     * @param mixed $variable
     * @param int $data_type
     * @param int $length
     * @param mixed $driver_options
     */
    public function bindParam(
        $parameter,
        &$variable,
        $data_type = Database::PARAM_STR,
        $length = null,
        $driver_options = null
    ) {
        $this->countQuery->bindParam($parameter, $variable, $data_type, $length, $driver_options);
        $this->query->bindParam($parameter, $variable, $data_type, $length, $driver_options);
    }

    /**
     * Binds a value to a parameter
     * @link http://php.net/manual/en/pdostatement.bindvalue.php
     * @see \PDOStatement::bindValue
     * @param mixed $parameter
     * @param mixed $value
     * @param int $data_type
     */
    public function bindValue($parameter, $value, $data_type = Database::PARAM_STR)
    {
        $this->countQuery->bindValue($parameter, $value, $data_type);
        $this->query->bindValue($parameter, $value, $data_type);
    }

    public function setPage($currentPage)
    {
        $this->currentPage = max(1, intval($currentPage));
    }

    public function setRecordPrePage(int $recordPrePage)
    {
        $this->recordPrePage = $recordPrePage;
    }

    public function execute()
    {
        $this->countQuery->execute();
        $totalRecord = $this->countQuery->fetchColumn();
        $totalPage = max(ceil($totalRecord / $this->recordPrePage), 1);
        $this->currentPage = min($this->currentPage, $totalPage);
        $this->query->bindValue(':pageDataStart', ($this->currentPage - 1) * $this->recordPrePage, Database::PARAM_INT);
        $this->query->bindValue(':pageDataRPP', $this->recordPrePage, Database::PARAM_INT);
        $this->query->execute();
        $data = $this->query->fetchAll(Database::FETCH_ASSOC);
        return $this->context = array(
            'data' => $data,
            'totalPage' => $totalPage,
            'currentPage' => $this->currentPage,
            'pageSize' => $this->recordPrePage
        );
    }

    public function getContext()
    {
        return $this->context;
    }
}
