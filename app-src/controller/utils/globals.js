import { LogBox } from 'react-native';
import SDate from '../types/auxilliary/SDate'

LogBox.ignoreLogs([
	'Warning: componentWillReceiveProps has been renamed',
	'fontFamily "Roboto" is not a system font and has not been loaded through Font.loadAsync.',
]);

Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0]);
	return this;
};

window.allSettled = function (promises) {
	let wrappedPromises = promises.map((p) =>
		Promise.resolve(p).then(
			(val) => ({ status: 'fulfilled', value: val }),
			(err) => ({ status: 'rejected', reason: err })
		)
	);
	return Promise.all(wrappedPromises);
};

window.ucfirst = function (s) {
	return s.length ? s[0].toUpperCase() + s.slice(1) : '';
}

const priceString = (price) => parseFloat(price).toLocaleString('de-DE', {
	style: 'currency',
	currency: 'DZD',
	maximumFractionDigits: 2
}).replace(',00','').replace('DZD','DA')

const instanceToResource = (obj) => {
	if (null == obj || "object" != typeof obj) return obj;
	if (obj instanceof SDate) {
		return obj + "";
	}
	if (obj instanceof Array) {
		var copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = instanceToResource(obj[i]);
		}
		return copy;
	}
	if (obj instanceof Object) {
		var copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = instanceToResource(obj[attr]);
		}
		return copy;
	}
}

export { priceString, instanceToResource }
window.priceString = priceString
window.instanceToResource = instanceToResource

window.compareVersions = function (v1, comparator, v2) {
	'use strict';
	var comparator = comparator == '=' ? '==' : comparator;
	if (['==', '===', '<', '<=', '>', '>=', '!=', '!=='].indexOf(comparator) == -1) {
		throw new Error('Invalid comparator. ' + comparator);
	}
	var v1parts = v1.split('.'),
		v2parts = v2.split('.');
	var maxLen = Math.max(v1parts.length, v2parts.length);
	var part1, part2;
	var cmp = 0;
	for (var i = 0; i < maxLen && !cmp; i++) {
		part1 = parseInt(v1parts[i], 10) || 0;
		part2 = parseInt(v2parts[i], 10) || 0;
		if (part1 < part2) cmp = 1;
		if (part1 > part2) cmp = -1;
	}
	return eval('0' + comparator + cmp);
};

window.arrayShuffle = function (array) {
	var currentIndex = array.length,
		randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
};

window.isNumeric = function (str) {
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

window.romanize = function (num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}
