import { readFileSync } from "fs";
import ts from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";
import uglify from "rollup-plugin-uglify";
import html from 'rollup-plugin-html';
import { createFilter } from 'rollup-pluginutils';
import csso from 'csso';

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

const { mod, minify } = process.env;

function when(predicate, opts) {
  return predicate ? opts : {};
}

function output(target, format, opts = {}) {
  return {
    input: `src/index.ts`,
    output: { ...{ file: `dist/${mod}/index${minify ? ".min" : ""}.js`, format, name: pkg.name }, ...opts },
    plugins: [
      resolve(),
      commonJS({
        include: "node_modules/**"
      }),
      ts({
        useTsconfigDeclarationDir: true,
        tsconfig: `configs/tsconfig-build-${mod}.json`,
        tsconfigOverride: {
          compilerOptions: {
            target,
            module: target === "es2017" || target === 'es2018' ? "es2015" : target,
            declaration: !minify && target === "es2015",
            declarationDir: '../dist/types'
          }
        },
        cacheRoot: `.rollupcache/${mod}`
      }),
      when(
        minify,
        uglify({
          compress: {
            sequences: true,
            dead_code: true,
            conditionals: true,
            booleans: true,
            unused: true,
            if_return: true,
            join_vars: true,
            drop_console: true
          },
          output: {
            comments: false
          }
        })
      ),
      html({
        include: '**/*.html',
        htmlMinifierOptions: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          conservativeCollapse: false,
          minifyJS: true
        }
      }),
      css()
    ],
    external: [
      'aurelia-framework',
      'aurelia-blur-attribute',
      'aurelia-portal-attribute',
      'aurelia-typed-observable-plugin',
      'dragula',
      'tslib'
    ]
  };
}

function css () {
  const filter = createFilter(['**/*.css'], []);

  return {
    name: 'css',
    transform (code, id) {
      if (!filter(id)) {
        return;
      }

      return {
        code: 'export default ' + JSON.stringify(csso.minify(code, {
          restructure: false,
          debug: false,
          sourceMap: false
        }).css),
        map: { mappings: '' }
      };
    }
  };
}

let config;
switch (mod) {
  case "amd":
    config = output("es2015", "amd", { amd: { id: pkg.name } });
    break;
  case "commonjs":
    config = output("es2015", "cjs");
    break;
  case "es2015":
    config = output("es2015", "es");
    break;
  case "es2017":
    config = output("es2017", "es");
    break;
  case "esnext":
    config = output("esnext", "es");
    break;
  case "native-modules":
    config = output("es2015", "es");
    break;
  case "system":
    config = output("es2015", "system");
    break;
  case "umd":
    config = output("es2015", "umd");
    break;
}

export default config;
