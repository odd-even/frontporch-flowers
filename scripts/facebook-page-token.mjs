#!/usr/bin/env node
/**
 * Exchange a short-lived Facebook User token for a never-expiring Page token.
 *
 * Usage:
 *   node scripts/facebook-page-token.mjs <short-lived-user-token>
 *
 * Requires in .env.local:
 *   FACEBOOK_APP_ID=
 *   FACEBOOK_APP_SECRET=
 *
 * Writes FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID into .env.local.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const GRAPH = "https://graph.facebook.com/v21.0";
const PAGE_HINT = "front porch flowers";
const ENV_PATH = resolve(process.cwd(), ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    values[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return values;
}

function upsertEnv(path, updates) {
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const lines = existing ? existing.split("\n") : [];
  const keys = new Set(Object.keys(updates));

  const next = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return line;
    const key = trimmed.slice(0, eq);
    if (!keys.has(key)) return line;
    keys.delete(key);
    return `${key}=${updates[key]}`;
  });

  for (const key of keys) {
    if (next.length && next[next.length - 1] !== "") next.push("");
    next.push(`${key}=${updates[key]}`);
  }

  writeFileSync(path, `${next.join("\n").replace(/\n*$/, "\n")}`);
}

async function graphJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return data;
}

async function main() {
  const env = { ...loadEnvFile(ENV_PATH), ...process.env };
  const shortToken = process.argv[2] || env.FACEBOOK_USER_ACCESS_TOKEN;
  const appId = env.FACEBOOK_APP_ID;
  const appSecret = env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    console.error(
      "Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET in .env.local\n" +
        "Get them from Meta App → Settings → Basic"
    );
    process.exit(1);
  }

  if (!shortToken) {
    console.error(
      "Usage: node scripts/facebook-page-token.mjs <short-lived-user-token>\n" +
        "Create the token in Graph API Explorer with pages_show_list + pages_read_engagement"
    );
    process.exit(1);
  }

  console.log("1/3 Exchanging for a long-lived user token…");
  const exchanged = await graphJson(
    `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token` +
      `&client_id=${encodeURIComponent(appId)}` +
      `&client_secret=${encodeURIComponent(appSecret)}` +
      `&fb_exchange_token=${encodeURIComponent(shortToken)}`
  );
  const longUserToken = exchanged.access_token;

  console.log("2/3 Loading managed Pages…");
  const accounts = await graphJson(
    `${GRAPH}/me/accounts?fields=id,name,access_token&limit=100` +
      `&access_token=${encodeURIComponent(longUserToken)}`
  );
  let pages = accounts.data || [];

  // Newer Meta login flows may leave /me/accounts empty but still grant
  // a specific Page via granular_scopes. Fall back to that Page ID.
  if (!pages.length) {
    const debugUser = await graphJson(
      `${GRAPH}/debug_token?input_token=${encodeURIComponent(longUserToken)}` +
        `&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`
    );
    const pageIds = [
      ...new Set(
        (debugUser.data?.granular_scopes || [])
          .flatMap((scope) => scope.target_ids || [])
          .filter(Boolean)
      ),
    ];
    for (const pageId of pageIds) {
      try {
        const pageInfo = await graphJson(
          `${GRAPH}/${pageId}?fields=id,name,access_token` +
            `&access_token=${encodeURIComponent(longUserToken)}`
        );
        if (pageInfo.access_token) pages.push(pageInfo);
      } catch {
        // skip pages that cannot be loaded with this token
      }
    }
  }

  if (!pages.length) {
    throw new Error(
      "No Pages returned. Grant pages_show_list + pages_read_engagement for Front Porch Flowers (enable both under Use cases → Customize first)."
    );
  }

  const page =
    pages.find((p) => p.name?.toLowerCase().includes(PAGE_HINT)) || pages[0];

  console.log(`   Using Page: ${page.name} (${page.id})`);

  console.log("3/3 Checking token expiry…");
  const debug = await graphJson(
    `${GRAPH}/debug_token?input_token=${encodeURIComponent(page.access_token)}` +
      `&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`
  );
  const expiresAt = debug.data?.expires_at;
  const neverExpires = expiresAt === 0 || expiresAt === null || expiresAt === undefined;

  upsertEnv(ENV_PATH, {
    FACEBOOK_PAGE_ACCESS_TOKEN: page.access_token,
    FACEBOOK_PAGE_ID: page.id,
  });

  console.log("\nSaved to .env.local:");
  console.log(`  FACEBOOK_PAGE_ID=${page.id}`);
  console.log(`  FACEBOOK_PAGE_ACCESS_TOKEN=<redacted>`);
  console.log(
    neverExpires
      ? "\nToken does not expire (until revoked / password change / app deleted)."
      : `\nToken expires at unix ${expiresAt}. Re-run this script before then.`
  );
  console.log("\nRestart npm run dev, then check the homepage Facebook section.");
}

main().catch((error) => {
  console.error("\nFailed:", error.message || error);
  process.exit(1);
});
