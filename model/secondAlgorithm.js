var threshold = 0.9;
var cf = [];
var v = [];

function toPoints(x, y) {
    var ps = []
    var i = 0;
    for (i = 0; i < x.length; i++) {
        ps.push([x[i], y[i]]);
    }
    return ps;
}

function findThreshold(ps, len, rl) {
    var max = 0;
    var i = 0;
    for (i = 0; i < len; i++) {
        var d = abs(ps[i][1] - (rl[0] * ps[i][0] - rl[1]));
        if (d > max) {
            max = d;
        }
    }
    return max;
}

function learnNormal(ts) {
    var atts = ts.gettAttributes();
    var len = ts.getRowSize();
    var vals = [];
    var i = 0;
    var j = 0;
    for (i = 0; i < atts.size(); i++) {
        vals.push([]);
        for (j = 0; j < ts.getRowSize(); j++) {
            // vals[i].push(ts.getAttributeData(atts[i])[j];
            vals[i].push(ts.getAttributeData(atts[i], [j]));
        }
    }
    for (i = 0; i < atts.size(); i++) {
        var f1 = atts[i];
        var max = 0;
        var jmax = 0;
        for (j = i + 1; j < atts.size(); j++) {
            var p = abs(pearson(vals[i], vals[j], len));
            if (p > max) {
                max = p;
                jmax = j;
            }
        }
        var f2 = atts[jmax];
        var ps = toPoints(ts.getAttributeData(f1), ts.getAttributeData(f2));
        learnHelper(ts, max, f1, f2, ps);
    }
}

function learnHelper(ts, p, f1, f2, ps) {
    if (p > threshold) {
        var len = ts.getRowSize();
        var c = 0;
        c.feature1 = f1;
        c.feature2 = f2;
        c.corrlation = p;
        c.lin_reg = linear_reg(ps, len);
        c.threshold = findThreshold(ps, len, c.lin_reg) * 1.1;
        cf.push(c);
    }
}

function detect(ts) {
    forEach(forEachFunction);
    return v;
}

function forEachFunction(item, index) {
    var i = 0;
    var x = ts.getAttributeData(item.feature1);
    var y = ts.getAttributeData(item.feature2);
    for (i = 0; i < x.length; i++) {
        if (isAnomalous(x[i], y[i], item)) {
            var d = c.feature1 + "-" + c.feature2;
            v.push(AnomalyReport(d, (i + 1)));
        }
    }
}

function isAnomalous(x, y, c) {
    return (abs(y - c.lin_reg.f(x)) > c.threshold);
}

module.exports.annomaly = detect;