
'use strict'

if (process.env.NODE_ENV !== 'development') {
  module.exports = {
    DevTool: () => null,
  };
} else {
  module.exports = require('./index.cjs.development.js')
}
