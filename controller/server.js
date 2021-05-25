// imports modules
const express = require('express');
const fileUpload = require('express-fileupload');
// const model = require('../Model/SearchInFile')
const app = express();
const model = require('../model/secondAlgorithm');

// define app uses
app.use(express.urlencoded({
    extended: false
}));
app.use(fileUpload({}));
app.use(express.static('../View'));

app.get('/', (req, res) => {
    console.log("connection to server at " + Date());
    res.sendFile('./index.html');
});


app.post('/check', (req, res) => {
    console.log("connection to server at " + Date());
    if (req.files) {
        console.log(req.files);

        /* this is the file without anomalies. */
        let file1 = req.files.file1.data.toString();
        res.write(model.annomaly(file1));
        /* this is the file we should check. */
        let file2 = req.files.file2.data.toString();


        // res.write(file1);
        // res.write(file2);
    }
    // res.send(req.body);
});


app.post('/', (req, res) => {
    // here we should check and return json
});


app.listen(8080, () => console.log("server started at 8080"))
    // var http = require('http');

// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.sendFile('index.html', {root: __dirname })
// //   res.write("The date and time are currently: " + Date());
// //   res.end('Hello World!');
// }).listen(8080);
/*
var express = require('express');
var app = express();
app.post('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname });
    console.log("---- " +     req.body);
    // res.sendFile('./index.html');
});
app.post('/check', function(req, res) {
    res.write("!!!");
    // res.sendFile('index.html', { root: __dirname });
    // console.log("---- " +     req.body);
    // res.sendFile('./index.html');
});
app.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname });
    console.log("had a request and response !\n" + Date());
    // res.sendFile('./index.html');
});
app.get('/front.js', function(req, res) {
    res.sendFile('front.js', { root: __dirname });

    // res.sendFile('./index.html');
});

app.get('/style.css', function(req, res) {
    res.sendFile('style.css', { root: __dirname });

    // res.sendFile('./index.html');
});
app.listen(8080);
*/