'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.raw = undefined;
exports.default = loader;


var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);


function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Loader Mode
const raw = exports.raw = true; /* eslint-disable
                                  global-require,
                                  no-param-reassign,
                                  prefer-destructuring,
                                  import/no-dynamic-require,
                                */
function loader(src) {
  // Loader Options  

  const file = this.resourcePath;
  const mimetype = _mime2.default.lookup ? _mime2.default.lookup(file) : _mime2.default.getType(file);
  
  if (typeof src === 'string') {
    src = Buffer.from(src);
  }

  let base122 = require('./base122');
  let encoded = Buffer.from(base122.encode(src), 'utf8');  

  let final = '___base122___' + mimetype + '___' + encoded.toString('utf-8');

  return `module.exports = "${final}"`;
  
}