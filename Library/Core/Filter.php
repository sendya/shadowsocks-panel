<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

final class Filter
{
    private static $registeredFilter = array();

    public static function register(IFilter $filter)
    {
        $className = get_class($filter);
        foreach (self::$registeredFilter as $existFilter) {
            if (get_class($existFilter) == $className) {
                return;
            }
        }
        self::$registeredFilter[] = $filter;
    }

    public static function remove(IFilter $filter)
    {
        $className = get_class($filter);
        foreach (self::$registeredFilter as $key => $existFilter) {
            if (get_class($existFilter) == $className) {
                unset(self::$registeredFilter[$key]);
                return;
            }
        }
    }

    public static function preRoute(&$path){
        foreach (self::$registeredFilter as $filter) {
            $filter->preRoute($path);
        }
    }
    public static function afterRoute(&$className, &$method){
        foreach (self::$registeredFilter as $filter) {
            $filter->afterRoute($className, $method);
        }
    }
    public static function preRender(){
        foreach (self::$registeredFilter as $filter) {
            $filter->preRender();
        }
    }
    public static function afterRender(){
        foreach (self::$registeredFilter as $filter) {
            $filter->afterRender();
        }
    }
    public static function redirect(&$targetUrl){
        foreach (self::$registeredFilter as $filter) {
            $filter->redirect($targetUrl);
        }
    }
}
