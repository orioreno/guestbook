<?php
require_once 'core/api.php';
require_once 'models/event_model.php';
require_once 'models/guest_model.php';
require_once 'models/attendance_model.php';

class AttendanceAPI extends API {
  var $attendance_model;
  var $guest_model;
  function __construct() {
    parent::__construct();
    $this->attendance_model = new AttendanceModel();
    $this->guest_model = new GuestModel();
  }

  function get() {
    $this->response_success($this->attendance_model->getAll());
  }

  function post() {
    if (isset($this->input['_checkin_code'])) {
      $guest = $this->guest_model->getRowByCode($this->input['_checkin_code']);
      if (isset($guest['_id'])) {
        if ($this->attendance_model->insert($guest['_id'], time(), isset($this->input['manual']) ? $this->input['manual'] : false)) {
          $this->event = new EventModel();
          $selectedEvent = $this->event->selected();
          $message = $guest['name'];
          if (isset($selectedEvent['scan_message'])) {
              $message = nl2br($selectedEvent['scan_message']);
              foreach ($guest as $key => $value) {
                  $message = str_replace('{'.$key.'}', $value, $message);
              }
          }

          $this->response_success($message);
        }
      }
      $this->response_failed(509, "Guest not found");
    }
    $this->response_failed(400);
  }
}

$api = new AttendanceAPI();
$api->init();
