#!/usr/bin/env bash

# pre-reqs: 
# install node.js 
# install rustup https://rust-lang.org/tools/install/
# install wasm-pack https://rustwasm.github.io/ or https://drager.github.io/wasm-pack/installer/

branch="origin main"

# build nemo-wasm
git clone https://github.com/knowsys/nemo
cd nemo/nemo-wasm
git pull $branch

wasm-pack build --out-dir nemoWASMBundler --target bundler --weak-refs --release
wasm-pack build --out-dir nemoWASMWeb --target web --weak-refs --release

# build language server
cd ../../
git clone https://github.com/knowsys/nemo-vscode-extension
cd nemo-vscode-extension
git pull $branch

cp -r ../nemo/nemo-wasm/nemoWASMWeb .
npm install
npm run package

# build nemo-web
cd ../
git clone https://github.com/knowsys/nemo-web
cd nemo-web
git pull $branch

mkdir nemoVSIX
cp ../nemo-vscode-extension/nemo-*.vsix nemoVSIX/nemo.vsix
cp -r ../nemo/nemo-wasm/nemoWASMBundler ./nemoWASMBundler
npm ci
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# build nev
cd ../
npm ci

# npm run dev 
# http://localhost:5173/nemo-web/dist/ for nemo-web
# http://localhost:5173/ for nev