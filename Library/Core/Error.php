<?php
/**
 * KK Forum
 * A simple bulletin board system
 * Author: kookxiang <r18@ikk.me>
 */

/**
 * PHP7+ => Throwable 
 * PHP5+ PHP7- => Exception
 */
namespace Core;

class Error extends \Exception
{
    private $trace;

    /**
     * Create a Exception
     * @param string $message Error message
     * @param int $code Error code
     * @param \Throwable $previous Previous exception
     * @param array $trace Backtrace information
     */
    public function __construct($message = 'Internal Server Error', $code = 0, $previous = null, $trace = array())
    {
        parent::__construct($message, $code, $previous);
        $this->trace = $trace;
        if (!$trace) {
            $this->trace = debug_backtrace();
        }
    }

    /**
     * Register custom handler for uncaught exception and errors
     */
    public static function registerHandler()
    {
        set_exception_handler(array('\\Core\\Error', 'handleUncaughtException'));
        set_error_handler(array('\\Core\\Error', 'handlePHPError'), E_ALL);
    }

    public static function handlePHPError($errNo, $errStr, $errFile, $errLine)
    {
        if ($errNo == E_STRICT) {
            return;
        }
        if ($errNo == E_NOTICE) {
            return;
        }
        //if($errNo == E_DEPRECATED) return;
        $trace = debug_backtrace();
        array_unshift($trace, array('file' => $errFile, 'line' => $errLine));
        $exception = new self($errStr, $errNo, null, $trace);
        self::handleUncaughtException($exception);
    }

    /**
     * @param \Throwable $instance Exception or Error instance
     * @throws Error
     */
    public static function handleUncaughtException($instance)
    {
        @ob_end_clean();
        if (Database::inTransaction() && Database::getInstance()->inTransaction()) {
            Database::rollBack();
        }
        if (!($instance instanceof Error)) {
            $instance = new self($instance->getMessage(), intval($instance->getCode()), $instance,
                $instance->getTrace());
        }

        if(Router::extension() == '.json') {
            header("Content-Type: application/json;charset=UTF-8");
            echo json_encode( array("code" => intval($instance->getCode()), "hasError" => true, "message" => $instance->getMessage()));
            exit();
        }
        include Template::load('Misc/Error');
        exit();
    }

    /**
     * Format backtrace information
     * @return string Formatted backtrace information
     */
    public function formatBackTrace()
    {
        $backtrace = $this->trace;
        krsort($backtrace);
        $trace = '';
        foreach ($backtrace as $error) {
            if ($error['function'] == 'spl_autoload_call') {
                continue;
            }
            if ($error['function'] == 'getBackTrace') {
                continue;
            }
            $error['line'] = $error['line'] ? ":{$error['line']}" : '';
            $log = '';
            if ($error['file']) {
                $log = str_replace(str_replace('\\', '/', ROOT_PATH), '', $error['file']) . $error['line'];
            }
            if ($error['class']) {
                $error['class'] = str_replace('\\', '/', $error['class']);
                $log .= " ({$error['class']}{$error['type']}{$error['function']})";
            }
            $trace .= "{$log}\r\n";
        }
        return $trace;
    }
}
