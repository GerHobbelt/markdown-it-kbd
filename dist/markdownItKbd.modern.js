/*! markdown-it-kbd 2.0.0-5 https://github.com//GerHobbelt/markdown-it-kbd @license GPL-3.0 */

// [[kbd]]
//
let options = {
  MARKER_OPEN: '[[',
  MARKER_CLOSE: ']]',
  TAG: 'kbd',
  // intern use; derived at time of initialization:
  MARKER_OPEN_1ST_CHR: 0
};

function tokenize(state, silent) {
  if (silent) {
    return false;
  }

  let start = state.pos;
  const max = state.posMax;
  let momChar = state.src.charCodeAt(start); // we're looking for two times the open symbol.

  if (momChar !== options.MARKER_OPEN_1ST_CHR) {
    return false;
  }

  let src = state.src.slice(start);

  if (!src.startsWith(options.MARKER_OPEN)) {
    return false;
  }

  const startLen = options.MARKER_OPEN.length;
  start += startLen;
  src = src.slice(startLen); // find the end sequence

  let end = src.indexOf(options.MARKER_CLOSE);

  if (end < 0) {
    // no end marker found,
    // input ended before closing sequence
    return false;
  }

  let lf = src.indexOf('\n');

  if (lf >= 0 && lf < end) {
    // found end of line before the end sequence. Thus, ignore our start sequence!
    return false;
  }

  let second = src.indexOf(options.MARKER_OPEN);

  if (second >= 0 && second < end) {
    // found another opening sequence before the end. Thus, ignore ours!
    return false;
  } // make end position into absolute index


  end += start; // start tag

  state.push('kbd_open', options.TAG, 1); // parse inner

  state.pos = start;
  state.posMax = end;
  state.md.inline.tokenize(state);
  state.pos = end + options.MARKER_CLOSE.length;
  state.posMax = max; // end tag

  state.push('kbd_close', options.TAG, -1);
  return true;
}

function kbdplugin(markdownit, opts) {
  options = Object.assign(options, opts);
  options.MARKER_OPEN_1ST_CHR = options.MARKER_OPEN.charCodeAt(0);
  markdownit.inline.ruler.before('link', 'kbd', tokenize);
}

export default kbdplugin;
//# sourceMappingURL=markdownItKbd.modern.js.map
