# cs2.nordiccrypto.no

Static page for the Nordic Crypto CS2 testnet Nexa Vouchers server. Plugin source: https://gitlab.com/jQrgen/cs2-nexa-vouchers

Deployed to Cloudflare Pages project `cs2-nordiccrypto` with `wrangler pages deploy . --project-name cs2-nordiccrypto`.

Stats pages: `stats.html` (online players, leaderboards, server/map stats) and `player.html?id=<opaque id>` read the Worker endpoints `/players/online`, `/leaderboards`, `/players/{id}`, `/servers/stats` (cs2-nexa-vouchers MR !10). Names are escaped client-side; no Steam IDs are ever returned.
