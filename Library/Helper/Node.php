<?php
/**
 * SS-Panel
 * A simple Shadowsocks management system
 * Author: Sendya <18x@loacg.com>
 */
namespace Helper;


class Node
{
    public static function NodeJson($server, $server_port, $password,  $method, $name) {
        return '{"server":"' . $server . '","server_port":' . $server_port . ',"local_port":1080,' . '"password":"'.$password.'","timeout":600,'. '"method":"' . $method . '", "remarks": "'.$name.'"}';
    }

    public static function NodeQr($server, $server_port, $password, $method) {
        $ssurl =  $method.":".$password."@".$server.":".$server_port;
        $ssqr = "ss://".base64_encode($ssurl);
        return array("ssurl"=>$ssurl, "ssqr"=>$ssqr);
    }


}