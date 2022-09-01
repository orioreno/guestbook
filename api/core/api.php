<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: *');
if ($_SERVER['REQUEST_METHOD'] == "OPTIONS") {
  header("HTTP/1.1 200 OK");
  die();
}

date_default_timezone_set("Asia/Jakarta");

require_once "vendor/autoload.php";
require_once "model.php";

class API {
  var $method = 'GET';
  var $input = null;

  public function __construct() {
    $this->input = json_decode(file_get_contents("php://input"),true);
    $this->method = strtolower($_SERVER['REQUEST_METHOD']);
  }

  public function init() {
    if (method_exists($this, $this->method)) {
      return $this->{$this->method}();
    }
    header("HTTP/1.0 404 Not Found");
  }

  public function response_success($data = null) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
      'code' => 200,
      'data' => $data,
      'message' => 'Success'
    ]);
    die();
  }

  public function response_failed($statusCode, $text = '') {
    header('Content-Type: application/json; charset=utf-8');
    if (empty($text)) {
      switch ($statusCode) {
        case 100: $text = 'Continue'; break;
        case 101: $text = 'Switching Protocols'; break;
        case 200: $text = 'OK'; break;
        case 201: $text = 'Created'; break;
        case 202: $text = 'Accepted'; break;
        case 203: $text = 'Non-Authoritative Information'; break;
        case 204: $text = 'No Content'; break;
        case 205: $text = 'Reset Content'; break;
        case 206: $text = 'Partial Content'; break;
        case 300: $text = 'Multiple Choices'; break;
        case 301: $text = 'Moved Permanently'; break;
        case 302: $text = 'Moved Temporarily'; break;
        case 303: $text = 'See Other'; break;
        case 304: $text = 'Not Modified'; break;
        case 305: $text = 'Use Proxy'; break;
        case 400: $text = 'Bad Request'; break;
        case 401: $text = 'Unauthorized'; break;
        case 402: $text = 'Payment Required'; break;
        case 403: $text = 'Forbidden'; break;
        case 404: $text = 'Not Found'; break;
        case 405: $text = 'Method Not Allowed'; break;
        case 406: $text = 'Not Acceptable'; break;
        case 407: $text = 'Proxy Authentication Required'; break;
        case 408: $text = 'Request Time-out'; break;
        case 409: $text = 'Conflict'; break;
        case 410: $text = 'Gone'; break;
        case 411: $text = 'Length Required'; break;
        case 412: $text = 'Precondition Failed'; break;
        case 413: $text = 'Request Entity Too Large'; break;
        case 414: $text = 'Request-URI Too Large'; break;
        case 415: $text = 'Unsupported Media Type'; break;
        case 500: $text = 'Internal Server Error'; break;
        case 501: $text = 'Not Implemented'; break;
        case 502: $text = 'Bad Gateway'; break;
        case 503: $text = 'Service Unavailable'; break;
        case 504: $text = 'Gateway Time-out'; break;
        case 505: $text = 'HTTP Version not supported'; break;
        default:
            exit('Unknown http status code "' . htmlentities($statusCode) . '"');
        break;
      }
    }

    echo json_encode([
        'code' => $statusCode,
        'message' => $text
    ]);

    die();
  }
}