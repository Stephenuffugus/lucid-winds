/* The one stamp. Every relative import in core/ and demo/ carries exactly
   `?v=` plus this string (tools/lint.mjs), because an ES module import is its
   own URL and a stamp on the entry point never reaches it. */
export const STAMP = '20260915d';
