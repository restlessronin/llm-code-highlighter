import * as path from 'path';
import { Configuration, node } from 'webpack';

const config: Configuration = {
  mode: 'production',
  entry: {
    'index.node': './src/index.node.ts',
    'index.browser': './src/index.browser.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scm$/,
        use: 'raw-loader',
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      path: false,
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  target: ['web', 'es5'],
};

export default config;
