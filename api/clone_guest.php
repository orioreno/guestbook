<?php
require_once 'core/api.php';
require_once 'models/guest_model.php';

class CloneGuestAPI extends API {
    var $model;
    function __construct() {
        parent::__construct();
        $this->model = new GuestModel();
    }

    function post() {
        if (isset($this->input['_id'])) {
            if (($insert = $this->model->clone($this->input['_id'], isset($this->input['regenerate']) && $this->input['regenerate'] === true))) {
                $this->response_success($insert);
            }
            $this->response_failed(500);
        }
        $this->response_failed(400);
    }
}

$api = new CloneGuestAPI();
$api->init();
