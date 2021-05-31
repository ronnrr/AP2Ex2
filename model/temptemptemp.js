class correlatedFeatures {
    constructor(feature1, feature2, corrlation, lin_reg, threshold, center) {
        this.feature1 = feature1;
        this.feature2 = feature2;
        this.corrlation = corrlation;
        this.lin_reg = lin_reg;
        this.threshold = threshold;
        this.center = center;
    }
}

class SimpleAnomalyDetector {
    constructor() {
        this.threshold = 0.9;
        this.cf = [];
    }

    toPoints(x, y) {
        var arr = [];
        var i = 0;
        for (i = 0; i < x.length; i++) {
            arr.push(new Point(x[i], y[i]));
        }
        return arr;
    }

    findThreshold(ps, len, rl) {
        var max = 0;
        var i = 0;
        for (i = 0; i < len; i++) {
            var d = Math.abs(ps[i].y - rl.f(ps[i].x));
            if (d > max) {
                max = d;
            }
        }
        return max;
    }

    learnNormal(ts) {
        var atts = ts.getAttributes();
        var len = ts.getRowSize();
        var vals = [];
        var i = 0;
        var j = 0;
        for (i = 0; i < atts.length; i++) {
            vals.push(ts.getAttributeData(atts[i]));
        }
        for (i = 0; i < atts.length; i++) {
            for (j = 0; j < len; j++) {
                vals[i][j] = Number(vals[i][j]);
            }
        }
        for (i = 0; i < atts.length; i++) {
            vals[i] = vals[i].slice(1, vals[i].length);
        }
        for (i = 0; i < atts.length; i++) {
            var f1 = atts[i];
            var max = 0;
            var jmax = 0;
            for (j = i + 1; j < atts.length; j++) {
                var p = Math.abs(pearson(vals[i], vals[j], len));
                if (p > max) {
                    max = p;
                    jmax = j;
                }
            }
            var f2 = atts[jmax];
            var ps = this.toPoints(ts.getAttributeData(f1), ts.getAttributeData(f2));

            this.learnHelper(ts, max, f1, f2, ps);
        }
    }

    learnHelper(ts, p, f1, f2, ps) {
        if (p > this.threshold) {
            var len = ts.getRowSize();
            var c = new correlatedFeatures(f1, f2, p, linear_reg(ps, len), this.findThreshold(ps, len, linear_reg(ps, len)) * 1.1, new Point(0, 0));
            this.cf.push(c);
        }
    }

    detect(ts) {
        var v = [];
        var i = 0;
        for (i = 0; i < this.cf.length; i++) {
            var x = ts.getAttributeData(this.cf[i].feature1);
            var y = ts.getAttributeData(this.cf[i].feature2);
            var j = 0;
            for (j = 0; j < x.length; j++) {
                if (this.isAnomalous(x[j], y[j], this.cf[i])) {
                    var d = this.cf[i].feature1 + "-" + this.cf[i].feature2;
                    v.push([d, i + 1]);
                    // console.log("new anomaly: " + d.toString() + ", " + (i + 1));
                    // v.push(x[j], y[j]);
                }
            }
        }
        return v;
    }

    isAnomalous(x, y, c) {
        return (Math.abs(y - c.lin_reg.f(x)) > c.threshold);
    }
}

class TimeSeries {
    constructor(string) {
        const fs = require('fs');
        this.atts = [];
        this.ts = {};
        try {
            const data = string;
            var temp = data.split("\n");
            var secondaryTemp = temp[0].split(",");
            secondaryTemp[secondaryTemp.length - 1] = secondaryTemp[secondaryTemp.length - 1].substr(0, secondaryTemp[secondaryTemp.length - 1].length - 1);
            this.atts = [];
            var i = 0;
            for (i = 0; i < secondaryTemp.length; i++) {
                this.atts.push(String(secondaryTemp[i]));
                this.ts[String(secondaryTemp[i])] = [];
            }
            var j = 0;
            var secTemp;
            for (i = 0; i < temp.length; i++) {
                secTemp = temp[i];
                secTemp = secTemp.split(",");
                secTemp[secTemp.length - 1] = secTemp[secTemp.length - 1].substr(0, secTemp[secTemp.length - 1].length - 1);
                for (j = 0; j < this.atts.length; j++) {
                    (this.ts[this.atts[j]]).push(secTemp[j]);
                }
            }
        } catch (err) {
            console.error(err);
            return;
        }
        this.dataRowSize = temp.length;
    }

    getAttributeData(attribute) {
        return this.ts[attribute];
    }

    getAttributes() {
        return this.atts;
    }

    getRowSize() {
        return this.dataRowSize;
    }
}
class Line {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    f(x) {
        return this.a * x + this.b
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function avg(x, size) {
    var sum = 0;
    var i = 0;
    for (i = 0; i < size; i++) {
        if (isNaN(x[i]) == false) {
            sum = Number(sum + parseFloat(x[i]));
        }
    }
    return sum / size;
}

function variability(x, size) {
    var i = 0;
    var av = avg(x, size);
    var sum = 0;
    for (i = 0; i < size; i++) {
        if (isNaN(x[i]) == false) {
            sum += parseFloat(x[i]) * parseFloat(x[i]);
        }
    }
    return sum / size - av * av;
}

function cov(x, y, size) {
    var sum = 0;
    var i = 0;
    sum = Number(sum);
    for (i = 0; i < size; i++) {
        if (isNaN(x[i]) == false && isNaN(y[i]) == false) {
            sum += (parseFloat(x[i]) * parseFloat(y[i]));
        }
    }
    sum /= size;
    return sum - avg(x, size) * avg(y, size);
}

function pearson(x, y, size) {
    return cov(x, y, size) / (Math.sqrt(variability(x, size)) * Math.sqrt(variability(y, size)));
}

function linear_reg(points, size) {
    var x = [];
    var y = [];
    var i = 0;
    for (i = 0; i < size; i++) {
        x.push(points[i].x);
        y.push(points[i].y);
    }
    var a = cov(x, y, size) / variability(x, size);
    var b = avg(y, size) - a * (avg(x, size));
    return new Line(a, b)
}

function dev(p, points, size) {
    var line = linear_reg(points, size);
    return dev(p, l);
}

function secondDev(p, l) {
    return Math.abs(p.y - l.f(p.x));
}

module.exports.TimeSeries = TimeSeries;
module.exports.SimpleAnomalyDetector = SimpleAnomalyDetector;