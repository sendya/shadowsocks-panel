<?php
/**
 * Shadowsocks Panel
 * Author: kookxiang <r18@ikk.me>
 */
namespace Core;

class DefaultRouter {
    private $foundController = false;

    public function handleRequest() {
        $requestPath = Request::getRequestPath();
        $requestPath = ltrim($requestPath, '/');

        if (!$requestPath) {
            $requestPath = 'Index';
        }

        $this->findController($requestPath);

        if (!$this->foundController) {
            throw new Error('The request URL is not exists', 404);
        }
    }

    private function findController($requestPath, $subDir = '') {
        list($controller, $method) = explode('/', $requestPath, 2);

        $controller = ucfirst($controller);

        if (is_dir(LIBRARY_PATH . "Controller/{$subDir}{$controller}")) {
            if (!$method) {
                $method = 'Index';
            }
            $this->findController($method, $subDir . $controller . '/');
        } elseif (file_exists(LIBRARY_PATH . "Controller/{$subDir}{$controller}.php")) {
            if (!$method) {
                $method = 'index';
            } else {
                $method = lcfirst($method);
            }
            $classname = str_replace('/', '\\', "Controller/{$subDir}{$controller}");

            $controller = new $classname();

            if (method_exists($controller, $method)) {
                $controller->$method();
                $this->foundController = true;
            }
        }
    }
}
