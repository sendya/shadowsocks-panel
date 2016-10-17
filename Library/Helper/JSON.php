<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Helper;

use Core\Error;
use Core\IFilter;
use Core\Template;
use Helper\Reflection as ReflectionHelper;
use ReflectionMethod;

class JSON implements IFilter
{
    protected static $statusCode = 200;
    protected $handle = false;
    protected $allowCallback = false;

    public static function setStatusCode($statusCode)
    {
        self::$statusCode = $statusCode;
    }

    public function preRender()
    {
        if ($this->handle) {
            $context = Template::getContext();
            if (Template::getView() == 'Misc/Error') {
                /** @var Error $error */
                $error = $context['instance'];
                $this->outputJson(array(
                    'code' => $error->getCode() ? $error->getCode() : 500,
                    'data' => null,
                    'hasError' => true,
                    'message' => $error->getMessage(),
                ));
            } elseif (Template::getView() == 'Misc/Redirect') {
                $this->outputJson(array(
                    'code' => 302,
                    'data' => null,
                    'hasError' => true,
                    'message' => $context['text'] ? $context['text'] : 'JSON request has been redirected',
                    'target' => $context['link']
                ));
            } else {
                $this->outputJson(array(
                    'code' => self::$statusCode,
                    'data' => $context,
                ));
            }
        }
    }

    private function outputJson($jsonData)
    {
        header('Content-type: application/json');
        if ($this->allowCallback) {
            $callback = $_POST['callback'] ? $_POST['callback'] : $_GET['callback'];
            if (preg_match('/[A-Za-z_0-9]+/', $callback)) {
                echo "{$callback}(";
                header('Content-type: application/javascript');
            } else {
                $this->allowCallback = false;
            }
        }
        echo json_encode($jsonData);
        if ($this->allowCallback) {
            echo ');';
        }
        exit();
    }

    public function preRoute(&$path)
    {
        // Do nothing.
    }

    public function afterRoute(&$className, &$method)
    {
        if ($_SERVER['HTTP_X_REQUESTED_WITH']) {
            $this->handle = true;
            // Check if method allow json output
            $reflection = new ReflectionMethod($className, $method);
            $markers = ReflectionHelper::parseDocComment($reflection);
            if ($markers['JSONP']) {
                $this->allowCallback = true;
            }
            if (!$markers['JSON'] && !$markers['JSONP']) {
                throw new Error('The request URL is not available', 403);
            }
        }
    }

    public function afterRender()
    {
        // Do nothing.
    }

    public function redirect(&$targetUrl)
    {
        if ($this->handle) {
            $this->outputJson(array(
                'code' => 302,
                'data' => null,
                'hasError' => true,
                'message' => 'JSON request has been redirected',
                'target' => $targetUrl
            ));
        }
    }
}
