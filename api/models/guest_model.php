<?php
require_once "event_model.php";
class GuestModel extends Model{
    public function __construct() {
        $this->initDb();
    }

    public function initDb() {
        $eventModel = new EventModel();
        $selectedEvent = $eventModel->selected();
        if (isset($selectedEvent['_id'])) $this->use($selectedEvent['_id'], "guest");
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
    }

    public function insert($data) {
        $data = $this->generate_checkin_code($data);
        return $this->db->insert($data);
    }

    public function update($data) {
        return $this->db->update($data);
    }

    public function delete($id) {
        return $this->db->deleteById($id);
    }

    public function checkin($checkincode) {
        $row = $this->db->findOneBy(['_checkin_code', '=', strtoupper($checkincode)]);
        if (isset($row['_id'])) {
            $row['_checkin_time'] = date('Y-m-d H:i:s');
            if ($this->db->update($row)) {
                return $row;
            }
        }
        return false;
    }
}
