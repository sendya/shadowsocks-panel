<?php
/*
 * Phinx config file
 */
if (PHP_SAPI != 'cli') {
    header('HTTP/1.0 404 Not Found');
    exit('This file could not be access directly.');
}
define('ROOT_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('LIBRARY_PATH', ROOT_PATH . 'Library/');
define('DATA_PATH', ROOT_PATH . 'Data/');
@ini_set('display_errors', 'on');
require ROOT_PATH . 'Package/autoload.php';
Core\Error::registerHandler();
@include DATA_PATH . 'Config.php';
return array(
    'paths' => array(
        'migrations' => ROOT_PATH . 'Migrations',
    ),
    'environments' => array(
        'default_database' => 'default',
        'default' => array(
            'name' => 'production',
            'connection' => \Core\Database::GetServer(),
        ),
    ),
);