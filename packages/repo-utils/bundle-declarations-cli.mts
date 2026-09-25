#!/usr/bin/env -S pnpm tsx

import { bundleDeclarations, parseArguments } from "./bundle-declarations.mts";

await bundleDeclarations(parseArguments(process.argv.slice(2)));
