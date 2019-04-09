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
const fs = require('fs');
var sql="USE umls;SELECT * FROM MRCONSO limit 1;";
var result = [];
var sql1 = 'use umls; select details.* from MRCONSO as details INNER JOIN (select CUI2 from MRREL where CUI1 in (\'C3714496\') and STYPE1 = \'CUI\') as rel on details.CUI = rel.CUI2 limit 100;'

connection.query(sql1, function(err, results){
    if (!err) {
        // console.log(results);
        console.log('\n');
        console.log(results[1].length);
        for (var i = 0; i < results[1].length; i++) {
            var string = JSON.stringify(results[1][0]);
            console.log(i);
            // console.log(string);
            console.log('\n');
            var json = JSON.parse(string);
            console.log(json);
            console.log('\n');
        }
        
        connection.end();
    }

    else {
        console.log('Error executing query.');
        console.log(err);
        connection.end();
    }

});


// connection.query(sql, function(err, rows, fields) {
//     if (!err) {
//         // console.log('Returned Data:\n ', rows[1]);
//         console.log(JSON.parse(JSON.stringify(rows[1].CUI)));
//         // console.log(fields);
        

//         // for (var i = 0; i < rows.length; i++) {
//         //     var row = rows[i]
//         //     console.log('\n', i);
//         //     console.log('this', row[0]);
//         // }

//         // fs.writeFile('/home/shubadra/gitRepos/visualizing-umls-knowledge-source/data/sqlOutput.txt', rows);
//         console.log('Query Executed Successfully.');
//         result = rows;
//         // console.log(result.length);
//         connection.end();
//     } 
//     else {
//             console.log('Error executing query.');
//             console.log(err);
//             connection.end();
//     }
//     });
// console.log('*****************************')
// console.log(result.length);

