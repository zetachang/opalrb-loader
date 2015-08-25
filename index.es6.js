require("./vendor/opal-compiler.js")

import process from "process"
import loaderUtils from "loader-utils"
import { SourceNode, SourceMapConsumer, SourceMapGenerator } from 'source-map'
import path from "path"
import fs from "fs";

const LOAD_PATH = process.env.OPAL_LOAD_PATH ? process.env.OPAL_LOAD_PATH.split(":") : [];

if (LOAD_PATH.length === 0) {
  console.warn("OPAL_LOAD_PATH environment variable is not set")
  console.warn("By default, loader will only load from path relative to current source")
}

function getCurrentLoader(loaderContext) {
  return loaderContext.loaders[loaderContext.loaderIndex];
}

function resolveFilename(loaderContext, filename) {
  let rubyFileName = filename.replace(/(\.rb)?$/, ".rb");
  
  // FIXME
  // Workaround to make "require 'opal'" work, original opal will try to concate raw js
  if (filename == 'corelib/runtime') {
    rubyFileName = 'corelib/runtime.js'
  }
  
  let result = null;
  if (rubyFileName.match(/^\./)) { 
    // Resolve in current directory
    let fullPath = path.resolve(loaderContext.context, rubyFileName);
    if (fs.existsSync(fullPath)) {
      result = fullPath;
    }
  } else { 
    // Resolve in LOAD_PATH
    for (var dir of LOAD_PATH) {
      let fullPath = path.resolve(dir, rubyFileName);
      if (fs.existsSync(fullPath)) {
        result = fullPath;
        break;
      }
    }
  }
  
  if (result) {
    return result;
  } else {
    throw new Error(`Cannot load file - ${filename}`);
  }
}

export default function(source) {  
  const callback = this.async();
  if(!callback) throw new Error("Sync mode not supported");

  const compilerOptions = Object.assign({file: this.resourcePath}, loaderUtils.parseQuery(this.query));
  const compiler = Opal.Opal.Compiler.$new(source, Opal.hash(compilerOptions));    
  const currentLoader = getCurrentLoader(this).path;
  
  this.cacheable && this.cacheable()
  
  compiler.$compile();
  
  const result = compiler.$result();
  
  /* 
    Workaround to make IO work, 
    webpack polyfill global "process" module by default,
    while Opal::IO rely on it to deterimine in node environment or not 
  */
  let prepend = ['process = undefined;'];
  
  compiler.$requires().forEach(filename => {
    var resolved = resolveFilename(this, filename);
    if (resolved.match(/\.js$/)) {
      prepend.push(`require('${require.resolve('imports-loader')}!${resolved}');`);
      prepend.push(`Opal.mark_as_loaded(Opal.normalize_loadable_path('${filename}'));`)
    } else {
      prepend.push(`require('!!${currentLoader}?file=${filename}&requirable=true!${resolved}');`);
    }
  })
  
  if (this.sourceMap) {
    let rawMap = JSON.parse(compiler.$source_map().$as_json().$to_json());
    
    // Since it's compiled from the current resource
    rawMap.sources = [this.resourcePath];
    
    // Set source content
    let consumer = new SourceMapConsumer(rawMap)
    let map = SourceMapGenerator.fromSourceMap(consumer);
    map.setSourceContent(this.resourcePath, source);
    
    // Add one source node for prepended text
    let node = new SourceNode(null, null, null, [
      new SourceNode(null, null, this.resourcePath, prepend.join(" ")),
      SourceNode.fromStringWithSourceMap(result, new SourceMapConsumer(map.toString())),
    ]).join('\n');    
          
    callback(null, prepend.join(" ") + "\n" + result, JSON.parse(node.toStringWithSourceMap().map.toString()));
  } else {
    callback(null, result);
  }
};
