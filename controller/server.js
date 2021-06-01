var errorMessage = "<table border='1' width='100%'><tr><td>"
errorMessage += "<h3>An error occurred :( </h3>";
errorMessage += "you may <ul><li>check your file format</li>";
errorMessage += "<li>refresh this page</li>";
errorMessage += "<li>ask for help</li></ul>";
errorMessage += "</td></tr></table>";

var noAnomaly = "<table border='1' width='100%'><tr><td>";
noAnomaly += "<h1>no anomly found :)</h1>"
noAnomaly += "</td></tr></table>";

// imports modules
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const model = require('../model/algo');

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
        try {
            /* this is the file without anomalies. */
            let file1 = req.files.file1.data.toString();
            /* this is the file we should check. */
            let file2 = req.files.file2.data.toString();

            var algo = req.body.Algorithm; //this is the name of the choosen algorithm

            var series1 = new model.TimeSeries(file1);
            var series2 = new model.TimeSeries(file2);
            var detector = new model.SimpleAnomalyDetector();
            var anomaly;

            if (algo == "hybrid") { //hybrid
                detector.learnNormal(series1, true);
                anomaly = detector.detect(series2);
            } else { // regression 
                detector.learnNormal(series1, false);
                anomaly = detector.detect(series2);
            }

            if (anomaly.length == 0) {
                res.write(noAnomaly);
            } else {
                res.write(buildTable(anomaly));
            }
        } catch (err) {
            console.log(err.toString());
            res.write(errorMessage);
        }
    }
});

app.post('/', (req, res) => {
    console.log("connection to server at " + Date());
    console.log(req.body);

    res.write(buildJson(anomaly));
});

app.listen(8080, () => console.log("server started at 8080"));

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
    var str = '{\n "anomalies": [';
    anomaly.forEach(element => {
        str += '\n  {\n   "Property": "' + element[0].toString() + '",\n';
        str += '   "Value": "' + element[1].toString() + '"\n  },';
    });
    str = str.substring(0, str.length - 1);
    str += '\n ]\n}';
    return str;
}