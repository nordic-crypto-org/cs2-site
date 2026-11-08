// Stats pages for cs2.nordiccrypto.no. Everything from the API is escaped; player ids must be 16 hex chars.
(function () {
  const API = 'https://cs2-api.nordiccrypto.workers.dev';
  const SERVERS = { 'cs2-vouchers-1': 'Aim / AWP', 'cs2-gungame-1': 'Gun Game (Arms Race)' };
  const BOARDS = { kills: 'Kills', kd: 'K/D', hs: 'Headshot %', accuracy: 'Accuracy', wins: 'Wins', ggwins: 'Gun Game wins', playtime: 'Playtime', mvps: 'MVPs', damage: 'Damage', streak: 'Best streak', knife: 'Knife kills', headshots: 'Headshots' };
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isId = (id) => typeof id === 'string' && /^[0-9a-f]{16}$/.test(id);
  const who = (p) => (isId(p.id) ? '<a href="player.html?id=' + p.id + '">' + esc(p.name) + '</a>' : esc(p.name));
  const dur = (s) => { s = Number(s) || 0; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? h + ' h ' + m + ' min' : m + ' min'; };
  const num = (n) => esc(Number(n || 0).toLocaleString('en'));
  const ago = (t) => { const d = Math.max(0, Math.floor(Date.now() / 1000) - t); return d < 60 ? d + ' s ago' : d < 3600 ? Math.floor(d / 60) + ' min ago' : d < 86400 ? Math.floor(d / 3600) + ' h ago' : new Date(t * 1000).toLocaleDateString(); };
  const card = (v, label) => '<div class="card"><b>' + v + '</b><span>' + esc(label) + '</span></div>';
  async function j(path) { const r = await fetch(API + path, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return r.json(); }
  const $ = (id) => document.getElementById(id);

  async function online(el) {
    try {
      const o = await j('/players/online'); const sv = o.servers || {}; const ids = Object.keys(sv);
      $(el).innerHTML = ids.length ? ids.map((id) => '<h3>' + esc(SERVERS[id] || id) + ' <span class="muted">(' + sv[id].length + ')</span></h3><table><thead><tr><th>Player</th><th>Team</th><th class="n">Score</th><th class="n">K</th><th class="n">D</th><th class="n">Time</th></tr></thead><tbody>' +
        sv[id].map((p) => '<tr><td>' + who(p) + '</td><td>' + esc(p.team) + '</td><td class="n">' + num(p.score) + '</td><td class="n">' + num(p.kills) + '</td><td class="n">' + num(p.deaths) + '</td><td class="n">' + dur(p.seconds) + '</td></tr>').join('') + '</tbody></table>').join('')
        : '<p class="muted">Nobody is playing right now. <a href="./">Join a server →</a></p>';
    } catch (e) { $(el).innerHTML = '<p class="muted">Online list is unavailable right now.</p>'; }
  }

  async function leaderboards(tabsEl, bodyEl, totalsEl) {
    const tabs = $(tabsEl);
    tabs.innerHTML = Object.entries(BOARDS).map(([k, v]) => '<button data-by="' + k + '" aria-pressed="' + (k === 'kills') + '">' + esc(v) + '</button>').join('');
    async function load(by) {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.by === by)));
      try {
        const d = await j('/leaderboards?by=' + encodeURIComponent(by) + '&limit=50');
        const t = d.totals || {};
        if (totalsEl) $(totalsEl).innerHTML = card(num(t.players), 'players') + card(num(t.kills), 'kills') + card(num(t.headshots), 'headshots') + card(dur(t.seconds), 'played');
        const rows = d.players || [];
        $(bodyEl).innerHTML = rows.length ? rows.map((p) => '<tr><td>' + p.rank + '</td><td>' + who(p) + '</td><td class="n">' + num(p.kills) + '</td><td class="n">' + esc(p.kd) + '</td><td class="n">' + esc(p.hsPct) + '</td><td class="n">' + esc(p.accuracyPct) + '</td><td class="n">' + num(p.matchWins) + '</td><td class="n">' + num(p.gunGameWins) + '</td><td class="n">' + num(p.mvps) + '</td><td class="n">' + num(p.bestStreak) + '</td><td class="n">' + dur(p.playtimeSeconds) + '</td></tr>').join('')
          : '<tr><td colspan="11" class="muted">No players on this board yet.</td></tr>';
      } catch (e) { $(bodyEl).innerHTML = '<tr><td colspan="11" class="muted">Leaderboards are unavailable right now.</td></tr>'; }
    }
    tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) load(b.dataset.by); });
    load('kills');
  }

  async function servers(el, weaponsEl) {
    try {
      const d = await j('/servers/stats');
      $(el).innerHTML = (d.servers || []).map((s) => '<h3>' + esc(SERVERS[s.serverId] || s.serverId) + '</h3><div class="cards">' + card(esc(s.uptimePct7d) + ' %', 'uptime (7 days)') + card(num(s.peakPlayers7d), 'peak players (7 days)') + card(ago(s.lastSeen), 'last report') + '</div>' +
        '<div class="scroll"><table><thead><tr><th>Map</th><th>Mode</th><th class="n">Matches</th><th class="n">Kills</th><th class="n">Server time</th><th class="n">Player time</th></tr></thead><tbody>' +
        ((s.maps || []).map((m) => '<tr><td><code>' + esc(m.map) + '</code></td><td>' + esc(m.mode) + '</td><td class="n">' + num(m.matches) + '</td><td class="n">' + num(m.kills) + '</td><td class="n">' + dur(m.seconds) + '</td><td class="n">' + dur(m.playerSeconds) + '</td></tr>').join('') || '<tr><td colspan="6" class="muted">No maps yet.</td></tr>') + '</tbody></table></div>').join('') || '<p class="muted">No server stats yet.</p>';
      if (weaponsEl) $(weaponsEl).innerHTML = (d.weapons || []).map((w) => '<tr><td>' + esc(w.weapon) + '</td><td class="n">' + num(w.kills) + '</td></tr>').join('') || '<tr><td colspan="2" class="muted">No kills yet.</td></tr>';
    } catch (e) { $(el).innerHTML = '<p class="muted">Server stats are unavailable right now.</p>'; }
  }

  async function player(el) {
    const id = new URLSearchParams(location.search).get('id') || '';
    if (!isId(id)) { $(el).innerHTML = '<p>Player not found. <a href="stats.html">Back to leaderboards</a></p>'; return; }
    try {
      const d = await j('/players/' + id); const p = d.player;
      document.title = p.name + ' – Nordic Crypto CS2';
      document.querySelector('.hero h1').textContent = p.name;
      $(el).innerHTML = (d.onlineOn ? '<p><span class="dot on"></span>Playing now on <strong>' + esc(SERVERS[d.onlineOn] || d.onlineOn) + '</strong></p>' : '<p class="muted">Last seen ' + ago(p.lastSeen) + '</p>') +
        '<div class="cards">' + [
          [num(p.kills), 'kills'], [num(p.deaths), 'deaths'], [esc(p.kd), 'K/D'], [num(p.assists), 'assists'], [esc(p.hsPct) + ' %', 'headshots (' + p.headshots + ')'],
          [esc(p.accuracyPct) + ' %', 'accuracy'], [num(p.damage), 'damage'], [esc(p.adr), 'damage / round'], [num(p.mvps), 'MVPs'], [num(p.rounds), 'rounds'],
          [num(p.matches), 'matches'], [num(p.matchWins), 'wins (' + p.winPct + ' %)'], [num(p.gunGameWins), 'Gun Game wins'], [num(p.gunGameBestLevel), 'best Gun Game level'],
          [num(p.bestStreak), 'best kill streak'], [num(p.knifeKills), 'knife kills'], [dur(p.playtimeSeconds), 'played'], [num(d.vouchers.won) + ' / ' + num(d.vouchers.claimed), 'vouchers won / claimed'],
        ].map(([v, l]) => card(v, l)).join('') + '</div>' +
        '<h2>Weapons</h2><table><thead><tr><th>Weapon</th><th class="n">Kills</th></tr></thead><tbody>' + (d.weapons.map((w) => '<tr><td>' + esc(w.weapon) + '</td><td class="n">' + num(w.kills) + '</td></tr>').join('') || '<tr><td colspan="2" class="muted">No kills yet.</td></tr>') + '</tbody></table>' +
        '<h2>Maps</h2><table><thead><tr><th>Map</th><th class="n">Kills</th><th class="n">Time</th></tr></thead><tbody>' + (d.maps.map((m) => '<tr><td><code>' + esc(m.map) + '</code></td><td class="n">' + num(m.kills) + '</td><td class="n">' + dur(m.seconds) + '</td></tr>').join('') || '<tr><td colspan="3" class="muted">No maps yet.</td></tr>') + '</tbody></table>' +
        '<p class="muted">First seen ' + new Date(p.firstSeen * 1000).toLocaleDateString() + '. <a href="stats.html">All leaderboards →</a></p>';
    } catch (e) { $(el).innerHTML = '<p>Player not found or stats unavailable. <a href="stats.html">Back to leaderboards</a></p>'; }
  }

  window.NC = { online, leaderboards, servers, player };
})();
