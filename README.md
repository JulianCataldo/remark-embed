# `remark-embed`

[![NPM](https://img.shields.io/npm/v/remark-embed)](https://www.npmjs.com/package/remark-embed)
[![ISC License](https://img.shields.io/npm/l/remark-embed)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)  
[![unified](https://img.shields.io/badge/uni-fied-0366d6?logo=markdown)](https://unifiedjs.com)  
[![TypeScript](https://img.shields.io/badge/TypeScript-333333.svg?logo=typescript)](http://www.typescriptlang.org/)
[![Prettier](https://img.shields.io/badge/Prettier-333333.svg?logo=prettier)](https://prettier.io)
[![EditorConfig](https://img.shields.io/badge/EditorConfig-333333.svg?logo=editorconfig)](https://editorconfig.org)
[![ESLint](https://img.shields.io/badge/ESLint-3A33D1?logo=eslint)](https://eslint.org)

<!-- [![Downloads](https://img.shields.io/npm/dw/remark-embed)](https://www.npmjs.com/package/remark-embed)   -->
<!-- [![Renovate](https://img.shields.io/badge/Renovate-enabled-17a2b8?logo=renovatebot)](https://app.renovatebot.com/dashboard) -->

Embed local or remote files as plain text or nodes tree.

`<!-- embed:http://myremote.stuff/file.md -->`  
`<!-- embed:../../../some-parent-dir/file.md -->`

> **Warning**: Work-in-progress  
> Basic features below are working well, but more tests in different contexts are required.
> Also, more features are to be added.

## Features

- **Remote** URL Markdown embed.
- **Local** file Markdown embed.

`remark-embed` injects living AST into current pipeline node tree.  
That means all of your further transformations affect these embedded trees, too.

> **Note**: There is a special option for Astro which doesn't seems to apply its `remark-gfm`, whereas all other remark plugin are working fine. _Needs more investigation_.

## Installation

```sh
pnpm i remark-embed
```

Inside a **unified** pipeline:

```js
import remarkEmbed from 'remark-embed';

/* … */
  .use(remarkEmbed, { logLevel: 'info' })
/* … */
```

_-Or-_ in an **Astro** configuration:

```js
import remarkEmbed, { Settings as RemarkEmbedSettings } from 'remark-embed';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  /* … */
  markdown: {
    remarkPlugins: [
      [remarkEmbed, { logLevel: 'info' } as RemarkEmbedSettings],

      // You need to include GFM again, as using a custom remark plugin list
      // with Astro will discard its internal GFM plugin.
      remarkGfm,
    ],
  },
  /* … */
});
```

> **Warning** 1: You need a Node.js version which support the native `fetch` API.

> **Warning** 2: It's not tested with MDX yet.

Package is **100% ESM**, including dependencies.

## Usage

In your Markdown file, just drop an `<!-- embed:./<file>.md -->`:

```markdown
…**My Markdown**…

# Remote Mardown file

<!-- embed:https://raw.githubusercontent.com/JulianCataldo/JulianCataldo/master/README.md -->

> Job is done

# Local Mardown file

<!-- embed:../../../README.md -->

> Job is done
```

## Use cases

Collect:

- **Remotely hosted** MD's for when it's not practical to gather them locally.
- **Local** READMEs in a mono-repo. for a documentation website to use.

Regarding **local** embeds, why not just use relative paths for local MD outside current project, instead of embedding it?

Reasons are:

- Having everything in the current working directory.
- Some bundler doesn't like importing stuff from outer directory.
- Not having to deal with symbolic links, which are sometimes unpredictable.
- Re-compose / selectively embedded Markdowns file or parts depending on context.

> **Warning**: Security concerns.
> Use this plugin at your own risk.  
> **You should trust your sources**.

## Demos

https://user-images.githubusercontent.com/603498/191607897-3fe0f1ac-56ea-459a-ac2d-d833ecff0edd.mp4

---

https://user-images.githubusercontent.com/603498/191610234-af1d8db0-02b5-4b78-9d17-ffef1a799da1.mp4

## Interface

```ts
export interface Settings {
  /**
   * Load GitHub flavored Markdown again (useful for Astro).
   *
   * **Default**: `true`
   */
  useGfm?: boolean;
  /**
   * **Default**: `silent`
   */
  logLevel?: 'silent' | 'info' | 'debug';
  /**
   * For remote files.
   *
   * **Default**: `true`
   */
  useCache?: boolean;
}
```

## Features ideas

It might be useful to:

- Embed **arbitrary files as plain text**, without AST transformation. E.g. for code snippets in fences.
- Target specific lines range with **hash** `embed:../foo.md#L22-L45`.
- Target a specific CSS ID (maybe classes?) to embed: `embed:../foo.md#main`.

## Similar / inspired by:

- [gridsome-remark-embed-snippet](https://github.com/sammndhr/gridsome-remark-embed-snippet/blob/master/index.js)
- [gatsby/gatsby-remark-embed-snippet](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-remark-embed-snippet/src/index.js)
- [gatsby-remark-embed-markdown](https://github.com/jtstodola/gatsby-remark-embed-markdown/blob/gatsby-remark-embed-markdown/index.js)
- [markdown-magic](https://github.com/DavidWells/markdown-magic)

---

Related projects:

- [retext-case-police](https://github.com/JulianCataldo/retext-case-police): Check popular names casing. Example: ⚠️ `github` → ✅ `GitHub`
- [remark-lint-frontmatter-schema](https://github.com/JulianCataldo/remark-lint-frontmatter-schema): Validate your Markdown frontmatter data against a JSON schema.
- [astro-content](https://github.com/JulianCataldo/astro-content): A text based, structured content manager, for edition and consumption.

---

🔗  [JulianCataldo.com](https://www.juliancataldo.com)
