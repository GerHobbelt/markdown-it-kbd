/*! markdown-it-kbd 2.2.0-8 https://github.com//GerHobbelt/markdown-it-kbd @license GPL-3.0 */

// [[kbd]]
//
const defaultOptions = {
  MARKER_OPEN: '[[',
  MARKER_CLOSE: ']]',
  ESCAPE_CHARACTER: '\\',
  TAG: 'kbd',
  // intern use; derived at time of initialization:
  MARKER_OPEN_1ST_CHR: 0
};
function kbdplugin(markdownit, opts) {
  const options = Object.assign({}, defaultOptions, opts);
  options.MARKER_OPEN_1ST_CHR = options.MARKER_OPEN.charCodeAt(0);

  function findNextNonEscapedMarker(src, start, marker) {
    let end;
    let searchOffset = start;

    for (;;) {
      end = src.indexOf(marker, searchOffset);

      if (end < 0) {
        return -1;
      } // count number of escape characters before marker:
      // if ODD, then marker is escaped:


      let escapeCount = 0;

      for (let i = end - 1; i >= 0 && src.charAt(i) === options.ESCAPE_CHARACTER; i--) {
        escapeCount++;
      }

      if (escapeCount % 2 === 0) {
        // got a proper end marker now: exit loop
        break;
      } // skip first character of escaped end marker and try again:


      searchOffset = end + 1;
    }

    return end;
  }

  function findMatchingClose(src, start, level) {
    let end = findNextNonEscapedMarker(src, start, options.MARKER_CLOSE);

    if (end < 0) {
      // no end marker found,
      // input ended before closing sequence
      return -1;
    } // first skip all inner KBD chunks:


    let innerStart = findNextNonEscapedMarker(src, start, options.MARKER_OPEN);
    let searchOffset = start;

    while (innerStart >= 0) {
      // when there's a START *before* our END, then that MUST be an *inner* START:
      // we should find *it's* matching END. That doesn't necessarily have to be
      // the one we found already, as this stuff may be nested several levels!
      if (innerStart >= 0 && innerStart < end) {
        searchOffset = innerStart + options.MARKER_OPEN.length; // found one. There may be more. So we move our `end` forward now to ensure the next inner KBD chunk is found as well.

        end = findMatchingClose(src, searchOffset);

        if (end < 0) {
          return -1;
        }

        searchOffset = end + options.MARKER_CLOSE.length;
        innerStart = findNextNonEscapedMarker(src, searchOffset, options.MARKER_OPEN);
        end = findNextNonEscapedMarker(src, searchOffset, options.MARKER_CLOSE);

        if (end < 0) {
          // no end marker found,
          // input ended before closing sequence
          return -1;
        }
      } else {
        // we only found a START that's beyond our END, so it doesn't matter. Stop looking for inner KBD chunks.
        innerStart = -1;
      }
    } // the last END marker found is our own:


    return end;
  }
  /*
   * Add delimiters for double occurrences of MARKER_SYMBOL.
   */


  function tokenize(state, silent) {
    if (silent) {
      return false;
    }

    let start = state.pos;
    const max = state.posMax;
    const momChar = state.src.charCodeAt(start); // We are looking for two times the open symbol.

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

    let end = findMatchingClose(src, 0);

    if (end < 0) {
      // no end marker found,
      // input ended before closing sequence
      return false;
    }

    const lf = src.indexOf('\n');

    if (lf >= 0 && lf < end) {
      // found end of line before the end sequence. Thus, ignore our start sequence!
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

  markdownit.inline.ruler.before('link', 'kbd', tokenize);
}

export default kbdplugin;
//# sourceMappingURL=markdownItKbd.modern.js.map
