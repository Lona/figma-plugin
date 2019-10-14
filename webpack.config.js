const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const dotenv = require("dotenv");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const configEnv = dotenv.config({
    path: path.join(
      __dirname,
      argv.mode === "production" ? ".env.production" : ".env.development"
    )
  });

  return {
    mode: argv.mode === "production" ? "production" : "development",

    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === "production" ? false : "inline-source-map",

    entry: {
      ui: "./src/ui.tsx", // The entry point for your UI code
      code: "./src/code.ts" // The entry point for your plugin code
    },

    module: {
      rules: [
        // Converts TypeScript code to JavaScript
        { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },

        // Enables including CSS by doing "import './file.css'" in your TypeScript code
        {
          test: /\.css$/,
          loader: [{ loader: "style-loader" }, { loader: "css-loader" }]
        },

        // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
        {
          test: /\.(png|jpg|gif|webp|svg)$/,
          loader: [{ loader: "url-loader" }]
        },

        // Pre-process graphql queries
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: "graphql-tag/loader"
        }
      ]
    },

    // Webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: { extensions: [".tsx", ".ts", ".jsx", ".js", ".json"] },

    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist") // Compile into a folder called "dist"
    },

    // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/ui.html",
        filename: "ui.html",
        inlineSource: ".(js)$",
        chunks: ["ui"]
      }),
      new HtmlWebpackInlineSourcePlugin(),
      new webpack.DefinePlugin({
        "process.env": Object.keys(configEnv.parsed).reduce(
          (prev, k) => {
            prev[k] = JSON.stringify(configEnv.parsed[k]);
            return prev;
          },
          {
            NODE_ENV: JSON.stringify(
              argv.mode === "production" ? "production" : "development"
            )
          }
        )
      })
    ]
  };
};
