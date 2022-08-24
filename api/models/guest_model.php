<?php
require_once "event_model.php";
class GuestModel extends Model{
  public function __construct() {
    $this->initDb();
  }

  public function initDb() {
    $eventModel = new EventModel();
    $selectedEvent = $eventModel->selected();
    if (isset($selectedEvent['_id'])) $this->db = $this->use($selectedEvent['_id'], "guest");
  }

  public function getAll() {
    return $this->db->findAll();
  }

  private function generate_random_code($length = 6) {
    $characters = '123456789ABCDEFGHJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
      $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
  }

  private function generate_checkin_code($row) {
    $try = 0;
    $randomString = '';
    do {
      $randomString = $this->generate_random_code();
      $existing = $this->db->findBy(['_checkin_code', '=', $randomString]);
      $try++;
    } while ($try <= 3 && isset($existing['_id']));

    $row['_checkin_code'] = $randomString;

    return $row;
  }

  public function replace($data) {
    $this->drop();
    $this->initDb();

    foreach ($data as $idx => $row) {
      $row = $this->generate_checkin_code($row);
      $this->db->insert($row);
    }

    return true;
    // return $this->db->insertMany($data);
  }

  public function drop() {
    $this->db->deleteStore();

    require_once "attendance_model.php";
    $attendance_model = new AttendanceModel();
    $attendance_model->drop();
  }

  public function insert($data) {
    $data = $this->generate_checkin_code($data);
    return $this->db->insert($data);
  }

  public function update($data) {
    if (isset($data['_id'])) {
      $row = $this->db->findById($data['_id']);
      if (isset($data['regenerate']) && $data['regenerate']) {
        $row = $this->generate_checkin_code($row);
      }

      foreach ($row as $key => $value) {
        if (isset($data[$key])) {
          $row[$key] = $data[$key];
        }
      }
      return $this->db->update($row);
    }
  }

  public function delete($id) {
    return $this->db->deleteById($id);
  }

  public function getRowByCode($checkincode) {
    return $this->db->findOneBy(['_checkin_code', '=', strtoupper($checkincode)]);
  }

  public function clone($id, $regenerate = false) {
    $this->drop();
    $this->initDb();

    $dbSource = $this->use($id, "guest");
    $dataSource = $dbSource->findAll();
    foreach ($dataSource as &$row) {
      if (isset($row['_checkin_time'])) unset($row['_checkin_time']);
      if (isset($row['_id'])) unset($row['_id']);
      if ($regenerate) $row = $this->generate_checkin_code(($row));
      $this->db->insert($row);
    }

    return true;
  }
}
