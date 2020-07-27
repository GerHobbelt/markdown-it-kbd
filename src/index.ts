// [[kbd]]
//
import MarkdownIt from 'markdown-it'
import StateInline from 'markdown-it/lib/rules_inline/state_inline'

let options = {
  MARKER_OPEN: '[[',
  MARKER_CLOSE: ']]',
  ESCAPE_CHARACTER: '\\',
  TAG: 'kbd',

  // intern use; derived at time of initialization:
  MARKER_OPEN_1ST_CHR: 0
};

/*
 * Add delimiters for double occurrences of MARKER_SYMBOL.
 */
function tokenize(state: StateInline, silent: boolean) {
  if (silent) {
    return false;
  }

  let start = state.pos;
  const max = state.posMax;
  let momChar = state.src.charCodeAt(start);

  // TODO: check for escaped open & close markers (vanilla v2.2.0 only checks for escapes in the END marker, BTW...

  // We are looking for two times the open symbol.
  if (momChar !== options.MARKER_OPEN_1ST_CHR) {
    return false;
  }
  let src = state.src.slice(start);
  if (!src.startsWith(options.MARKER_OPEN)) {
    return false;
  }
  const startLen = options.MARKER_OPEN.length;
  start += startLen;
  src = src.slice(startLen);

  // find the end sequence
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
  }

  // make end position into absolute index
  end += start;

  // start tag
  state.push('kbd_open', options.TAG, 1);
  // parse inner
  state.pos = start;
  state.posMax = end;
  state.md.inline.tokenize(state);
  state.pos = end + options.MARKER_CLOSE.length;
  state.posMax = max;
  // end tag
  state.push('kbd_close', options.TAG, -1);

  return true;
}

export default function kbdplugin(markdownit: MarkdownIt, opts): void {
  options = Object.assign(options, opts);
  options.MARKER_OPEN_1ST_CHR = options.MARKER_OPEN.charCodeAt(0);

  markdownit.inline.ruler.before('link', 'kbd', tokenize);
}
