<?php
require_once 'core/api.php';
require_once 'models/event_model.php';

class EventAPI extends API {
  var $model;
  function __construct() {
    parent::__construct();
    $this->model = new EventModel();
  }

  function get() {
    if (isset($_GET['selected'])) {
      $this->response_success($this->model->selected());
    }
    $this->response_success($this->model->getAll());
  }

  function post() {
    if (isset($this->input['name']) && isset($this->input['password'])) {
      $insert = $this->model->insert($this->input['name'], $this->input['password']);
      if (is_string($insert)) {
        $this->response_failed(509, $insert);
      } else {
        $this->model->change($insert['_id']);
        $this->response_success($insert);
      }

      $this->response_failed(500);
    }
    $this->response_failed(400);
  }

  function patch() {
    if (isset($this->input['_id']) && isset($this->input['password'])) {
      $event = $this->model->getRow($this->input['_id']);
      if ($this->input['password'] == $event['password']) {
        if ($this->model->change($event['_id'])) {
          $this->response_success();
        }
      } else {
        $this->response_failed(509, 'Invalid password');
      }
      $this->response_failed(500);
    }
    $this->response_failed(400);
  }

  function put() {
    if (isset($this->input['_id'])) {
      $update = $this->model->update($this->input);
      if (is_string($update)) {
        $this->response_failed(509, $update);
      } else {
        $this->response_success();
      }
      $this->response_failed(500);
    }
    $this->response_failed(400);
  }

  function delete() {
    if (isset($_GET['id'])) {
      if ($this->model->delete($_GET['_id'])) {
        $this->response_success();
      }
      $this->response_failed(500);
    }
    $this->response_failed(400);
  }
}

$api = new EventAPI();
$api->init();
