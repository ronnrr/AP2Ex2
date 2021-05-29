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
		var f1 = atts[i];
		var max = 0;
		var jmax = 0;
		for (j = i + 1; j < atts.length(); j++) {
			var p = Math.abs(pearson(vals[i], vals[j], len));
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
	
	learnHelper(ts, p, f1, f2, ps) {
		if (p > this.threshold) {
			var len = ts.getRowSize();
			var c = new correlatedFeatures(f1, f2, p, linear_reg(ps, len), findThreshold(ps, len, linear_reg(ps, len)) * 1.1, new Point(0, 0));
			this.cf.push(c);
		}
	}
	
	detect(ts) {
		var v = [];
		for (const val in this.cf) {
			var x = ts.getAttributeData(val.feature1);
			var y = ts.getAttributeData(val.feature2);
			var i = 0;
			for (i = 0; i < x.length; i++) {
				if (isAnomalous(x[i], y[i], val)) {
					var d = val.feature1 + "-" + val.feature2;
					v.push([d, i+1]);
				}
			}
		}
		return v;
	}
}

class TimeSeries {
	constructor(CSVfileName) {
		const fs = require('fs');
		this.atts = [];
		this.ts = {};
		try {
			const data = fs.readFileSync(CSVfileName, 'utf8');
			var temp = data.split("\n");
			var secondaryTemp = temp[0].split(",");
			secondaryTemp[secondaryTemp.length-1] = secondaryTemp[secondaryTemp.length-1].substr(0, secondaryTemp[secondaryTemp.length-1].length - 1);
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
				secTemp[secTemp.length-1] = secTemp[secTemp.length-1].substr(0, secTemp[secTemp.length-1].length - 1);
				for (j = 0; j < this.atts.length; j++) {
					(this.ts[this.atts[j]]).push(secTemp[j]);
				}
			}
			console.log(this.ts);
		}
		catch (err) {
			console.error(err);
			return;
		}
		this.dataRowSize = temp.length;
	}
	
	getAttributeData(attribute) {
		return ts[attribute];
	}
	
	getAttributes() {
		return atts;
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
	var i = 0;
	var sum = 0;
	for (i = 0; i < size; i++) {
		sum += x[i];
	}
	return sum / size;
}

function variability(x, size) {
	var i = 0;
	var av = avg(x, size);
	var sum = 0;
	for (i = 0; i < size; i++) {
		sum += x[i] * x[i];
	}
	return sum / size - av*av;
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
	var x = [];
	var y = [];
	var i = 0;
	for (i = 0; i < size; i++) {
		x.push(points[i].x);
		y.push(points[i].y);
	}
	var a = cov(x, y, size) / variability(x, size);
	var b = avg(y, size) - a * (avg(x, size));
	return Line(a, b)
}

function dev(p, points, size) {
	var line = linear_reg(points, size);
	return dev(p, l);
}

function secondDev(p, l) {
	return Math.abs(p.y - l.f(p.x));
}