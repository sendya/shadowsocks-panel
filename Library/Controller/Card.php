<?php
/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/11/9 14:38
 */


namespace Controller;


class Card
{

    /**
     * @JSON
     * @RequireLogin
     * @DynamicRoute /card/{any}/activation
     * @param $cardId
     */
    public function activation($cardId)
    {

    }

    /**
     * @RequireLogin
     * @Route /card/list
     */
    public function cardList()
    {

    }

    /**
     * @JSON
     * @RequireLogin
     * @DynamicRoute /card/{any}/update
     * @param $cardId
     */
    public function update($cardId)
    {

    }

    /**
     * @JSON
     * @RequireLogin
     * @DynamicRoute /card/{any}/delete
     * @param $cardId
     */
    public function delete($cardId)
    {

    }

    /**
     * @RequireLogin
     * @Route /card/export
     */
    public function export()
    {

    }
}