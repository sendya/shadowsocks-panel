#!env php
<?php
/**
 * Project Titor
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
@ini_set('display_errors', 'on');
@ini_set('expose_php', false);
@ini_set('date.timezone','Asia/Shanghai');
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
        if (($file!='.') && ($file!='..')) {
            if (is_dir($strSrcDir.'/'.$file) ) {
                if (!copydir($strSrcDir.'/'.$file, $strDstDir.'/'.$file)) {
                    return false;
                }
            } else {
                if (!copy($strSrcDir.'/'.$file, $strDstDir.'/'.$file)) {
                    return false;
                }
            }
        }
    }
    closedir($dir);
    return true;
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
                echo 'FAILED!' . PHP_EOL . curl_error($ch);
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
        system(PHP_BINARY . ' ' . ROOT_PATH . 'composer.phar install');
        if (!file_exists(ROOT_PATH . 'Package/autoload.php')) {
            echo 'It seems composer failed to install package';
            break;
        }
        echo 'Now reloading packages and config...';
        $configFile = DATA_PATH . 'Config.php';
        if (!file_exists($configFile)) {
            echo 'Config Unknown... copying..' . PHP_EOL;
            copy(DATA_PATH . 'Config.simple.php', $configFile);
            echo 'Please modify ./Data/Config.php and try again';
            break;
        }

        @include ROOT_PATH . 'Package/autoload.php';
        @include DATA_PATH . 'Config.php';
        echo 'Done!' . PHP_EOL;

        echo 'Now migrating database...' . PHP_EOL;
        // $phinxCommand = PHP_BINARY . ' ' . ROOT_PATH . 'Package/bin/phinx migrate';
        $phinxCommand = PHP_BINARY . ' ' . ROOT_PATH . 'Package/bin/phinx migrate';
        if(PATH_SEPARATOR!=':') {
            $phinxCommand = ROOT_PATH . 'Package\bin\phinx.bat migrate';
        }
        system($phinxCommand);

        echo 'Now check resources is exits...' . PHP_EOL;
        if(!is_dir(ROOT_PATH . 'Public/Resource')) {
            echo 'Resources is not existed, gulping...' . PHP_EOL;
            copyDir(ROOT_PATH . 'Resource', ROOT_PATH . 'Public/Resource');
        }

        /*
        临时屏蔽 npm 自动构建
        if (!command_exists('npm')) {
            echo 'It seems like you don\'t have a valid npm installation. Please refer to http://nodejs.org';
            break;
        }
        echo 'Installing front-end packages...';
        system('npm install');
        echo 'Building front-end resources...'.PHP_EOL;
        system('npm run build');
        echo 'All done~ Cheers!';
        */
        echo 'All done~ Cheers!';
        break;
    default:
        echo 'Unknown command';
}
echo PHP_EOL;