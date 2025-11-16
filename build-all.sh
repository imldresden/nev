#!/usr/bin/env bash

# pre-reqs: 
# install node.js 
# install rustup https://rust-lang.org/tools/install/
# install wasm-pack https://rustwasm.github.io/ or https://drager.github.io/wasm-pack/installer/

rm -rf nemo
rm -rf nemo-vscode-extension
rm -rf nemo-web

# build nemo-wasm
git clone https://github.com/knowsys/nemo
cd nemo/nemo-wasm

wasm-pack build --out-dir nemoWASMBundler --target bundler --weak-refs --release
wasm-pack build --out-dir nemoWASMWeb --target web --weak-refs --release

# build language server
cd ../../
git clone https://github.com/knowsys/nemo-vscode-extension
cd nemo-vscode-extension

cp -r ../nemo/nemo-wasm/nemoWASMWeb .
npm install
npm run package

# build nemo-web
cd ../
git clone https://github.com/knowsys/nemo-web
cd nemo-web
mkdir nemoVSIX
cp ../nemo-vscode-extension/nemo-0.0.17.vsix nemoVSIX/nemo.vsix # update X.X.X if needed
cp -r ../nemo/nemo-wasm/nemoWASMBundler ./nemoWASMBundler

npm ci
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# npm run dev with static files created here
cd ../
cp -r nemo-web/dist ./dist-nemo
npm ci
npm run dev

# http://localhost:5173/dist-nemo/ for nemo-web
# http://localhost:5173/ for nev