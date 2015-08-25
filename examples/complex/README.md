# Complex Example

## Usage

1. Run `npm install`.
2. Run `npm install -g webpack-dev-server`.
3. Run `bundle install`.
4. Run 'rake webpack' to start webpack-dev-server
4. Open http://localhost:8080 and see the console.

## Explanation

### `rake webpack`

`opalrb-loader` rely on `OPAL_LOAD_PATH` environment variable to correctly resolve file other than relative path.

This task simply supply the variable to webpack by using `Opal.paths`. Gem which is aware of Opal will correctly add its path to `Opal.paths` on required. Otherwise, you need to invoke `Opal.use_gem` to manually collect paths.
