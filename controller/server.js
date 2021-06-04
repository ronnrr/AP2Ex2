// this is the message to the user for error.
var errorMessage = "<table border='1' width='100%'><tr><td>"
errorMessage += "<h3>An error occurred :( </h3>";
errorMessage += "you may <ul><li>check your file format</li>";
errorMessage += "<li>refresh this page</li>";
errorMessage += "<li>ask for help</li></ul>";
errorMessage += "</td></tr></table>";

// this is the message to the user for no anomalies.
var noAnomaly = "<table border='1' width='100%'><tr><td>";
noAnomaly += "<h1>no anomly found :)</h1>"
noAnomaly += "</td></tr></table>";

// imports modules
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
// const model = require('../model/algo');
const model = require('../model/detector');

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
        var isHybrid = false;
        if (req.body.Algorithm == "hybrid")
            isHybrid = true;

        /* this is the file without anomalies. */
        let file1 = req.files.file1.data.toString();
        /* this is the file we should check. */
        let file2 = req.files.file2.data.toString();
        var anomaly = detect(file1, file2, isHybrid);

        if (anomaly == 0) {
            res.write(noAnomaly);
        } else if (anomaly == -1) {
            res.write(errorMessage);
        } else {
            // res.write(buildTable(anomaly));
            res.write(buildTable(anomaly));
        }
    }
});

app.post('/', (req, res) => {
    console.log("connection to server at " + Date());
    if (req.files) {
        var isHybrid = false;
        if (req.body.Algorithm == "hybrid")
            isHybrid = true;

        /* this is the file without anomalies. */
        let file1 = req.files.file1.data.toString();
        /* this is the file we should check. */
        let file2 = req.files.file2.data.toString();
        var anomaly = detect(file1, file2, isHybrid);

        if (anomaly == 0) {
            res.write(noAnomaly);
        } else if (anomaly == -1) {
            res.write("An error occurred while looking for anomalies.");
        } else {
            res.json(buildJson(anomaly));
        }
    }
});

app.listen(8080, () => console.log("server started at 8080"));

function detect(file1, file2, isHybrid) {
    try {
        var series1 = new model.TimeSeries(file1);
        var series2 = new model.TimeSeries(file2);
        var detector = new model.SimpleAnomalyDetector();
        var anomaly;
        detector.learnNormal(series1, isHybrid);
        anomaly = detector.detect(series2);

        if (anomaly.length == 0)
            return 0;

        return anomaly;
    } catch (err) {
        console.log(err.toString());
        return -1;
    }
}
// this function get an array and return html table
function buildTable(anomaly) {
    var str = "<table border='1' width='100%'>";
    str += "<th width='50%'>Property:</th>";
    str += "<th width='50%'>Value:</th>";
    anomaly.forEach(element => {
        str += "<tr>"
        str += "<td>" + element[0].toString() + "</td>";
        str += "<td>" + element[1].toString() + "</td>";
        str += "</tr>"
    });
    str += "</table>"
    return str;
}

// this function get an array and return json string
function buildJson(anomaly) {
    var anomalies = { "anomalies": {} };
    anomaly.forEach(element => {
        anomalies.anomalies[element[0].toString()] = element[1].toString();
    });
    return anomalies;
}