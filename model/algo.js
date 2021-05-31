class correlatedFeatures {
    constructor(feature1, feature2, corrlation, lin_reg, threshold, center, radius) {
        this.feature1 = feature1;
        this.feature2 = feature2;
        this.corrlation = corrlation;
        this.lin_reg = lin_reg;
        this.threshold = threshold;
        this.center = center;
        this.radius = radius
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

    learnNormal(ts, isHybrid) {
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
            var f1 = atts[i];
            var max = 0;
            var jmax = 0;
            for (j = i + 1; j < atts.length; j++) {
                var p = Math.abs(pearson(vals[i], vals[j], vals[i].length));
                if (p > max) {
                    max = p;
                    jmax = j;
                }
            }
            var f2 = atts[jmax];
            var ps = this.toPoints(ts.getAttributeData(f1), ts.getAttributeData(f2));
            this.learnHelper(ts, max, f1, f2, ps, isHybrid);
        }
    }

    learnHelper(ts, p, f1, f2, ps, isHybrid) {
        if (p > this.threshold) {
            var len = ts.getRowSize();
            var c = new correlatedFeatures(f1, f2, p, linear_reg(ps, len), this.findThreshold(ps, len, linear_reg(ps, len)) * 1.1, new Point(0, 0), 0);
            this.cf.push(c);
        } else if (isHybrid && p > 0.5) {
            ps = ps.slice(1, ps.length);
            var circle = findMinCircle(ps, ts.getRowSize());
            var c = new correlatedFeatures(f1, f2, p, null, null, circle.center, circle.radius * 1.1);
            this.cf.push(c);
        }

    }

    detect(ts) {
        console.log(this.cf);
        var v = [];
        var i = 0;
        for (i = 0; i < this.cf.length; i++) {
            var x = ts.getAttributeData(this.cf[i].feature1);
            var y = ts.getAttributeData(this.cf[i].feature2);
            var j = 0;
            for (j = 0; j < ts.getRowSize(); j++) {
                if (this.cf[i].radius == 0 && this.isAnomalous(x[j], y[j], this.cf[i])) {
                    var d = this.cf[i].feature1 + "-" + this.cf[i].feature2;
                    v.push([d, j + 1]);
                } else if (this.cf[i].radius != 0) {
                    var point = new Point(x[j], y[j]);
                    if (dist(point, this.cf[i].center) > this.cf[i].radius) {
                        var d = this.cf[i].feature1 + "-" + this.cf[i].feature2;
                        v.push([d, j + 1]);
                    }
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
    constructor(data) {
        const fs = require('fs');
        this.atts = [];
        this.ts = {};
        try {
            //const data = fs.readFileSync(CSVfileName, 'utf8');
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
        this.a = parseFloat(a);
        this.b = parseFloat(b);
    }

    f(x) {
        return this.a * parseFloat(x) + this.b
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

function variability(x, size, type) {
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
    points = points.slice(0, size);
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
    return secondDev(p, line);
}

function secondDev(p, l) {
    return Math.abs(p.y - l.f(p.x));
}

class Circle {
    constructor(c, r) {
        this.center = c;
        this.radius = r;
    }
}

function dist(a, b) {
    var x2 = (a.x - b.x) * (a.x - b.x);
    var y2 = (a.y - b.y) * (a.y - b.y);
    return Math.sqrt(x2 + y2);
}

function from2Points(a, b) {
    var x = (a.x + b.x) / 2;
    var y = (a.y + b.y) / 2;
    var r = dist(a, b) / 2;
    return new Circle(new Point(x, y), r);
}

function from3Points(a, b, c) {
    var mAB = new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
    var slopAB = (b.y - a.y) / (b.x - a.x);
    var pSlopAB = -1 / slopAB;
    var mBC = new Point((b.x + c.x) / 2, (b.y + c.y) / 2);
    var slopBC = (c.y - b.y) / (c.x - b.x);
    var pSlopBC = -1 / slopBC;
    var x = (-pSlopBC * mBC.x + mBC.y + pSlopAB * mAB.x - mAB.y) / (pSlopAB - pSlopBC);
    var y = pSlopAB * (x - mAB.x) + mAB.y;
    var center = new Point(x, y);
    var R = dist(center, a);
    return new Circle(center, R);
}

function trivial(p) {
    if (p.length == 0) {
        return new Circle(new Point(0, 0), 0);
    } else if (p.length == 1) {
        return new Circle(p[0], 0);
    } else if (p.length == 2) {
        return from2Points(p[0], p[1]);
    }
    var c = from2Points(p[0], p[1]);
    if (dist(p[2], c.center) <= c.radius) {
        return c;
    }
    c = from2Points(p[0], p[2]);
    if (dist(p[1], c.center) <= c.radius) {
        return c;
    }
    c = from2Points(p[1], p[2]);
    if (dist(p[0], c.center) <= c.radius) {
        return c;
    }
    return from3Points(p[0], p[1], p[2]);
}

function welzl(p, r, n) {
    console.log(p.slice(0, n));
    for (i = 0; i < n; i++) {
        if (p[i] == undefined) {
            p.splice(i, 1);
        }
    }
    if (n == 0 || r.length == 3) {
        if (n == 0) {}
        return trivial(r);
    }
    var i = 0;
    var j = 0;
    i = parseInt(Math.random() * n);
    var ps = new Point(p[i].x, p[i].y);
    p[i] = p[n - 1];
    p[n - 1] = ps;
    if (n == 0) {
        console.log("asdasd");
    }
    var c = welzl(p, r, n - 1);
    if (n == 0) {
        console.log("BBBBBBBBBBBBBB");
    }
    if (dist(ps, c.center) <= c.radius) {
        return c;
    }
    r.push(ps);
    return welzl(p, r, n - 1);
}

function findMinCircle(points, size) {
    return welzl(points, [], size);
}

module.exports.TimeSeries = TimeSeries;
module.exports.SimpleAnomalyDetector = SimpleAnomalyDetector;