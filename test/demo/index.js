const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const testSpec = require('../spec');

// import testSpec from '../spec';

const descriptionPrefix = '[webpack 4 / html-webpack-plugin 4]';
testSpec({ webpack, HtmlWebpackPlugin, descriptionPrefix });
