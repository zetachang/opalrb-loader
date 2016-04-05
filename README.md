# opalrb-loader
> Opal is a compiler for writing JavaScript in Ruby.

This package allows transpiling Ruby files using [Opal](http://opalrb.org) and [webpack](https://github.com/webpack/webpack).

Check out [this blog post](https://medium.com/@zetachang/from-sprockets-to-webpack-5f3d1afbd1b0) if you are interested in the project background.

[![npm version](https://img.shields.io/npm/v/opalrb-loader.svg?style=flat-square)](https://www.npmjs.com/package/opalrb-loader)
[![npm downloads](https://img.shields.io/npm/dt/opalrb-loader.svg?style=flat-square)](https://www.npmjs.com/package/opalrb-loader)
[![Circle CI](https://circleci.com/gh/zetachang/opalrb-loader.svg?style=svg)](https://circleci.com/gh/zetachang/opalrb-loader)

## Installation

```bash
npm install opalrb-loader --save-dev
```

## Usage

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

```javascript
// webpack.config.js
module: {
  loaders: [
    {
      test: /\.rb?$/,
      loader: 'opalrb-loader'
    }
  ]
}
```

### Options

See `Opal::Compiler` [options](https://github.com/opal/opal/blob/master/lib/opal/compiler.rb) for possible options.

```javascript
// webpack.config.js
module: {
  loaders: [
    {
      test: /\.rb?$/,
      loader: 'opalrb-loader',
      query: {
        requirable: false,
        freezing: false,
      }
    }
  ]
}
```

#### OPAL_LOAD_PATH

By passing `OPAL_LOAD_PATH` environment variable to webpack, the loader will correctly resolve file other than relative path.

`opalrb-loader` is only bundled with compiler module. It left the decision on managing runtime, corelib or gems to developer.

See the example [Rakefile](https://github.com/zetachang/opalrb-loader/blob/master/examples/complex/Rakefile) for how to integrate using other Opal gems.

### Compared to `Opal::Builder`
* Relative `require` is correctly resolved.
* erb is not supported (which should be implemented as separate loader).

### Known issues
* First time compiling is relatively slow compared to Ruby one, use `--watch` option for webpack to speed up dev iteration.
* Use `require` to load JS file is broken, but you can write as below to load JS module (webpack will correctly resolve it).
```ruby
# Inside ruby file
`var $ = require("jquery")`
```
* **stdlib** and some gems may not be correctly compiled, please file an issue if you encounter one.

### Examples

It's under [Examples](https://github.com/zetachang/opalrb-loader/tree/master/examples) folder.

* simple: Basic setup without further dependency.
* complex: Compile opal/corelib and other gems.

## Development

* `npm install`
* `npm run build_compiler` to build compiler
* `npm start` to compile & watch `index.es6.js`

## Contact

[David Chang](http://github.com/zetachang)
[@zetachang](https://twitter.com/zetachang)

## License

Available under the MIT license. See the LICENSE file for more info.
