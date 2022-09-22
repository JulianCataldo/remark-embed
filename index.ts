/* ——————————————————————————————————————————————————————————————————————————— *
 *              © Julian Cataldo — https://www.juliancataldo.com.              *
 *                      See LICENSE in the project root.                       *
/* —————————————————————————————————————————————————————————————————————————— */

import fs from 'node:fs/promises';
import path from 'node:path';
import { withCache, isCached } from 'ultrafetch';
/* ·········································································· */
import { visit } from 'unist-util-visit';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { unified } from 'unified';
import type { Plugin } from 'unified';
import type { HTML, Parent, Root } from 'mdast';
/* —————————————————————————————————————————————————————————————————————————— */
const fetchWithCache = withCache(fetch);
/* ·········································································· */

export interface Settings {
  /**
   * Load GitHub flavored Markdown again (useful for Astro).
   *
   * **Default**: `true`
   */
  useGfm?: boolean;
  /**
   * Log Level
   *
   * **Default**: `silent`
   */
  logLevel?: 'silent' | 'info' | 'debug';
}
const remarkEmbed: Plugin<[Settings?], Root> =
  (settings) => async (ast, vFile) => {
    let useGfm = false;
    if (typeof settings?.useGfm === 'boolean') {
      useGfm = settings.useGfm;
    }
    let logLevel = 'silent';
    if (typeof settings?.logLevel === 'string') {
      logLevel = settings.logLevel;
    }

    const embedNodes: HTML[] = [];

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
            remoteMd = await fetchWithCache(filePath)
              .then(async (r) => {
                if (['info', 'debug'].includes(logLevel)) {
                  if (isCached(r)) {
                    console.log(`Loading ${filePath} from cache`);
                  } else {
                    console.log(`Fetching ${filePath}`);
                  }
                }
                return r.text().then((t) => t);
              })
              .catch(() => {
                if (['info', 'debug'].includes(logLevel)) {
                  console.log(`Could not fetch ${filePath}`);
                }
                return null;
              });
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
