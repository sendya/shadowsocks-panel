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
error_reporting(E_ERROR | E_PARSE);
@ini_set('display_errors', 'on');
@ini_set('expose_php', false);
@date_default_timezone_set('Asia/Shanghai');
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
    if ($whereIsCommand = (PHP_OS == 'WINNT')) {
        return $text;
    }
    $out = "";
    switch($status) {
        case "SUCCESS":
            $out = "[44m"; //Blue fonts
            break;
        case "FAILURE":
            $out = "[1;137;41m"; //Red background
            break;
        case "WARNING":
            $out = "[1;37;31m"; //Red fonts
            break;
        case "NOTE":
            $out = "[1;134;34m"; //Blue background
            break;
        default:
            throw new Exception("Invalid status: " . $status);
    }
    return chr(27) . "$out" . "$text" . chr(27) . "[0m";
}

function download($url, $filePath) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $binary = curl_exec($ch);
    if (!@file_put_contents($filePath, $binary) || curl_errno($ch)) {
        echo colorize('FAILED!'. PHP_EOL . curl_error($ch) . PHP_EOL, 'WARNING');
        curl_close($ch);
        return false;
    }
    curl_close($ch);
    echo 'Done!' . PHP_EOL;
}

function print_arr($arr) {
    foreach($arr as $ret) {
        echo $ret . PHP_EOL;
    }
}

switch ($argv[1]) {
    case 'install':
        echo 'Check whether the function is disabled...';
        // check functions disabled
        if(!function_exists('system') || !function_exists('exec')) {
            echo 'FAILED! ' . PHP_EOL . PHP_EOL;
            echo colorize('ERROR: system() or exec() function is disabled!', 'WARNING') . PHP_EOL;
            echo 'Please run command: ' . colorize('php -d disable_functions=\'\' index.php install', 'WARNING') . PHP_EOL;
            break;
        }
        echo 'Success' . PHP_EOL;
        echo 'Check composer install...';
        if (!file_exists(ROOT_PATH . 'composer.phar')) {
            echo 'Not Installed' . PHP_EOL . 'Downloading...';
            if (download("http://getcomposer.org/composer.phar", ROOT_PATH . 'composer.phar') === false) {
                echo 'Retry...' . PHP_EOL;
                download("https://install.phpcomposer.com/composer.phar", ROOT_PATH . 'composer.phar');
            }
        }
        $return_arr = [];
        exec(PHP_BINARY . ' ' . ROOT_PATH . 'composer.phar -V', $return_arr);
        // print_arr($return_arr);
        if(!file_exists(ROOT_PATH . 'composer.phar') || stripos($return_arr[count($return_arr)-1], 'Composer') === false) {
            @unlink(ROOT_PATH . 'composer.phar');
            echo colorize('Failed to download composer binary! please try again OR ', 'WARNING') ;
            echo colorize('curl -o composer.phar http://getcomposer.org/composer.phar', 'WARNING') . PHP_EOL;
            break;
        }
        unset($return_arr);
        echo 'Success' . PHP_EOL;
        echo 'Now installing dependencies...' . PHP_EOL;
        system(PHP_BINARY . ' ' . ROOT_PATH . 'composer.phar install');
        if (!file_exists(ROOT_PATH . 'Package/autoload.php')) {
            echo colorize('It seems composer failed to install package', 'FAILURE') . PHP_EOL;
            break;
        }
        echo 'Now reloading packages and config...'. PHP_EOL;
        $configFile = DATA_PATH . 'Config.php';
        if (!file_exists($configFile)) {
            echo 'Config Unknown... copying..' . PHP_EOL;
            copy(DATA_PATH . 'Config.simple.php', $configFile);
            echo colorize('Please modify ', 'WARNING') . colorize('./Data/Config.php','FAILURE') . colorize(' and try again', 'WARNING') . PHP_EOL;
            break;
        }

        @include ROOT_PATH . 'Package/autoload.php';
        try {
            @include DATA_PATH . 'Config.php';
        } catch (PDOException $e) {
            echo colorize('Database not available! Please modify ', 'WARNING'). colorize('./Data/Config.php','FAILURE') . colorize(' and try again', 'WARNING') . PHP_EOL;
            break;
        }

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
        print_arr($return_arr);
        if(stripos($return_arr[count($return_arr)-1], 'All Done.') === false) {
            echo colorize(PHP_EOL. PHP_EOL.'Failed to migrate database, you can try it manually: ', 'WARNING') . colorize('./Package/bin/phinx migrate', 'WARNING') . PHP_EOL;
            // rollback
            exec($phinxCommand . ' rollback', $return_arr, $return_arr2);
            break;
        }

        fwrite(STDOUT, "Do you want to install a resource file? (y or n): ");
        $installResource = trim(fgets(STDIN));

        if ($installResource == 'y' || $installResource == 'yes') {
            echo 'Now installing resources...' . PHP_EOL;
            echo 'Deleting old resources...  ' . PHP_EOL;
            echo delDir(ROOT_PATH . 'Public/Resource') ? 'Done.' . PHP_EOL : 'old resources not exist.' . PHP_EOL;
            echo 'Downloading resources...' . PHP_EOL;
            // download resource
            $resourcePath = ROOT_PATH . 'Resource.zip';
            $unzipPath = ROOT_PATH . 'Resource/';

            if ($whereIsCommand = (PHP_OS == 'WINNT')) {
                $resourcePath = iconv("utf-8","gb2312", $resourcePath);
                $unzipPath = iconv("utf-8","gb2312", $unzipPath);
            }

            if (download('https://mirrors.loacg.com/shadowsocks/shadowsocks-panel/1.3.0/Resource.zip', $resourcePath) === false) {
                echo colorize('FAILED' . PHP_EOL . 'Downloading...', 'WARNING');
                download('https://mirrors.loacg.com/shadowsocks/shadowsocks-panel/1.3.0/Resource.zip', $resourcePath);
            }
            if (file_exists($resourcePath)) {
/*                echo 'Unzip Resource.zip...' . PHP_EOL;
                $resource = zip_open($resourcePath);
                echo $resource . PHP_EOL;
                while ($dirResource = zip_read($resource)) {
                    if (zip_entry_open($resource, $dirResource)) {
                        $zipFileName = $unzipPath . zip_entry_name($dirResource);
                        $zipFilePath = substr($zipFileName,0,strrpos($zipFileName, "/"));
                        echo $zipFileName . PHP_EOL;
                        if(!is_dir($zipFilePath)) {
                            mkdir($zipFilePath,0755,true);
                        }
                        if(!is_dir($zipFileName)) {
                            $zipFileSize = zip_entry_filesize($dirResource);
                            if($zipFileSize < (1024*1024*6)) {
                                $zipFileContent = zip_entry_read($dirResource, $zipFileSize);
                                file_put_contents($zipFileName, $zipFileContent);
                            }
                        }

                    }
                }*/
		        $return_arr = [];
		        $resPath = ROOT_PATH . 'Resource/';
                exec("unzip -o -d $resPath $resourcePath", $return_arr);
		        print_arr($return_arr);
            }
            echo 'Copying resources...';
            copyDir(ROOT_PATH . 'Resource', ROOT_PATH . 'Public/Resource');
            echo 'Success' . PHP_EOL;
        }
        echo colorize('Note: new installed panel not have an administrator user. Please register your account directly', 'NOTE') . PHP_EOL;
        echo colorize('All done~ Cheers! ', 'NOTE') . PHP_EOL;
        break;
    case 'import-sspanel':
        // TODO: 从 ss-panel 导入用户数据


        break;
    case 'test':
        echo colorize('FAILED!' . PHP_EOL, 'SUCCESS');
        echo colorize('FAILED!' . PHP_EOL, 'FAILURE');
        echo colorize('FAILED!' . PHP_EOL, 'WARNING');
        echo colorize('FAILED!' . PHP_EOL, 'NOTE');

        break;
    default:
        echo 'Unknown command';
}
echo PHP_EOL;
