var path = require("path")

module.exports = {
  entry: './hello.rb',
  output: {
    filename: 'bundle.js'       
  },
  module: {
    loaders: [
      { 
        test: /\.rb$/, 
        loader: "opalrb-loader",
      }
    ]
  },
  devtool: 'sourcemap',
};
