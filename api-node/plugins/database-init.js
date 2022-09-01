const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const dir = process.env.DBDIR;
const filename = process.env.DBNAME;


// Create db directory if not exist
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
  console.log(dir + ' directory created!');
}

const fullpath = dir + '/' + filename;

// Create guestbook.db file if not exist
fs.open(fullpath,'r',function(err, fd){
  if (err) {
    fs.writeFile(fullpath, '', function(err) {
        if(err) {
            console.log(err);
        }
        console.log(fullpath + " file created!");
    });
  }
});

const db = new sqlite3.Database(dir + '/' + filename, function (err) {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  }else{
    console.log('Connected to the SQLite database.');

    /**
     * TABLE INITIALIZATION
     */

    // Create table event
    db.run(`CREATE TABLE event (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name text NOT NULL,
        selected INTEGER,
        password TEXT NOT NULL,
        created INTEGER NOT NULL,
        modified INTEGER,
        CONSTRAINT event_name_uk UNIQUE (name)
        )`,
    (err) => {
        if (!err) {
          console.log("Table event created");
        }
    });

    // Create table checkin config
    db.run(`CREATE TABLE checkin_config (
      event_id INTEGER PRIMARY KEY NOT NULL,
      success_message TEXT,
      font_color TEXT,
      box_input_color TEXT,
      text_input_color TEXT,
      success_overlay_color TEXT,
      failed_overlay_color TEXT,
      background_image BLOB,
      success_audio BLOB,
      failed_audio BLOB,
      created INTEGER,
      modified INTEGER
      )`,
    (err) => {
        if (!err) {
          console.log("Table checkin_config created");
        }
    });

    // Create table guest
    db.run(`CREATE TABLE guest (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      checkin_code TEXT NOT NULL,
      misc TEXT,
      created INTEGER NOT NULL,
      modified INTEGER,
      CONSTRAINT event_name_uk UNIQUE (event_id, checkin_code)
      )`,
    (err) => {
        if (!err) {
          console.log("Table guest created");

          // Create table checkin index
          db.run(`CREATE INDEX guest_idx ON guest(event_id)`,
          (err) => {
              if (!err) {
                console.log("Index guest_idx created");
              }
          });

        }
    });

    // Create table checkin
    db.run(`CREATE TABLE checkin (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      event_id INTEGER NOT NULL,
      guest_id INTEGER NOT NULL,
      time INTEGER NOT NULL,
      manual INTEGER NOT NULL
    )`,
    (err) => {
        if (!err) {
          console.log("Table checkin created");
          // Create table checkin index
          db.run(`CREATE INDEX checkin_idx ON checkin(event_id, guest_id)`,
          (err) => {
              if (!err) {
                console.log("Index checkin_idx created");
              }
          });
        }
    });
  }
});
