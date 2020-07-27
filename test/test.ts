
/* eslint-env mocha, es6 */

import chai from 'chai';
const expect = chai.expect;
import chaiString from 'chai-string';
import markdownit from '@gerhobbelt/markdown-it';
// @ts-ignore markdown-it-attrs has no types and it’s not worth the effort adding a *.d.ts fileu
import markdownItAttrs from '@gerhobbelt/markdown-it-attrs';
import markdownItWikiLinks from '@gerhobbelt/markdown-it-wikilinks';
import markdownItKbd from '../src';
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

  it('can use alternative markers [=x=] to prevent collision with wikilinks plugin', () => {
    const md = markdownit()
    .use(markdownItWikiLinks, {
      baseURL: '/wiki/'
    })
    .use(markdownItKbd, {
      MARKER_OPEN: '[=',
      MARKER_CLOSE: '=]'
    });

    expect(md.render(read('input/kbd_alt.md')))
      .to.equalIgnoreSpaces(read('expected/kbd_alt.html'));
  });
});
