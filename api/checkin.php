<?php
require_once 'core/api.php';
require_once 'models/guest_model.php';

class CheckinAPI extends API {
    var $model;
    function __construct() {
        parent::__construct();
        $this->model = new GuestModel();
    }

    function post() {
        if (isset($this->input['code'])) {
            $checkin = $this->model->checkin($this->input['code']);
            if ($checkin) {
                $this->event = new EventModel();
                $selectedEvent = $this->event->selected();
                $message = $checkin['name'];
                if (isset($selectedEvent['scan_message'])) {
                    $message = nl2br($selectedEvent['scan_message']);
                    foreach ($checkin as $key => $value) {
                        $message = str_replace('{'.$key.'}', $value, $message);
                    }
                }

                $this->response_success($message);
            }
            $this->response_failed(509, "Guest not found");
        }
        $this->response_failed(400);
    }
}

$api = new CheckinAPI();
$api->init();
