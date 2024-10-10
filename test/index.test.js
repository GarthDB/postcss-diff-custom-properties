import test from "ava";
import postcss from "postcss";
import diffCustomProperties from "../index.js";
import { readFile } from "fs/promises";
import * as url from "url";
import { resolve } from "path";

export const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

test("generate report of differences between CSS custom properties sets", async (t) => {
  t.plan(1);
  const [baseCSS, newCSS] = await Promise.all([
    postcss.parse(
      await readFile(resolve(__dirname, "fixtures", "base.css"), "utf8"),
    ),
    postcss.parse(
      await readFile(resolve(__dirname, "fixtures", "new.css"), "utf8"),
    ),
  ]);
  await postcss([
    diffCustomProperties({
      baseCSS: baseCSS,
      newCSS: newCSS,
      outputReport: (diff) => {
        t.snapshot(diff);
      },
    }),
  ])
    .process(newCSS, { from: resolve(__dirname, "fixtures", "new.css") })
    .then((result) => {
      console.log("Diff report generated.");
    })
    .catch((error) => {
      console.error(error);
    });
});
