'use strict';

/**
 * Low-level X12 segment builder.
 *
 * Holds the standard delimiter set used by Availity:
 *   Element separator  : *
 *   Sub-element sep    : :
 *   Repetition sep     : ^
 *   Segment terminator : ~
 *
 * A trailing newline after each ~ is optional; Availity accepts both.
 * We add \n for human readability — strip it for wire-format production.
 */
class X12Builder {
  constructor(options = {}) {
    this.elementSep   = options.elementSep   ?? '*';
    this.subElemSep   = options.subElemSep   ?? ':';
    this.repeatSep    = options.repeatSep    ?? '^';
    this.segTerminator = options.segTerminator ?? '~';
    this.lineBreak    = options.lineBreak    ?? '\n';
    this._segments    = [];
  }

  /**
   * Build and store one segment.
   * @param {string}   id      Segment identifier (e.g. 'ISA', 'NM1')
   * @param {string[]} elements Array of element values; empty string produces trailing sep trim
   */
  segment(id, elements) {
    // Strip undefined/null → empty string, then join
    const parts = [id, ...elements.map(e => (e === null || e === undefined) ? '' : String(e))];
    // Trim trailing empty elements to avoid unnecessary trailing delimiters
    while (parts.length > 1 && parts[parts.length - 1] === '') {
      parts.pop();
    }
    this._segments.push(parts.join(this.elementSep) + this.segTerminator + this.lineBreak);
    return this;
  }

  /**
   * Compose a composite element (sub-elements joined by the sub-element separator).
   */
  composite(...parts) {
    return parts.map(p => (p === null || p === undefined) ? '' : String(p)).join(this.subElemSep);
  }

  /**
   * Return the full accumulated string of all segments built so far.
   */
  toString() {
    return this._segments.join('');
  }

  /**
   * Reset for reuse.
   */
  reset() {
    this._segments = [];
    return this;
  }

  /** Number of segments added (excluding envelope if built separately). */
  get segmentCount() {
    return this._segments.length;
  }
}

module.exports = X12Builder;
