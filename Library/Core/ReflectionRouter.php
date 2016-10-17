<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

use Helper\Reflection as ReflectionHelper;

class ReflectionRouter
{
    const CACHE_FILE = DATA_PATH . 'router.cache.php';

    private $Loaded = false;
    private $StaticRoute = array();
    private $DynamicRoute = array();
    private $FallbackRouter = array();

    private function loadRouterList()
    {
        if ($this->Loaded) {
            return;
        }
        if (file_exists(self::CACHE_FILE) && !REAL_TIME_MODE) {
            /** @noinspection PhpIncludeInspection */
            $router = @include self::CACHE_FILE;
            $this->StaticRoute = $router['Static'];
            $this->DynamicRoute = $router['Dynamic'];
            $this->FallbackRouter = $router['Fallback'];
        } else {
            $this->generateRouterList();
            $this->saveRouterCache();
        }
        $this->Loaded = true;
    }

    public function handleRequest()
    {
        if (!$this->Loaded) {
            $this->loadRouterList();
        }
        $requestPath = Request::getRequestPath();
        $requestPath = ltrim($requestPath, '/');
        if (!$requestPath) {
            $requestPath = '@Home';
        }
        Filter::preRoute($requestPath);
        $this->findController($requestPath);
    }

    private function findController($requestPath)
    {
        $route = array();
        $parameter = array();
        $context = null;
        $key = strtolower($requestPath);
        if ($this->StaticRoute[$key]) {
            $route = $this->StaticRoute[$key];
        } else {
            foreach ($this->DynamicRoute as $router) {
                if (!preg_match($router['regexp'], $requestPath, $matches)) {
                    continue;
                }
                // Remove the request string
                array_shift($matches);
                $route = $router['callback'];
                $parameter = $matches;
                break;
            }
        }
        if (!$route) {
            if ($this->FallbackRouter) {
                $route = $this->FallbackRouter;
            } else {
                throw new Error(I18N::parse('Error.Messages.PageNotExists', 'The request URL is not exists'), 404);
            }
        }
        list($className, $method) = $route;
        Filter::afterRoute($className, $method);
        $controller = new $className();
        if ($parameter) {
            $context = call_user_func_array(array($controller, $method), $parameter);
        } else {
            $context = $controller->$method();
        }
        if ($context) {
            Template::setContext($context);
        }
        Filter::preRender();
        Template::render();
        Filter::afterRender();
    }

    private static function includeDir($dir)
    {
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file{0} == '.') {
                continue;
            }
            if (substr($file, -4) == '.php') {
                /** @noinspection PhpIncludeInspection */
                include $dir . '/' . $file;
            } elseif (is_dir($dir . '/' . $file)) {
                self::includeDir($dir . '/' . $file);
            }
        }
    }

    public function generateRouterList()
    {
        $this->StaticRoute = array();
        $this->DynamicRoute = array();
        $this->FallbackRouter = array();
        try {
            self::includeDir(LIBRARY_PATH . 'Controller');
            $classList = get_declared_classes();
            foreach ($classList as $className) {
                if (substr($className, 0, 10) != 'Controller') {
                    continue;
                }
                $reflectionClass = new \ReflectionClass($className);
                $methods = $reflectionClass->getMethods();
                foreach ($methods as $reflectionMethod) {
                    $markers = ReflectionHelper::parseDocComment($reflectionMethod);
                    $callback = array($reflectionClass->getName(), $reflectionMethod->getName());
                    if ($markers['Home']) {
                        $this->StaticRoute['@home'] = $callback;
                    }
                    if ($markers['Route']) {
                        $path = strtolower(trim($markers['Route'], ' /'));
                        $this->StaticRoute[$path] = $callback;
                    }
                    if ($markers['DynamicRoute']) {
                        // Convert wildcard to regular expression
                        $regexp = '/^' . preg_quote(trim($markers['DynamicRoute'], ' /'), '/') . '$/i';
                        $regexp = str_replace('\\{any\\}', '(.+)', $regexp);
                        $regexp = str_replace('\\{string\\}', '(\w+)', $regexp);
                        $regexp = str_replace('\\{int\\}', '(\d+)', $regexp);
                        $this->DynamicRoute[] = array(
                            'callback' => $callback,
                            'regexp' => $regexp
                        );
                    }
                    if ($markers['FallbackRoute'] || $markers['FallBackRoute']) {
                        if ($this->FallbackRouter) {
                            throw new Error('Fallback route was already defined in ' . $this->FallbackRouter[0] . '->' . $this->FallbackRouter[1]);
                        }
                        $this->FallbackRouter = $callback;
                    }
                }
            }
        } catch (\Exception $e) {
            if (DEBUG_ENABLE) {
                throw $e;
            } else {
                throw new Error('Internal Error: Cannot parse router file');
            }
        }
    }

    public function saveRouterCache()
    {
        $router = array(
            'Static' => $this->StaticRoute,
            'Dynamic' => $this->DynamicRoute,
            'Fallback' => $this->FallbackRouter,
        );
        $output = '<?php' . PHP_EOL;
        $output .= 'if(!defined(\'ROOT_PATH\'))';
        $output .= ' exit(\'This file could not be access directly.\');' . PHP_EOL . PHP_EOL;
        $output .= 'return ' . var_export($router, true) . ';' . PHP_EOL;
        file_put_contents(self::CACHE_FILE, $output);
    }
}
