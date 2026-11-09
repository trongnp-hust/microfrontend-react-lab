const path = require("node:path");
const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {
  container: { ModuleFederationPlugin },
} = require("webpack");
module.exports = (name, port, dirname) => ({
  entry: path.join(dirname, "src/index.jsx"),
  output: {
    path: path.join(dirname, "dist"),
    filename: "[name].[contenthash].js",
    publicPath: "auto",
    uniqueName: name,
    clean: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      "@lab/contracts": path.resolve(
        __dirname,
        "../packages/contracts/index.cjs",
      ),
      "@lab/ui": path.resolve(__dirname, "../packages/ui/index.jsx"),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            configFile: path.resolve(__dirname, "../babel.config.json"),
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: { namedExport: false, auto: /\.module\.css$/ },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      __CATALOG_BFF_URL__: JSON.stringify(
        process.env.CATALOG_BFF_URL ?? "http://localhost:4000",
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      title: name,
    }),
    new ModuleFederationPlugin({
      name,
      filename: "remoteEntry.js",
      exposes:
        name === "shell" ? {} : { "./App": path.join(dirname, "src/App.jsx") },
      shared: {
        react: { singleton: true, requiredVersion: "^19.2.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.2.0" },
      },
    }),
  ],
  devServer: {
    port,
    host: "localhost",
    historyApiFallback: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    static: { directory: path.resolve(dirname, "public") },
    client: {
      overlay: { errors: true, warnings: false, runtimeErrors: false },
    },
  },
  devtool: "source-map",
  performance: { hints: false },
});
