/* ——————————————————————————————————————————————————————————————————————————— *
 *              © Julian Cataldo — https://www.juliancataldo.com.              *
 *                      See LICENSE in the project root.                       *
/* —————————————————————————————————————————————————————————————————————————— */

import fs from 'node:fs/promises';
import path from 'node:path';
/* ·········································································· */
import { visit } from 'unist-util-visit';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { unified } from 'unified';
import type { Plugin } from 'unified';
import type { HTML, Parent, Root } from 'mdast';
/* —————————————————————————————————————————————————————————————————————————— */

export interface Settings {
  /** Load GitHub flavored Markdown again (useful for Astro).
   *
   * **Default**: `true`
   */
  useGfm?: boolean;
}
const remarkEmbed: Plugin<[Settings?], Root> =
  (settings) => async (ast, vFile) => {
    const embedNodes: HTML[] = [];

    let useGfm = false;
    if (typeof settings?.useGfm === 'boolean') {
      useGfm = settings.useGfm;
    }

    visit(ast, 'html', (node) => {
      if (node.value.includes(`<!-- embed:`)) {
        embedNodes.push(node);
      }
    });

    if (embedNodes.length > 0) {
      await Promise.all(
        embedNodes.map(async (embedNode) => {
          const start = embedNode.value.indexOf('<!-- embed:') + 11;
          const end = embedNode.value.indexOf(' -->');
          const filePath = embedNode.value.substring(start, end);

          let remoteMd: string | null;

          const isUrl =
            filePath.startsWith('http://') || filePath.startsWith('https://');

          if (isUrl) {
            remoteMd = await fetch(filePath).then(async (r) =>
              r.text().then((t) => t),
            );
          } else {
            /* Local file */
            // TODO: Test with absolute paths
            const currentVFileDir = path.dirname(vFile.history[0]);
            const src = path.join(currentVFileDir, filePath);

            remoteMd = await fs
              .readFile(src, 'utf8')
              .then((f) => String(f))
              .catch(() => '<!-- File not found -->');
          }

          if (remoteMd) {
            const embeddedTree = unified()
              .use(remarkParse)
              // NOTE: GFM is not supposed to be used here,
              // but it doesn't take effect in the main Astro pipeline,
              // despite other plugins working fine
              .use(useGfm ? remarkGfm : () => () => {})
              .parse(remoteMd);

            // FIXME: Find a typesafe way to convert Node
            // Hint: https://github.com/syntax-tree/unist-util-visit/issues/12
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // eslint-disable-next-line no-param-reassign
            delete embedNode.value;
            const newNode = embedNode as unknown as Parent;
            newNode.type = 'parent';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            newNode.children = embeddedTree.children;
          }
        }),
      );
    }
  };

export default remarkEmbed;
