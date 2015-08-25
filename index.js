"use strict";

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _process = require("process");

var _process2 = _interopRequireDefault(_process);

var _loaderUtils = require("loader-utils");

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _sourceMap = require('source-map');

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

require("./vendor/opal-compiler.js");

var LOAD_PATH = _process2["default"].env.OPAL_LOAD_PATH ? _process2["default"].env.OPAL_LOAD_PATH.split(":") : [];

if (LOAD_PATH.length === 0) {
  console.warn("OPAL_LOAD_PATH environment variable is not set");
  console.warn("By default, loader will only load from path relative to current source");
}

function getCurrentLoader(loaderContext) {
  return loaderContext.loaders[loaderContext.loaderIndex];
}

function resolveFilename(loaderContext, filename) {
  var rubyFileName = filename.replace(/(\.rb)?$/, ".rb");

  // FIXME
  // Workaround to make "require 'opal'" work, original opal will try to concate raw js
  if (filename == 'corelib/runtime') {
    rubyFileName = 'corelib/runtime.js';
  }

  var result = null;
  if (rubyFileName.match(/^\./)) {
    // Resolve in current directory
    var fullPath = _path2["default"].resolve(loaderContext.context, rubyFileName);
    if (_fs2["default"].existsSync(fullPath)) {
      result = fullPath;
    }
  } else {
    // Resolve in LOAD_PATH
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _getIterator(LOAD_PATH), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dir = _step.value;

        var fullPath = _path2["default"].resolve(dir, rubyFileName);
        if (_fs2["default"].existsSync(fullPath)) {
          result = fullPath;
          break;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"]) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  if (result) {
    return result;
  } else {
    throw new Error("Cannot load file - " + filename);
  }
}

exports["default"] = function (source) {
  var _this = this;

  var callback = this.async();
  if (!callback) throw new Error("Sync mode not supported");

  var compilerOptions = _Object$assign({ file: this.resourcePath }, _loaderUtils2["default"].parseQuery(this.query));
  var compiler = Opal.Opal.Compiler.$new(source, Opal.hash(compilerOptions));
  var currentLoader = getCurrentLoader(this).path;

  this.cacheable && this.cacheable();

  compiler.$compile();

  var result = compiler.$result();

  /* 
    Workaround to make IO work, 
    webpack polyfill global "process" module by default,
    while Opal::IO rely on it to deterimine in node environment or not 
  */
  var prepend = ['process = undefined;'];

  compiler.$requires().forEach(function (filename) {
    var resolved = resolveFilename(_this, filename);
    if (resolved.match(/\.js$/)) {
      prepend.push("require('" + require.resolve('imports-loader') + "!" + resolved + "');");
      prepend.push("Opal.mark_as_loaded(Opal.normalize_loadable_path('" + filename + "'));");
    } else {
      prepend.push("require('!!" + currentLoader + "?file=" + filename + "&requirable=true!" + resolved + "');");
    }
  });

  if (this.sourceMap) {
    var rawMap = JSON.parse(compiler.$source_map().$as_json().$to_json());

    // Since it's compiled from the current resource
    rawMap.sources = [this.resourcePath];

    // Set source content
    var consumer = new _sourceMap.SourceMapConsumer(rawMap);
    var map = _sourceMap.SourceMapGenerator.fromSourceMap(consumer);
    map.setSourceContent(this.resourcePath, source);

    // Add one source node for prepended text
    var node = new _sourceMap.SourceNode(null, null, null, [new _sourceMap.SourceNode(null, null, this.resourcePath, prepend.join(" ")), _sourceMap.SourceNode.fromStringWithSourceMap(result, new _sourceMap.SourceMapConsumer(map.toString()))]).join('\n');

    callback(null, prepend.join(" ") + "\n" + result, JSON.parse(node.toStringWithSourceMap().map.toString()));
  } else {
    callback(null, result);
  }
};

;
module.exports = exports["default"];
