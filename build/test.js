'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiString = require('chai-string');

var _chaiString2 = _interopRequireDefault(_chaiString);

var _markdownIt = require('@gerhobbelt/markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _markdownItAttrs = require('@gerhobbelt/markdown-it-attrs');

var _markdownItAttrs2 = _interopRequireDefault(_markdownItAttrs);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-env mocha */

_chai2.default.use(_chaiString2.default);

var read = function read(path) {
	return _fs2.default.readFileSync('testdata/' + path).toString();
};

describe('markdown-it-kbd', function () {

	var md = (0, _markdownIt2.default)().use(_index2.default);

	it('renders [[x]] as <kbd>x</kbd>', function () {
		(0, _chai.expect)(md.render(read('input/kbd.md'))).to.equalIgnoreSpaces(read('expected/kbd.html'));
	});

	it('does not harm link rendering', function () {
		(0, _chai.expect)(md.render(read('input/kbdwithlink.md'))).to.equalIgnoreSpaces(read('expected/kbdwithlink.html'));
	});

	it('ignores [[ and ]] if not forming a keystroke.', function () {
		(0, _chai.expect)(md.render(read('input/dangling.md'))).to.equalIgnoreSpaces(read('expected/dangling.html'));
	});

	it('allows markup within [[ and ]]', function () {
		(0, _chai.expect)(md.render(read('input/markupwithin.md'))).to.equalIgnoreSpaces(read('expected/markupwithin.html'));
	});

	it('can be used together with markdown-it-attrs', function () {
		var mdwithattrs = (0, _markdownIt2.default)().use(_index2.default).use(_markdownItAttrs2.default);
		(0, _chai.expect)(mdwithattrs.render(read('input/withattrs.md'))).to.equalIgnoreSpaces(read('expected/withattrs.html'));
	});
});