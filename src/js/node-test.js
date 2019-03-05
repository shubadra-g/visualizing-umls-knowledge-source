const readline = require('readline');
// const rl = readline.createInterface({
// input: process.stdin,
// output: process.stdout
// });
// rl.question('mysql host name? ', (hostanswer) => {
// rl.question('mysql user name? ', (useranswer) => {
// rl.question('mysql password? ', (passwordanswer) => {
// rl.question('mysql database? ', (dbanswer) => {
// rl.close();

// hostname = 'ip-172-31-28-253';
hostname = 'ec2-18-220-188-107.us-east-2.compute.amazonaws.com'
user = 'umls-user';
password = 'password';
database = 'umls';


var mysql = require('mysql');
var connection = mysql.createConnection({
    host : hostname,
    user : user,
    password : password,
    database : database,
    multipleStatements: true,
    port : 3306
    
});

connection.connect();

var sql="USE umls;SELECT * FROM MRCONSO limit 1;";
var result = [];
connection.query(sql, function(err, rows, fields) {
    if (!err) {
            console.log('Returned Data:\n ', rows);
            console.log('Query Executed Successfully.');
            result = rows;
            console.log(result.length);
            connection.end();
    } 
    else {
            console.log('Error executing query.');
            console.log(err);
            connection.end();
    }
    });
console.log('*****************************')
console.log(result.length);

