// Lists the Buffer organizations and channels this API key can see, so you
// can check the agent will find your Instagram, Facebook and LinkedIn pages.
//   BUFFER_API_KEY=... npm run channels
import { listChannels, listOrganizations } from "./buffer.js";

for (const org of await listOrganizations()) {
  console.log(`Organization: ${org.name}  (BUFFER_ORG_ID=${org.id})`);
  for (const c of await listChannels(org.id)) {
    console.log(`  ${c.service.padEnd(10)} ${c.name.padEnd(32)} ${c.id}`);
  }
}
