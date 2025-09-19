# Nemo Explain Visualizer (nev)

*nev* is a web-based visualization tool for interactive tree-based querying and inspection of datalog reasoning traces computed by [*Nemo*](https://github.com/knowsys/nemo). 

## *nev* online

You can access nev at the [live version of Nemo](https://tools.iccl.inf.tu-dresden.de/nemo/next) that you can try in your browser. **NOTE:** this site is unstable for now! <br>
It uses the [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) to communicate across browser tabs with Nemo. <br>

To use it, compute the results, then click the magnifying glass on any computed fact to open nev in a new browser tab. From there, you can inspect the trace of the computation of the selected fact, or edit the query by modying the tree structure. 

## Installation

We provide a [Dockerfile](Dockerfile) that fetches [*nemo*](https://github.com/knowsys/nemo), [*nemo-web*](https://github.com/knowsys/nemo-web), and [nemo's language server (.vsix)](https://github.com/knowsys/nemo-vscode-extension) from the respective repositories, then builds them along *nev* as static files, to ultimately serve them on a simple *nginx* web server. <br>

To use it, install [Docker](https://www.docker.com/) and [Node.js](https://nodejs.org/en). With Docker's daemon running, you can run: `npm i` and `npm run docker`, which you can then access at [localhost:8000/nemo/](localhost:8000/nemo/)` <br>

Alternatively, you can follow along nemo's local installation instructions, then move the static files to the root of this repository and use `npm i`and `npm run dev` to develop locally. 

## Help

The user guide is currently under construction! <br>
Feel free to use [GitHub discussions](https://github.com/imldresden/nev/discussions) to ask questions or talk about nev. [Bug reports](https://github.com/imldresden/nev/issues) are also very welcome.

## License

This project is licensed under either of
- Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or
  https://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or
  https://opensource.org/licenses/MIT)

at your option.

## Contributing

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in *nev* by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

## Acknowledgements

*nev* is developed by the [Interactive Media Lab Dresden](https://imld.de/) in collaboration with the [Knowledge-Based Systems](https://kbs.inf.tu-dresden.de/) group, both at [TU Dresden](https://tu-dresden.de). Its user interface design is inspired by [*pev2*](https://github.com/dalibo/pev2). Check out the contributors to [nev](https://github.com/imldresden/nev/graphs/contributors) and [nemo](https://github.com/knowsys/nemo/graphs/contributors). 

#
*Made with ❤️ in [Dresden](https://www.dresden.de).*