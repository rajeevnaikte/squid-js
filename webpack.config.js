const path = require('path');

module.exports = {
  entry: './src/ui/ui.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'uxui.js',
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    fs: 'empty'
  }
};
