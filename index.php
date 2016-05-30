#!env php
<?php
/**
 * KK-Framework install
 * Author: kookxiang <r18@ikk.me>
 */

use Helper\Option;

if (php_sapi_name() != 'cli') {
    exit('Sorry, This page is not available due to incorrect server configuration.');
}

// Initialize constants
define('ROOT_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('LIBRARY_PATH', ROOT_PATH . 'Library/');
define('DATA_PATH', ROOT_PATH . 'Data/');
define('TIMESTAMP', time());
@ini_set('display_errors', 'on');
@ini_set('expose_php', false);
@ini_set('date.timezone', 'Asia/Shanghai');
set_time_limit(0);

function command_exists($command)
{
    $whereIsCommand = (PHP_OS == 'WINNT') ? 'where' : 'which';
    $process = proc_open(
        "$whereIsCommand $command",
        array(
            0 => array("pipe", "r"), //STDIN
            1 => array("pipe", "w"), //STDOUT
            2 => array("pipe", "w"), //STDERR
        ),
        $pipes
    );
    if ($process !== false) {
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);
        return $stdout != '';
    }
    return false;
}

function copyDir($strSrcDir, $strDstDir)
{
    $dir = opendir($strSrcDir);
    if (!$dir) {
        return false;
    }
    if (!is_dir($strDstDir)) {
        if (!mkdir($strDstDir)) {
            return false;
        }
    }
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($strSrcDir . '/' . $file)) {
                if (!copydir($strSrcDir . '/' . $file, $strDstDir . '/' . $file)) {
                    return false;
                }
            } else {
                if (!copy($strSrcDir . '/' . $file, $strDstDir . '/' . $file)) {
                    return false;
                }
            }
        }
    }
    closedir($dir);
    return true;
}

function delDir($dir) {
    //先删除目录下的文件：
    $dh=@opendir($dir);
    while ($file=@readdir($dh)) {
        if($file!="." && $file!="..") {
            $fullpath=$dir."/".$file;
            if(!is_dir($fullpath)) {
                @unlink($fullpath);
            } else {
                deldir($fullpath);
            }
        }
    }

    @closedir($dh);
    //删除当前文件夹：
    if(@rmdir($dir)) {
        return true;
    } else {
        return false;
    }
}

function colorize($text, $status) {
    $out = "";
    switch($status) {
        case "SUCCESS":
            $out = "[1;34;42m"; //Green background
            break;
        case "FAILURE":
            $out = "[1;37;41m"; //Red background
            break;
        case "WARNING":
            $out = "[1;37;43m"; //Yellow background
            break;
        case "NOTE":
            $out = "[44m"; //Blue background
            break;
        default:
            throw new Exception("Invalid status: " . $status);
    }
    return chr(27) . "$out" . "$text" . chr(27) . "[0m";
}

switch ($argv[1]) {
    case 'install':
        if (!file_exists(ROOT_PATH . 'composer.phar')) {
            echo 'Downloading composer...';
            $ch = curl_init("http://getcomposer.org/composer.phar");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60);
            // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $binary = curl_exec($ch);
            if (curl_errno($ch)) {
                echo colorize('FAILED!' . PHP_EOL . curl_error($ch), 'FAILURE');
                curl_close($ch);
                break;
            }
            $fp = fopen(ROOT_PATH . 'composer.phar', 'wb');
            fputs($fp, $binary);
            fclose($fp);
            curl_close($ch);
            echo 'Done!' . PHP_EOL;
        }
        echo 'Now installing dependencies...' . PHP_EOL;
        if(!function_exists('system') || !function_exists('exec')) {
            echo colorize('FAILED! system() or exec() function is disabled!', 'FAILURE') . PHP_EOL;
            echo 'Please run command: ' . colorize('php -d disable_functions=\'\' index.php install', 'FAILURE') . PHP_EOL;
            break;
        }
        system(PHP_BINARY . ' ' . ROOT_PATH . 'composer.phar install');
        if (!file_exists(ROOT_PATH . 'Package/autoload.php')) {
            echo colorize('It seems composer failed to install package', 'FAILURE') . PHP_EOL;
            break;
        }
        echo 'Now reloading packages and config...';
        $configFile = DATA_PATH . 'Config.php';
        if (!file_exists($configFile)) {
            echo 'Config Unknown... copying..' . PHP_EOL;
            copy(DATA_PATH . 'Config.simple.php', $configFile);
            echo colorize('Please modify ./Data/Config.php and try again', 'WARNING') . PHP_EOL;
            break;
        }

        @include ROOT_PATH . 'Package/autoload.php';
        @include DATA_PATH . 'Config.php';
        if (Option::getConfig('ENCRYPT_KEY') == 'Please generate key and paste here') {
            Option::setConfig('ENCRYPT_KEY', Option::createKey());
        }
        if (Option::getConfig('COOKIE_KEY') === null) {
            $str = file_get_contents(DATA_PATH . 'Config.php');
            preg_match("/define\\('ENCRYPT_KEY', '(.*)'\\);/", $str, $res);
            if (count($res) >= 1) {
                $str2 = preg_replace("/define\\('ENCRYPT_KEY', '(.*)'\\);/",
                    $res[0] . PHP_EOL . "define('COOKIE_KEY', '" . Option::createKey() . "');", $str);
            }
            file_put_contents(DATA_PATH . 'Config.php', $str2);
        } elseif (Option::getConfig('COOKIE_KEY') == 'Please generate key and paste here' || Option::getConfig('COOKIE_KEY') == '') {
            Option::setConfig('COOKIE_KEY', Option::createKey());
        }
        echo 'Done!' . PHP_EOL;

        echo 'Now migrating database...' . PHP_EOL;
        if (PATH_SEPARATOR != ':') {
            $phinxCommand = ROOT_PATH . 'Package\bin\phinx.bat';
        } else {
            $phinxCommand = PHP_BINARY . ' ' . ROOT_PATH . 'Package/robmorgan/phinx/bin/phinx';
        }
        exec($phinxCommand . ' migrate', $return_arr, $return_arr2);
        if(stripos($return_arr[count($return_arr)-1], 'All Done.') === false) {
            echo colorize('FAILED! migrate database wrong. Please run command: ', 'FAILURE') . colorize('./Package/bin/phinx migrate', 'WARNING') . PHP_EOL;
            // rollback
            exec($phinxCommand . ' rollback', $return_arr, $return_arr2);
            break;
        } else {
            foreach($return_arr as $ret) {
                echo $ret . PHP_EOL;
            }
        }
        echo 'Now installing resources...' . PHP_EOL;
        echo 'Deleting old resources...  ' . PHP_EOL;
        echo delDir(ROOT_PATH . 'Public/Resource') ? 'Done.' . PHP_EOL : 'old resources not exist.' . PHP_EOL;
        echo 'Copying resources...' . PHP_EOL;
        copyDir(ROOT_PATH . 'Resource', ROOT_PATH . 'Public/Resource');

        echo colorize('All done~ Cheers! open site: ', 'NOTE') . colorize(BASE_URL . 'yourdomain.com/', 'SUCCESS') . PHP_EOL;
        break;
    case 'import-sspanel':
        // TODO: 从 ss-panel 导入用户数据


        break;
    default:
        echo 'Unknown command';
}
echo PHP_EOL;
