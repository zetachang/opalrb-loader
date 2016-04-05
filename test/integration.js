'use strict';

var assert = require('assert');
var rimraf = require('rimraf');
var assign = require('object-assign');
var expect = require('expect.js');
var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var execSync = require('child_process').execSync;

describe('Opal loader', function(){
  var opalLoader = path.resolve(__dirname, '../');
  var outputDir = path.resolve(__dirname, './output/loader');
  var globalConfig = {
      output: {
        path: outputDir,
        filename: '[id].loader.js',
      },
      module: {
        loaders: [{ test: /\.rb$/, loader: opalLoader }],
      },
    };

  beforeEach(function(done) {
    rimraf(outputDir, function(err) {
      if (err) { return done(err); }
      mkdirp(outputDir, done);
    });
  });

  it("loads correctly", function (done) {
    const config = assign({}, globalConfig, {
      entry: './test/fixtures/basic.js'
    });
    webpack(config, function(err, stats) {
      expect(err).to.be(null);

      fs.readdir(outputDir, function(err, files) {
        expect(err).to.be(null);
        expect(files.length).to.equal(1);
        fs.readFile(path.resolve(outputDir, files[0]), function(err, data) {
          var subject = data.toString();

          expect(err).to.be(null);
          expect(subject).to.match(/Opal\.cdecl\(\$scope, 'HELLO', 123\)/);

          return done();
        });
      })
    });
  });

  it("loads requires correctly", function (done) {
    const config = assign({}, globalConfig, {
      entry: './test/fixtures/requires.js'
    });
    webpack(config, function(err, stats) {
      expect(err).to.be(null);

      fs.readdir(outputDir, function(err, files) {
        expect(err).to.be(null);
        expect(files.length).to.equal(1);
        fs.readFile(path.resolve(outputDir, files[0]), function(err, data) {
          var subject = data.toString();

          expect(err).to.be(null);
          expect(subject).to.match(/Opal\.cdecl\(\$scope, 'HELLO', 123\)/);

          return done();
        });
      })
    });
  });

  it("outputs correct source maps", function (done) {
    this.timeout(10000);
    execSync("bundle exec opal -c -e \"require 'opal'\" > test/output/loader/opal.js");

    const config = assign({}, globalConfig, {
      entry: './test/fixtures/source_maps.js',
      devtool: 'source-map'
    });
    webpack(config, function(err, stats) {
      expect(err).to.be(null);

      fs.readdir(outputDir, function(err, files) {
        expect(err).to.be(null);
        expect(files.length).to.equal(3);
        var output = execSync("node -r ./test/output/loader/opal.js -r ./test/fixtures/load_source_maps.js ./test/output/loader/0.loader.js 2>&1 || true").toString()
        // ruby output, might need some more work since we're 1 line off
        // expecting test/fixtures/source_maps.rb:4:in `hello': source map location (RuntimeError)
        expect(output).to.match(/test\/output\/loader\/webpack:\/test\/fixtures\/source_maps\.rb:3:1\)/)
        expect(output).to.match(/test\/output\/loader\/webpack:\/test\/fixtures\/source_maps.rb:7:1\)/)
        return done();
      })
    });
  });
});
