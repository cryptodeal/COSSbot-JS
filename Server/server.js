const express = require('express')
var myParser = require('body-parser')
const app = express()

app.get('/', (req, res) => res.send('COSSbot Localhost Server'))
app.use(myParser.urlencoded({extended : true}));

app.use(myParser.json());

app.post("/data1", function(request, response) {
    console.log(('data1- ') + (request.body.name) + (': ') + (request.body.value));
    //TODO set var data1 in parent process = (request.body.value) 
    });

app.post("/data2", function(request, response) {
    console.log(('data2- ') + (request.body.name) + (': ') + (request.body.value));
    //TODO set var data2 in parent process = (request.body.value) 
    });

app.post("/data3", function(request, response) {
    console.log(('data3- ') + (request.body.name) + (': ') + (request.body.value));
    });

app.listen(4000, () => console.log('COSSbot Server running on port 4000!'))

