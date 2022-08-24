<?php
require_once "event_model.php";

class AttendanceModel extends Model {
  public function __construct() {
    $this->initDb();
  }

  public function initDb() {
    $eventModel = new EventModel();
    $selectedEvent = $eventModel->selected();
    if (isset($selectedEvent['_id'])) {
      $this->db = $this->use($selectedEvent['_id'], "attendance");
    }
  }

  public function drop() {
    $this->db->deleteStore();
  }

  public function getAll() {
    return $this->db->findAll();
  }

  public function insert($guest_id, $time, $manual = false) {
    return $this->db->insert(['guest_id' => $guest_id, 'time' => $time, 'manual' => $manual]);
  }
}
