import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
if (existsSync('.env')) {
  console.log('Existing .env preserved.');
  process.exit(0);
}
const secret = () => randomBytes(32).toString('hex');
const db = secret(),
  storage = secret(),
  password = secret();
let env = readFileSync('.env.example', 'utf8')
  .replaceAll('change-me-to-a-long-random-value', storage)
  .replaceAll('change-me', db)
  .replace('replace-with-at-least-48-random-characters-before-use', secret())
  .replace('replace-with-a-strong-unique-password', password);
writeFileSync('.env', env, { mode: 0o600 });
for (const app of ['web', 'admin']) {
  mkdirSync(`apps/${app}`, { recursive: true });
  writeFileSync(
    `apps/${app}/.env.local`,
    app === 'web'
      ? env
          .split('\n')
          .filter((l) => /^(NEXT_PUBLIC_|API_INTERNAL_URL)/.test(l))
          .join('\n')
      : 'VITE_API_URL=http://localhost:4100\n',
    { mode: 0o600 },
  );
}
console.log('Local secrets generated in .env. ADMIN_EMAIL and ADMIN_PASSWORD are available there.');
