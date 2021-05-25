function avg(x, size) {
    var sum = 0;
    var i = 0;
    for (i = 0; i < size; i++) {
        sum += x[i];
    }
    return sum;
}

function variability(x, avg) {
    var av = avg(x, size);
    var sum = 0;
    var i = 0;
    for (i = 0; i < size; i++) {
        sum += x[i] * x[i];
    }
    return sum / size - av * av;
}

function cov(x, y, size) {
    var sum = 0;
    var i = 0;
    for (i = 0; i < size; i++) {
        sum += x[i] * y[i];
    }
    sum /= size;
    return sum - avg(x, size) * avg(y, size);
}

function pearson(x, y, size) {
    return cov(x, y, size) / (Math.sqrt(variability(x, size)) * Math.sqrt(variability(y, size)));
}

function linear_reg(points, size) {
    var x = []
    var y = []
    var i;
    for (i = 0; i < size; i++) {
        x.push(points[i].x);
        y.push(points[i].y);
    }
    var a = cov(x, y, size) / variability(x, size);
    var b = avg(y, size) - a * (avg(x, size));
    return new Array(a, b);
}

function dev(p, points, size) {
    var l = linear_reg(points, size);
    return devSec(p, l);
}

function devSec(p, l) {
    return Math.abs(p.y - (l[0] * p.x + l[1]));
}