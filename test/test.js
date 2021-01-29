
/* eslint-env mocha, es6 */

import path from 'path';
import fs from 'fs';
import assert from 'assert';
// @ts-ignore markdown-it-attrs has no types and it’s not worth the effort adding a *.d.ts file
import markdownit from '@gerhobbelt/markdown-it';
// @ts-ignore markdown-it-attrs has no types and it’s not worth the effort adding a *.d.ts file
import markdownItAttrs from '@gerhobbelt/markdown-it-attrs';
// @ts-ignore markdown-it-wikilinks has no types and it’s not worth the effort adding a *.d.ts file
import markdownItWikiLinks from '@gerhobbelt/markdown-it-wikilinks';
import markdownItKbd from '../dist/markdownitKbd.js';


const read = (path) => fs.readFileSync(`testdata/${path}`).toString();

const trimmed = (text) => text.replace(/\n\s*/g, '\n').replace(/^\n/, '');

describe('markdown-it-kbd', () => {

  const md = markdownit().use(markdownItKbd);

  it('renders [[x]] as <kbd>x</kbd>', () => {
    assert.strictEqual(md.render(trimmed(`
      # Test

      This combination is cool: [[alt]]+[[f4]].
    `)), trimmed(`
      <h1>Test</h1>
      <p>This combination is cool: <kbd>alt</kbd>+<kbd>f4</kbd>.</p>
    `));
  });

  it('supports nested keystroke tags', () => {
    assert.strictEqual(md.render(trimmed(`
      [[[[Shift]]+[[F3]]]]
    `)), trimmed(`
      <p><kbd><kbd>Shift</kbd>+<kbd>F3</kbd></kbd></p>
    `));
  });

  [
    [ '[[\\[]]', '<kbd>[</kbd>' ],
    [ '[[\\]]]', '<kbd>]</kbd>' ],
    [ '[[\\[\\[]]', '<kbd>[[</kbd>' ],
    [ '[[\\]\\]]]', '<kbd>]]</kbd>' ]
  ].forEach((spec) => {
    it(`supports escaped delimiters: ${spec[0]}`, () => {
      const input = spec[0];
      const expected = spec[1];
      assert.strictEqual(md.render(input), `<p>${expected}</p>\n`);
    });
  });

  it('supports deep nesting and markup in nested tags', () => {
    assert.strictEqual(md.render(trimmed(`
      [[[[[[Shift]]\`+\`[[_long[[x]]_]]]]-Ctrl]]+[[F4]]
    `)), trimmed(`
      <p><kbd><kbd><kbd>Shift</kbd><code>+</code><kbd><em>long<kbd>x</kbd></em></kbd></kbd>-Ctrl</kbd>+<kbd>F4</kbd></p>
    `));
  });

  it('does not harm link rendering', () => {
    assert.strictEqual(md.render(trimmed(`
      # Test

      This combination is cool: [[alt]]+[[f4]]. This link still works: [Google](http://google.com).
    `)), trimmed(`
      <h1>Test</h1>
      <p>This combination is cool: <kbd>alt</kbd>+<kbd>f4</kbd>. This link still works: <a href="http://google.com">Google</a>.</p>
    `));
  });

  it('can be included in links', () => {
    assert.strictEqual(md.render(trimmed(`
      [[[[[Ctrl]]+[[V]]]]](https://devnull-as-a-service.com/dev/null)
    `)), trimmed(`
      <p><a href="https://devnull-as-a-service.com/dev/null"><kbd><kbd>Ctrl</kbd>+<kbd>V</kbd></kbd></a></p>
    `));
  });

  it('allows markup within [[ and ]]', () => {
    assert.strictEqual(md.render(trimmed(`
      [[*i*]] [[\`foo\`]]
    `)), trimmed(`
      <p><kbd><em>i</em></kbd> <kbd><code>foo</code></kbd></p>
    `));
  });

  [
    [ '[[foo]] [[', '<kbd>foo</kbd> [[' ],
    [ '[[bar]] ]] hey', '<kbd>bar</kbd> ]] hey' ],
    [ '[[this]] [[ [[and that]]', '<kbd>this</kbd> [[ <kbd>and that</kbd>' ],
    [ '[[that]] ]] [[and this]]', '<kbd>that</kbd> ]] <kbd>and this</kbd>' ],
    [ '[[ *some markup* [[ `more markup` [[valid]] **even more**', '[[ <em>some markup</em> [[ <code>more markup</code> <kbd>valid</kbd> <strong>even more</strong>' ],
    [ '[[', '[[' ],
    [ '[[[x]]', '[<kbd>x</kbd>' ],
    [ '[[[x]]]', '[<kbd>x</kbd>]' ],
    [ '[[*test*', '[[<em>test</em>' ],
    [ '[[[[Shift]]+[[F3]]]', '[[<kbd>Shift</kbd>+<kbd>F3</kbd>]' ],
    [ '[[\\\\]]', '<kbd>\\</kbd>' ]
  ].forEach((spec) => {
    it(`renders correctly: ${spec[0]}`, () => {
      const input = spec[0];
      const expected = spec[1];
      assert.strictEqual(md.render(input), `<p>${expected}</p>\n`);
    });
  });

  describe('markdown-it-attrs compatibility', () => {
    const mdWithAttrs = markdownit()
      .use(markdownItKbd)
      .use(markdownItAttrs);

    it('can apply custom attributes', () => {
      assert.strictEqual(mdWithAttrs.render(trimmed(`
        [[alt]]{data-custom=foo}+[[f4]]{data-custom=bar}
      `)), trimmed(`
        <p><kbd data-custom="foo">alt</kbd>+<kbd data-custom="bar">f4</kbd></p>
      `));
    });

    it('can apply CSS classes', () => {
      assert.strictEqual(mdWithAttrs.render(trimmed(`
        [[ctrl]]{.important}+[[v]]{.important}
      `)), trimmed(`
        <p><kbd class="important">ctrl</kbd>+<kbd class="important">v</kbd></p>
      `));
    });
  });

  // ---

  it('renders [[x]] as <kbd>x</kbd>', () => {
    assert.strictEqual(md.render(read('input/kbd.md')), read('expected/kbd.html'));
  });

  it('does not harm link rendering', () => {
    assert.strictEqual(md.render(read('input/kbdwithlink.md')), read('expected/kbdwithlink.html'));
  });

  it('ignores [[ and ]] if not forming a keystroke.', () => {
    assert.strictEqual(md.render(read('input/dangling.md')), read('expected/dangling.html'));
  });

  it('allows markup within [[ and ]]', () => {
    assert.strictEqual(md.render(read('input/markupwithin.md')), read('expected/markupwithin.html'));
  });

  it('can be used together with markdown-it-attrs', () => {
    const mdwithattrs = markdownit()
      .use(markdownItKbd)
      .use(markdownItAttrs);
    assert.strictEqual(mdwithattrs.render(read('input/withattrs.md')), read('expected/withattrs.html'));
  });

  it('can use alternative markers [=x=] to prevent collision with wikilinks plugin', () => {
    const md2 = markdownit()
      .use(markdownItWikiLinks, {
        baseURL: '/wiki/'
      })
      .use(markdownItKbd, {
        MARKER_OPEN: '[=',
        MARKER_CLOSE: '=]'
      });

    assert.strictEqual(md2.render(read('input/kbd_alt.md')), read('expected/kbd_alt.html'));
  });
});
