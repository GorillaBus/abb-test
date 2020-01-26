# abb-test
Technical test for ABB

## Installation

1. Make sure you have MongoDB installed in your system. Version 4.2 was used but should run with 4.0 too (not tested).
2. Clone this repo
3. Install dependencies with `npm install`
4. Import the database by running: `mongorestore -d abb db/` 
(make sure you don't have any other database with the name 'abb' in your mongodb server or use some other name)
5- Enter the src/ directory and run the server application: `cd src; node server.js`
6- Run a machine-client simulator: you can launch up to three instances using the three provided tokens. Run `node machine-client.js`.
To launch another instance edit the machine-client.js file, use a different token and run the new instance (you may like to do this after step 7 to see how the web client updates online machines).
7- Run the web client to monitor changes in real time: go the abb-test-front repo and run `npm start`

## tokens
Use the following tokens to connect up to three machines (the project supports multiple machines but you must create new profiles by hand):

Machine 1: 080fd43c58fabbb734f7cfccc7047e62
Machine 1: 080fd43c58fabbb734f7cfccc7047e63
Machine 1: 080fd43c58fabbb734f7cfccc7047e64

The web client uses the following token:

User 1: 080fd43c58fabbb734f7cfccc7047e65
