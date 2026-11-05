# Native image dependency licences

This record separates the image-library licence finding from the patched image-library security advisories. It describes the current dependency graph and distribution evidence; it does not change any upstream licence.

## Components

The reviewed dependency change (`6b91609`) installs Next.js 16.4.5, whose optional dependency is sharp 0.35.5. Sharp's JavaScript/API code is Apache-2.0, while its native bundles include LGPL libraries. The lockfile includes `@img/sharp-libvips-*` 1.3.4 for ten macOS/Linux targets and the LGPL-containing Windows/WebAssembly variants. An optional package in a cross-platform lockfile is not evidence that its binary ships on every target. Package managers select binaries for the installation platform.

Upstream sources and notices:

- [sharp 0.35.5 source and licence](https://github.com/lovell/sharp/tree/v0.35.5).
- [sharp-libvips 1.3.4 release](https://github.com/lovell/sharp-libvips/releases/tag/v1.3.4) and [packaging/build scripts](https://github.com/lovell/sharp-libvips). These describe the prebuilt shared libraries; the Windows/WebAssembly layouts differ from the Unix shared-library layout.
- [Native third-party notices](https://github.com/lovell/sharp-libvips/blob/main/THIRD-PARTY-NOTICES.md), identifying LGPL-covered components such as libvips, GLib, libheif, librsvg and Pango. Preserve the notices from the exact packages used in each release, not only this moving upstream reference.
- [LGPLv3 licence](https://www.gnu.org/licenses/lgpl-3.0.html), especially section 4, and its incorporated [GPLv3 terms](https://www.gnu.org/licenses/gpl-3.0.html). The [GCC project's verbatim LGPLv3 copy](https://github.com/gcc-mirror/gcc/blob/master/COPYING3.LIB) is another source for the same text.

The LGPL permits commercial use and permits an application to have its own terms when the applicable conditions are met. It does not impose a blanket non-commercial restriction or automatically require publication of the entire application. Distribution of covered native code still has notice, source and replacement/relinking obligations.

## What the current web build delivers

Inspection of the existing build at the reviewed dependency head found sharp's native `.node` binary in `.next/next-server.js.nft.json`. The `.next/next-minimal-server.js.nft.json` trace did not contain it. No `.node`, `.dll`, `.dylib`, `.so` or `.wasm` files were present in `.next/static` or `public`. Current `next/image` uses in the marketplace and public-profile pages specify `unoptimized`; the opening artwork is also served unoptimized.

Thus the inspected browser assets do not convey the native image libraries. Hosting the server and sending pages/images to a browser is distinct from giving someone a server bundle, native application or container containing those libraries. The repository's release/deployment API records were empty when checked on 2026-11-05, and no binary-publication workflow was found. This is evidence about the inspected repository and build, not a claim about every external copy or future deployment.

## When distributing a server bundle, image or native package

For each actual target artifact:

1. Inventory the native packages and their exact versions, hashes and platform. Preserve package copyright/licence files, native third-party notices, and the applicable GPL/LGPL texts in the delivered artifact; include a prominent notice that it uses those libraries. Do not strip these files during tracing or image minimization.
2. Provide the corresponding source for the covered libraries, including modifications and build material required by their licences, using a distribution method allowed by the applicable GPLv3 section 6 terms. Record the exact source versions/build scripts and how recipients obtain them. A moving repository URL alone is not a completed corresponding-source delivery.
3. Preserve recipients' ability to modify the covered libraries and reverse-engineer the combined work to debug those modifications. For LGPLv3 section 4(d), use a suitable mechanism that works with an interface-compatible replacement library, or provide the corresponding application code/material needed to recombine or relink it. Do not assume that every platform's prebuilt bundle satisfies the shared-library option; a statically combined Windows/Wasm artifact needs its own recombination evidence.
4. Include installation information where the licence requires it. Keep artifact-specific evidence of the notices, source delivery and replacement/relink procedure with the release.

No such native redistribution artifact is created by this documentation change. Recheck the actual delivered files if the app starts publishing containers, standalone server archives, desktop bundles or browser Wasm. Keep the patched library versions; a licence notice is not a reason to restore a vulnerable version or remove its notices.
