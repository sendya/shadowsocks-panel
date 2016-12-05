#!env php
<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

if (php_sapi_name() != 'cli') {
    exit('Sorry, This page is not available due to incorrect server configuration.');
}
// Initialize constants
define('ROOT_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('LIBRARY_PATH', ROOT_PATH . 'Library/');
define('DATA_PATH', ROOT_PATH . 'Data/');
define('TIMESTAMP', time());
define('NT_OS', PATH_SEPARATOR != ':');
@ini_set('display_errors', 'on');
@ini_set('expose_php', false);
@date_default_timezone_set('Asia/Shanghai');
@ini_set('date.timezone', 'Asia/Shanghai');
set_time_limit(0);

switch ($argv[1]) {
    case 'install':
        if(!function_exists('system') || !function_exists('exec')) {
            echo colorize('FAILED! system() or exec() function is disabled!', 'FAILURE') . PHP_EOL;
            echo 'Please run command: ' . colorize('php -d disable_functions=\'\' index.php install', 'FAILURE') . PHP_EOL;
            break;
        }

        if (!file_exists(ROOT_PATH . 'composer.phar')) {
            if (composer_download(
                array("http://getcomposer.org/composer.phar", "http://static.loacg.com/soft/composer.phar"),
                ROOT_PATH . 'composer.phar') === false) {
                echo colorize('Failed to download composer binary! Retry the installation or download manually "composer"', 'FAILURE') . PHP_EOL;
                break;
            }
        }

        exec(PHP_BINARY . ' ' . ROOT_PATH . 'composer.phar -V', $ret);
        echos($ret);

        if(!file_exists(ROOT_PATH . 'composer.phar') || stripos($ret[count($ret)-1], 'Composer') === false) {
            @unlink(ROOT_PATH . 'composer.phar');
            echo colorize('Failed to download composer binary! Retry the installation or download manually "composer"', 'FAILURE') . PHP_EOL;
            break;
        }
        unset($ret);

        echo 'Now installing dependencies...' . PHP_EOL;
        system(PHP_BINARY . ' ' . ROOT_PATH . 'composer.phar install');
        if (!file_exists(ROOT_PATH . 'Package/autoload.php')) {
            echo colorize('It seems composer failed to install package, Please retry install', 'FAILURE') . PHP_EOL;
            break;
        }

        echo 'Now reloading packages and config...'. PHP_EOL;
        $configFile = DATA_PATH . 'Config.php';
        if (!file_exists($configFile)) {
            echo 'Config Unknown... copying..' . PHP_EOL;
            copy(DATA_PATH . 'Config.simple.php', $configFile);
            echo colorize('Please modify ./Data/Config.php and try again', 'WARNING') . PHP_EOL;
            break;
        }

        @include ROOT_PATH . 'Package/autoload.php';
        try {
            @include DATA_PATH . 'Config.php';
        } catch (PDOException $e) {
            echo colorize('Database not available! Please modify ./Data/Config.php and try again', 'WARNING') . PHP_EOL;
            break;
        }


        break;
    case 'update':

        break;
    case 'reinstall':

        break;
    case 'import':

        break;
    default:
        echo colorize('Unknown command' . PHP_EOL, 'WARNING');
        break;
}
echo PHP_EOL;

/**
 * Bash command colorize
 * @param $text
 * @param $status
 * @return string
 * @throws Exception
 */
function colorize($text, $status)
{
    if (NT_OS) return $text;
    $out = "";
    switch ($status) {
        case "SUCCESS":
            $out = "[44m"; // Blue fonts
            break;
        case "FAILURE":
            $out = "[1;137;41m"; // Red background
            break;
        case "WARNING":
            $out = "[1;37;31m"; // Red fonts
            break;
        case "NOTE":
            $out = "[1;134;34m"; // Blue background
            break;
        default:
            throw new Exception("Invalid status: " . $status);
    }
    return chr(27) . "$out" . "$text" . chr(27) . "[0m";
}

/**
 * Composer auto download
 * @param $url
 * @param $path
 * @return bool || string
 */
function composer_download(array $url, $path)
{
    echo 'Downloading composer...' . PHP_EOL;
    if (download($url[0], $path) === false) {
        if (!download($url[1], $path)) {
            return false;
        }
    }
    echo 'Done!' . PHP_EOL;
    return true;
}

/**
 * Print array string
 * @param $arr
 */
function echos($arr) {
    foreach($arr as $ret) {
        echo $ret . PHP_EOL;
    }
}

/**
 * Download file
 * @param $url
 * @param $path
 * @return bool
 */
function download($url, $path) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $binary = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'FAILED! ' . curl_error($ch) . PHP_EOL;
        curl_close($ch);
        return false;
    }
    $fp = fopen($path, 'wb');
    fputs($fp, $binary);
    fclose($fp);
    curl_close($ch);
    return true;
}