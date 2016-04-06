<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

if (PHP_SAPI != 'cli') {
    exit('This file could not be access directly.');
}

define('ROOT_PATH', dirname(__FILE__) . DIRECTORY_SEPARATOR);
define('LIBRARY_PATH', ROOT_PATH . 'Library/');
define('DATA_PATH', ROOT_PATH . 'Data/');
@ini_set('display_errors', 'on');

require ROOT_PATH . 'Package/autoload.php';
Core\Error::registerHandler();

@include DATA_PATH . 'Config.php';

$statement = \Core\Database::getInstance()->query('select database()');
$statement->execute();

return array(
    'paths' => array(
        'migrations' => ROOT_PATH . 'Migrations',
    ),
    'environments' => array(
        'default_database' => 'current',
        'current' => array(
            'name' => $statement->fetchColumn(),
            'connection' => \Core\Database::getInstance(),
        ),
    ),
);
