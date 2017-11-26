<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/11/9 10:39
 */


namespace Controller;


use Core\I18N;
use Core\Template;

class Auth
{
    /**
     * @GET
     * @Route /auth/login
     */
    public function login()
    {
        Template::setView("Panel/login");
    }

    /**
     * @Route /auth/register
     */
    public function register()
    {
        Template::setView("Panel/register");
    }

    /**
     * @JSON
     * @POST
     * @Route /auth/doLogin.json
     */
    public function doLogin()
    {
        $username = $_POST['username'];
        $password = $_POST['password'];
        sleep(1);
        if ($username != null && $password != null) {
            return array("hasError" => false, "message" => I18N::parse("Auth.Controller.Login.Success"));
        }
        return array("hasError" => true, "message" => I18N::parse("Auth.Controller.Login.Failed"));
    }

    /**
     * @JSON
     * @POST
     * @Route /auth/register.json
     */
    public function doRegister()
    {

    }

    /**
     * @JSON
     * @PUT
     * @Route /auth/logout.json
     */
    public function doLogout()
    {

    }

    /**
     * @Route /auth/lostPassword
     */
    public function lostPassword()
    {

    }

    /**
     * @JSON
     * @Route /auth/lostPassword.json
     */
    public function doLostPassword()
    {

    }


}