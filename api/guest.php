<?php
require_once 'core/api.php';
require_once 'models/guest_model.php';

class GuestAPI extends API {
  var $model;
  function __construct() {
    parent::__construct();
    $this->model = new GuestModel();
  }

  function get() {
    $data = $this->model->getAll();
    $columns = [];
    foreach ($data as $row) {
      foreach ($row as $col => $val) {
        if (substr($col, 0, 1) !== '_' && !isset($columns[$col])) $columns[$col] = ucwords($col);
      }
    }

    $this->response_success([
      'columns' => $columns,
      'rows' => $data
    ]);
  }

  function put() {
    if (!empty($this->input)) {
      if (isset($this->input['cloneEventId'])) {
        if (($insert = $this->model->clone($this->input['cloneEventId'], isset($this->input['regenerate']) && $this->input['regenerate'] === true))) {
          $this->response_success($insert);
        }
        $this->response_failed(500);
      } else {
        if (($insert = $this->model->replace($this->input))) {
          $this->response_success($insert);
        }
      }
      $this->response_failed(500);
    }
    $this->response_failed(400);
  }

  function post() {
    if (!empty($this->input)) {
      if (($insert = $this->model->insert($this->input))) {
        $this->response_success($insert);
      }
      $this->response_failed(500);
    }
    $this->response_failed(400);
  }

  function patch() {
    if (isset($this->input['_id'])) {
      if (($update = $this->model->update($this->input))) {
        $this->response_success($update);
      }
      $this->response_failed(500);
    }
    $this->response_failed(400);
  }

  function delete() {
    if (isset($_GET['id']) && !empty($_GET['id'])) {
      if ($this->model->delete($_GET['id'])) {
        $this->response_success();
      }
      $this->response_failed(500);
    }
    $this->response_failed(400);
  }
}

$api = new GuestAPI();
$api->init();
