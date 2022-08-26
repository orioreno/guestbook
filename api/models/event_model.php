<?php
class EventModel extends Model{
  public function __construct() {
    $this->db = $this->use("event");
  }

  public function getAll() {
    return $this->db
      ->createQueryBuilder()
      ->select(['name', 'selected'])
      ->orderBy(['_id' => 'desc'])
      ->getQuery()
      ->fetch();
  }

  public function selected() {
    return $this->db->findOneBy(['selected', '=', true]);
  }

  public function getRow($id) {
    return $this->db->findById($id);
  }

  public function change($id) {
    $event = $this->db->findById($id);
    if (isset($event['_id'])) {
      $event['selected'] = true;
      $this->db->update($event);

      // delete selected fields
      foreach ($this->db->findAll() as $row) {
        if ($row['_id'] != $event['_id']) {
          $this->db->removeFieldsById($row['_id'], ['selected']);
        }
      }

      return $event;
    }
    return false;
  }

  public function insert($name, $password) {
    $existing = $this->db->findOneBy(['name', '=', $name]);
    if ($existing) {
      return 'Event '.$name.' already exist';
    }
    return $this->db->insert(['name' => $name, 'password' => $password]);
  }

  public function update($data) {
    if (isset($data['name'])) {
      $existing = $this->db->findOneBy([
        ['name', '=', $data['name']],
        ['_id', '!=', $data['_id']]
      ]);
      if ($existing) {
        return 'Event '.$data['name'].' already exist';
      }
    }
    return $this->db->update($data);
  }

  public function delete($id) {
    $event = $this->db->findById($id);
    if (isset($event['_id'])) {
      require_once "guest_model.php";
      $guestModel = new GuestModel();
      $guestModel->drop();

      $this->db->deleteById($event['_id']);

      $data = $this->getAll();

      if (isset($data[0])) {
        $this->change($data[0]['_id']);
      }

      return true;
    }
    return false;
  }
}
