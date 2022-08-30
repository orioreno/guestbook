# HOW TO RUN

## Requirements
PHP minimum version 7.4

## Server
Run server on http://localhost:5001 or http://YOUR_LOCAL_IP_ADDRESS:5001

- Run server on Windows: Open startserver.bat
- Run server on MacOS: Run startserver.sh on terminal

## Client
Run client on http://localhost:5000 or http://YOUR_LOCAL_IP_ADDRESS:5000

- Run server on Windows: Open startclient.bat
- Run server on MacOS: Run startclient.sh on terminal

## Change server client API address
You need Node JS with NPM to change client API address.
- Open site/.env
- Change API_URL and BROWSER_API_URL to http://YOUR_LOCAL_IP_ADDRESS:5001
- Open command line/terminal in site folder
- Run npm generate
```bash
npm run generate
```
