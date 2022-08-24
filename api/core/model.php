<?php
class Model {
  private const databaseDirectory = 'database';
  var $db;
  public function use($databaseName, $databaseSubdirectory = "", $storeConfiguration = []) {
    $storeConfiguration['timeout'] = false;
    return new \SleekDB\Store($databaseName, self::databaseDirectory.($databaseSubdirectory ? '/'.$databaseSubdirectory : ''), $storeConfiguration);
  }
}
