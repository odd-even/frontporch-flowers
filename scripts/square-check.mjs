#!/usr/bin/env node
/**
 * Validate Square credentials for checkout (locations + payment link).
 *
 * Usage:
 *   node scripts/square-check.mjs
 *
 * Reads from .env.local:
 *   SQUARE_ACCESS_TOKEN=
 *   SQUARE_LOCATION_ID=
 *   SQUARE_ENVIRONMENT=production   # optional; defaults to production on Vercel prod
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { SquareClient, SquareEnvironment } from "square";

const ENV_PATH = resolve(process.cwd(), ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function resolveEnvironment(configured) {
  const raw = configured?.trim().toLowerCase();
  if (raw === "production" || raw === "prod") return SquareEnvironment.Production;
  if (raw === "sandbox") return SquareEnvironment.Sandbox;
  return SquareEnvironment.Production;
}

async function probe(environment, token, locationId) {
  const label =
    environment === SquareEnvironment.Production ? "production" : "sandbox";
  const client = new SquareClient({ token, environment });

  try {
    const status = await client.oAuth.retrieveTokenStatus();
    const scopes = status.scopes ?? [];
    console.log(`  [${label}] token status OK — scopes: ${scopes.join(", ") || "(none listed)"}`);
  } catch (error) {
    const detail = error.errors?.[0]?.detail || error.message || String(error);
    console.log(`  [${label}] token status FAILED — ${detail}`);
    return false;
  }

  try {
    const locations = await client.locations.list();
    const ids = (locations.locations ?? []).map((item) => item.id);
    console.log(`  [${label}] locations: ${ids.length ? ids.join(", ") : "(none)"}`);
    if (locationId && !ids.includes(locationId)) {
      console.log(
        `  [${label}] WARNING: SQUARE_LOCATION_ID ${locationId} not in this account`
      );
    }
  } catch (error) {
    const detail = error.errors?.[0]?.detail || error.message || String(error);
    console.log(`  [${label}] locations.list FAILED — ${detail}`);
    return false;
  }

  if (!locationId) {
    console.log(`  [${label}] skip payment link test — SQUARE_LOCATION_ID not set`);
    return true;
  }

  try {
    await client.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      description: "Front Porch Flowers credential check",
      order: {
        locationId,
        lineItems: [
          {
            name: "Credential check",
            quantity: "1",
            basePriceMoney: { amount: BigInt(100), currency: "CAD" },
          },
        ],
      },
      checkoutOptions: {
        allowTipping: false,
        askForShippingAddress: false,
      },
    });
    console.log(`  [${label}] paymentLinks.create OK`);
    return true;
  } catch (error) {
    const detail = error.errors?.[0]?.detail || error.message || String(error);
    console.log(`  [${label}] paymentLinks.create FAILED — ${detail}`);
    return false;
  }
}

const fileEnv = loadEnvFile(ENV_PATH);
const token = (process.env.SQUARE_ACCESS_TOKEN || fileEnv.SQUARE_ACCESS_TOKEN)?.trim();
const locationId = (
  process.env.SQUARE_LOCATION_ID || fileEnv.SQUARE_LOCATION_ID
)?.trim();
const configuredEnv = process.env.SQUARE_ENVIRONMENT || fileEnv.SQUARE_ENVIRONMENT;

if (!token) {
  console.error(
    "Missing SQUARE_ACCESS_TOKEN. Add it to .env.local or pass via environment."
  );
  console.error(
    "Square Developer Dashboard → your app → Credentials → Production → Access token"
  );
  process.exit(1);
}

console.log("Square credential check");
console.log(`Token prefix: ${token.slice(0, 8)}…`);
console.log(`Configured SQUARE_ENVIRONMENT: ${configuredEnv || "(not set)"}`);
console.log(`SQUARE_LOCATION_ID: ${locationId || "(not set)"}`);
console.log("");

const preferred = resolveEnvironment(configuredEnv);
const preferredOk = await probe(preferred, token, locationId);

if (!preferredOk && preferred === SquareEnvironment.Production) {
  console.log("");
  console.log("Trying sandbox in case credentials are sandbox tokens…");
  await probe(SquareEnvironment.Sandbox, token, locationId);
}

if (!preferredOk) {
  console.log("");
  console.error("Square checkout will not work until credentials are fixed.");
  console.error(
    "Use the Production access token (not Application secret) and matching location ID."
  );
  process.exit(1);
}

console.log("");
console.log("Square credentials look good for checkout.");
