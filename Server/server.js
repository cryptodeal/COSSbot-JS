const express = require('express')
var myParser = require('body-parser')
const app = express()

var data1;
var data2;
var data3;

app.get('/', (req, res) => res.send('COSSbot Localhost Server'))
app.use(myParser.urlencoded({extended : true}));

app.use(myParser.json());

app.post("/data1", function(request, response) {
    data1 = (request.body.value);
    //TODO set var data1 in parent process (main.js) = (request.body.value) 

    console.log(data1);
    });

app.post("/data2", function(request, response) {
    data2 = (request.body.value);
    //TODO set var data2 in parent process (main.js) = (request.body.value)
   
    console.log(data2);
    
    });

app.post("/data3", function(request, response) {
    data3 = (request.body.value);
    //TODO set var data3 in parent process (main.js) = (request.body.value) 
    
    console.log(data3);
    });

app.listen(4000, () => console.log('COSSbot Server running on port 4000!'))

