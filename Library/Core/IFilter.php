<?php
/**
 * KK-Framework
 * Author: kookxiang <r18@ikk.me>
 */

namespace Core;

interface IFilter
{
    public function preRoute(&$path);
    public function afterRoute(&$className, &$method);
    public function preRender();
    public function afterRender();
    public function redirect(&$targetUrl);
}
