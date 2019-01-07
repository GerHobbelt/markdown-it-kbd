/* eslint-env mocha */

import chai, {expect} from 'chai';
import chaiString from 'chai-string';
import markdownit from '@gerhobbelt/markdown-it';
import markdownItAttrs from '@gerhobbelt/markdown-it-attrs';
import markdownItKbd from './index';
import fs from 'fs';

chai.use(chaiString);

const read = path => fs.readFileSync(`testdata/${path}`).toString();

describe('markdown-it-kbd', () => {

	const md = markdownit()
		.use(markdownItKbd);

	it('renders [[x]] as <kbd>x</kbd>', () => {
		expect(md.render(read('input/kbd.md')))
			.to.equalIgnoreSpaces(read('expected/kbd.html'));
	});

	it('does not harm link rendering', () => {
		expect(md.render(read('input/kbdwithlink.md')))
			.to.equalIgnoreSpaces(read('expected/kbdwithlink.html'));
	});

	it('ignores [[ and ]] if not forming a keystroke.', () => {
		expect(md.render(read('input/dangling.md')))
			.to.equalIgnoreSpaces(read('expected/dangling.html'));
	});

	it('allows markup within [[ and ]]', () => {
		expect(md.render(read('input/markupwithin.md')))
			.to.equalIgnoreSpaces(read('expected/markupwithin.html'));
	});

	it('can be used together with markdown-it-attrs', () => {
		const mdwithattrs = markdownit()
			.use(markdownItKbd)
			.use(markdownItAttrs);
		expect(mdwithattrs.render(read('input/withattrs.md')))
            .to.equalIgnoreSpaces(read('expected/withattrs.html'));
	});
});
