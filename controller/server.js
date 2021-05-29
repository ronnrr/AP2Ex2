// imports modules
const express = require('express');
const fileUpload = require('express-fileupload');

const app = express();
// const model = require('../model/secondAlgorithm');
const model = require('../model/temptemptemp');

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

// this function should handle post request coming from thr form.
app.post('/check', (req, res) => {
    console.log("connection to server at " + Date());
    if (req.files) {
        console.log(req.files);

        let file1 = req.files.file1.data.toString();
        let file2 = req.files.file2.data.toString();

        var series1 = new model.TimeSeries(file1);
        var series2 = new model.TimeSeries(file2);
        var detector = new model.SimpleAnomalyDetector();

        detector.learnNormal(series1.getAttributes());
        var annomaly = detector.detect(series2.getAttributes());

        res.write(annomaly);
        /* this is the file without anomalies. */
        /* this is the file we should check. */


    }
});


app.post('/', (req, res) => {
    // here we should check and return json
});


app.listen(8080, () => console.log("server started at 8080"))