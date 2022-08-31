<?php
require_once 'core/api.php';
require_once 'models/event_model.php';
require_once 'models/guest_model.php';

class CheckinAPI extends API {
  var $guestModel;
  var $eventModel;
  function __construct() {
    parent::__construct();
    $this->eventModel = new EventModel();
    $this->guestModel = new GuestModel();
  }

  function post() {
    if (isset($this->input['_checkin_code'])) {
      $guest = $this->guestModel->checkin($this->input['_checkin_code'], isset($this->input['manual']) ? $this->input['manual'] : false);
      if (isset($guest['name'])) {
        $selectedEvent = $this->eventModel->selected();
        $message = $guest['name'];
        if (isset($selectedEvent['checkin_success_message'])) {
            $message = $selectedEvent['checkin_success_message'];
            foreach ($guest as $key => $value) {
                $message = str_replace('{'.$key.'}', $value, $message);
            }
        }
        $guest['_checkin_message'] = $message;
        $this->response_success($guest);
      }
      $this->response_failed(509, "Invalid check in code");
    }
    $this->response_failed(400);
  }

}

$api = new CheckinAPI();
$api->init();
