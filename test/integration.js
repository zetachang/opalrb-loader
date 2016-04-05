'use strict';

const assert = require('assert');
const rimraf = require('rimraf');
const assign = require('object-assign');
const expect = require('expect.js');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const execSync = require('child_process').execSync;
const fsExtra = require('fs-extra');

describe('Opal loader', function(){
  const dependencyMain = './test/fixtures/dependency.rb'
  const dependencyBackup = './test/fixtures/dependency.rb.backup'
  const opalLoader = path.resolve(__dirname, '../');
  const outputDir = path.resolve(__dirname, './output/loader');
  const globalConfig = {
      output: {
        path: outputDir,
        filename: '[id].loader.js',
      },
      module: {
        loaders: [{ test: /\.rb$/, loader: opalLoader }],
      },
    };

  beforeEach(done => {
    fsExtra.copySync(dependencyMain, dependencyBackup, {clobber: true})
    rimraf(outputDir, function(err) {
      if (err) { return done(err); }
      mkdirp(outputDir, done);
    });
  });

  afterEach(done => {
    // cleanup
    fsExtra.copy(dependencyBackup, dependencyMain, {clobber: true}, done)
  })

  it("loads correctly", done => {
    const config = assign({}, globalConfig, {
      entry: './test/fixtures/basic.js'
    });
    webpack(config, (err, stats) => {
      expect(err).to.be(null);

      fs.readdir(outputDir, (err, files) => {
        expect(err).to.be(null);
        expect(files.length).to.equal(1);
        fs.readFile(path.resolve(outputDir, files[0]), (err, data) => {
          var subject = data.toString();

          expect(err).to.be(null);
          expect(subject).to.match(/Opal\.cdecl\(\$scope, 'HELLO', 123\)/);

          return done();
        });
      })
    });
  });

  it("reloads dependencies properly", function (done) {
    this.timeout(6000)
    const config = assign({}, globalConfig, {
      entry: './test/fixtures/requires.js'
    });
    webpack(config, (err, stats) => {
      expect(err).to.be(null)
      fs.writeFileSync(dependencyMain, 'HELLO=456')
      setTimeout(() => {
        fs.readdir(outputDir, (err, files) => {
          expect(err).to.be(null);
          expect(files.length).to.equal(1);
          fs.readFile(path.resolve(outputDir, files[0]), (err, data) => {
            var subject = data.toString();

            expect(err).to.be(null);
            expect(subject).to.match(/Opal\.cdecl\(\$scope, 'HELLO', 123\)/);

            return done();
          })
        })
      }, 3000)
    });
  });

  it("loads requires correctly", done =>{
    const config = assign({}, globalConfig, {
      entry: './test/fixtures/requires.js'
    });
    webpack(config, (err, stats) => {
      expect(err).to.be(null);

      fs.readdir(outputDir, (err, files) => {
        expect(err).to.be(null);
        expect(files.length).to.equal(1);
        fs.readFile(path.resolve(outputDir, files[0]), (err, data) => {
          var subject = data.toString();

          expect(err).to.be(null);
          expect(subject).to.match(/Opal\.cdecl\(\$scope, 'HELLO', 123\)/);

          return done();
        });
      })
    });
  });

  it("loads require_tree", done => {
    const config = assign({}, globalConfig, {
      entry: './test/fixtures/tree.js'
    });
    webpack(config, (err, stats) => {
      expect(err).to.be(null);

      fs.readdir(outputDir, (err, files) => {
        expect(err).to.be(null);
        expect(files.length).to.equal(1);
        fs.readFile(path.resolve(outputDir, files[0]), (err, data) => {
          var subject = data.toString();

          expect(err).to.be(null);
          expect(subject).to.match(/Opal\.cdecl\(\$scope, 'HELLO', 123\)/);
          expect(subject).to.match(/Opal\.cdecl\(\$scope, 'THERE', 456\)/);

          return done();
        });
      })
    });
  });

  it("loads require_relative", done => {
    const config = assign({}, globalConfig, {
      entry: './test/fixtures/relative.js'
    });
    webpack(config, (err, stats) => {
      expect(err).to.be(null);

      fs.readdir(outputDir, (err, files) => {
        expect(err).to.be(null);
        expect(files.length).to.equal(1);
        fs.readFile(path.resolve(outputDir, files[0]), (err, data) => {
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
    webpack(config, (err, stats) => {
      expect(err).to.be(null);

      fs.readdir(outputDir, (err, files) => {
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
