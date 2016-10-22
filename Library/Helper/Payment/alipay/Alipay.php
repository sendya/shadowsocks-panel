<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 10/23/2016 2:02 AM
 */

namespace Helper\Payment\alipay;

use Core\Database as DB;
use Core\Error;
use Helper\Logger;
use Helper\Option;
use Model\Trade;

class Alipay
{
    private $url;
    private $notify;
    private $cookie;
    private $token;

    public function __construct($config) {

        if (!isset($config)) {
            throw new Error('Cookie 设置错误');
        }

        $this->cookie =  $config;
        $days = time() - 86400;
        $this->url = 'https://consumeprod.alipay.com/record/advanced.htm?beginDate='.date('Y.m.d',$days).'&beginTime=00%3A00&endDate='.date('Y.m.d').'&endTime=24%3A00&dateRange=customDate&status=all&keyword=bizOutNo&keyValue=&dateType=createDate&minAmount=&maxAmount=&fundFlow=in&tradeType=ALL&categoryId=&_input_charset=utf-8';
    }

    public function run() {

        $orderArr = $this->parse();

        if(empty($orderArr)) {
            echo "Cookie失效，请重新填写Cookie。\n";
            return false;
        } else if($orderArr == 'no_order') {
            echo "暂无订单。 \n";
            return false;
        }


        foreach($orderArr as $key => $order) {
            $notify = $this->notify($order);
            if($notify == 'success') echo '订单: ' . $order['trade'] . " 通知成功。\n";
            else if($notify == 'done')  echo '订单: ' . $order['trade'] . " 已经通知成功，无需再次通知。\n";
            else echo '订单: ' . $order['trade'] . " 通知失败。错误信息：$notify \n";
        }
    }

    /**
     * 请求支付宝
     * @return mixed|string
     */
    public function requestURL() {

        $ch = curl_init($this->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, array(
            'Host: consumeprod.alipay.com',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0',
            'Accept: */*',
            'Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding: gzip, deflate',
            'DNT: 1',
            'Referer: https://authgtj.alipay.com/login/index.htm',
            'Connection: keep-alive'
        ));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_COOKIE, $this->cookie);
        $response = curl_exec($ch);
        if(curl_errno($ch)) $response = curl_error($ch);
        /*
        list($header, $body) = explode("\r\n\r\n", $response);
        preg_match_all("/Set-Cookie:(.*)/i", $header, $matches);
        $cookie = '';
        foreach ($matches as $kk => $vv) {
            $cookie .= $vv[1];
        }

        $conf = Option::get('alipay_conf');
        if ($conf != $cookie) {
            Option::set('alipay_conf', $cookie);
        }
        */
        curl_close($ch);
        return $response;
    }

    /**
     * 解析内容
     * @return array|null|string
     */
    public function parse() {

        $data = $this->requestURL();
        file_put_contents(DATA_PATH . "logs/alipay.txt", $data);

        if(empty($data) || strlen($data) < 2000)  return null;  //如过抓取到的内容是空的或者小于2000字符说明cookie失效了。

        $html = new simple_html_dom();
        $html->load($data);
        $ymd = $html->find('.time-d');
        $his = $html->find('.time-h');
        $title = $html->find('.consume-title a'); // consume-title p
        $trade = $html->find('td.tradeNo p');
        $name = $html->find('p.name');
        $amount = $html->find('td.amount span');

        if(!$trade) return 'no_order';
        $info = array();
        foreach ($ymd as $key => $value) {
            //只要订单数字部分
            preg_match('/[0-9]\d*\.?\d*/',$trade[$key]->innertext,$tradeNo);
            // $titleName = preg_replace("/[ \n\t]*/", "", $title[$key]->innertext);
            $t_name = $name[$key]->innertext;
            if(strpos($t_name, "\\u") !== false) {
                $t_name = preg_replace_callback('/\\\\u([0-9a-f]{4})/i',
                    create_function(
                        '$matches',
                        'return mb_convert_encoding(pack("H*", $matches[1]), "UTF-8", "UCS-2BE");'
                    ),
                    trim($t_name));
            } else {
                $t_name = iconv('GB2312//IGNORE', 'UTF-8', $t_name);
            }
            $info[] = array(
                'time' => trim($ymd[$key]->innertext) . ' ' . trim($his[$key]->innertext),
                'title' => trim(iconv('GB2312//IGNORE', 'UTF-8', $title[$key]->innertext)),
                'trade' => trim($tradeNo[0]),
                'name' => trim($t_name),
                'amount' => trim(str_replace('+', '', $amount[$key]->innertext))
            );
        }
        $html->clear();

        return $info;
    }

    /**
     * 通知
     * @param array $order
     * @return string
     */
    public function notify(array $order) {

        $log = Logger::getInstance();
        $log->debug('Alipay Run..');
        foreach ($order as $key => $v) {
            $log->debug('K:' . $key . ', V:' .$v);
        }

        $t = Trade::getByTrade($order['trade']);

        if(!$t) {

            $trade = new Trade();
            $trade->time = $order['time'];
            $trade->title = $order['title'];
            $trade->trade = $order['trade'];
            $trade->name = $order['name'];
            $trade->amount = $order['amount'];
            $trade->has_notify = 0;
            $trade->save();

        } else {
            if($t->has_notify == 1) return 'done';
        }

        //MD5加密下当作签名传过去好校验是不是自己的
        $order['sig'] = strtoupper(md5($this->token));
        return "success";

        /*
        $ch = curl_init($this->notify);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($order));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);


        //print_r($response);
        if(curl_errno($ch)) return curl_error($ch);
        if($response == 'success') {
            $this->db->update('trade',['has_notify' => 1],['AND' => [['trade' => $order['trade']]]]);
            return 'success';
        } else {
            return '服务器未返回正确的参数。';
        }
        */
    }

}