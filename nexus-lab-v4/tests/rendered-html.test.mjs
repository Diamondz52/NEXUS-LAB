import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the NEXUS LAB home experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>NEXUS LAB — Your Digital Playground/);
  assert.match(html, /NEXUS LAB \/\/ CREATIVE DEVELOPMENT SYSTEM/);
  assert.match(html, /BUILD FOR/);
  assert.match(html, /EVERY SCREEN/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-label="Device preview"/);
  assert.match(html, /CONTAINER QUERIES \/ ACTIVE/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("keeps the v4 responsive and Code Lab controls in source", async () => {
  const [home, code, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/components/HomeClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/CodeLabClient.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"version": "4\.0\.0"/);
  assert.match(home, /desktop:\{label:"DESKTOP",width:1440/);
  assert.match(home, /tablet:\{label:"TABLET",width:768/);
  assert.match(home, /mobile:\{label:"MOBILE",width:390/);
  assert.match(home, /aria-selected=\{deviceMode===mode\}/);
  assert.match(styles, /container-name:nexus-preview/);
  assert.match(styles, /@container nexus-preview \(max-width:900px\)/);
  assert.match(styles, /@container nexus-preview \(max-width:520px\)/);
  assert.match(code, /LAPTOP:\[1366,768\]/);
  assert.match(code, />CUSTOM</);
  assert.match(code, /pointercancel/);
});
