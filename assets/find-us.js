// Footer "Find us on" list, shared by every page.
// Add an object to this array to extend the list everywhere this script is included.
// href: link, opened in a new tab. Omit href for a plain-text note (label, optionally ": " + text).
// group: optional prefix, e.g. "Community".
// Never put a server IP or a Steam ID in label, text, or group. An IP may appear only inside href.
(()=>{
  const LISTINGS=[
    {label:'Supercraft',href:'https://supercraft.host/servers/cs2/?sort=newest'},
    {label:'CS2ServerList (Aim/AWP)',href:'https://www.cs2serverlist.com/server/2.29.154.63:27015'},
    {label:'CS2ServerList (Gun Game)',href:'https://www.cs2serverlist.com/server/2.29.154.63:27025'},
    {label:'XCSTRIKE Aim/AWP',href:'https://xcstrike.com/server/1009-nordic-crypto-aimawp-1v1-eu'},
    {label:'XCSTRIKE Gun Game',href:'https://xcstrike.com/server/1010-nordic-crypto-gun-game-eu'},
    {label:'Derax.gg Aim/AWP',href:'https://derax.gg/cs2/e03ca19b-20f4-4ca4-a476-ee49bd2335f1'},
    {label:'Derax.gg Gun Game',href:'https://derax.gg/cs2/640d213b-4041-45ff-ab8c-b4d689c5cd3d'},
    {label:'ServerTilt Aim/AWP',href:'https://www.servertilt.com/counter-strike-2-servers/nordic-crypto-aim-awp-finland-helsinki-testnet-vouchers'},
    {label:'ServerTilt Gun Game',href:'https://www.servertilt.com/counter-strike-2-servers/nordic-crypto-gun-game-finland-helsinki-testnet-vouchers'},
    {label:'GameTracker Aim/AWP',href:'https://www.gametracker.com/server_info/2.29.154.63:27015/'},
    {label:'GameTracker Gun Game',href:'https://www.gametracker.com/server_info/2.29.154.63:27025/'},
    {label:'Steam server browser',text:'search "Nordic Crypto"'},
    {label:'Nordic Crypto Telegram',href:'https://t.me/nordiccryptochat',group:'Community'},
  ];
  const wrap=document.querySelector('footer .wrap');
  if(!wrap||document.getElementById('find-us'))return;
  // Visible fields only. A server IP may stay inside href; it is never printed as text.
  const secret=/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?|STEAM_[0-5]:\d+:\d+|7656119\d{10}|\[U:1:\d+\]/g;
  const pub=t=>String(t??'').replace(secret,'').replace(/\s{2,}/g,' ').trim();
  const escHtml=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const esc=t=>escHtml(pub(t));
  const safeUrl=href=>{try{const u=new URL(href);return (u.protocol==='https:'||u.protocol==='http:')?u.href:''}catch(e){return ''}};
  let prev='';
  const items=LISTINGS.map(item=>{
    const group=item.group||'';
    const start=group&&group!==prev;
    prev=group;
    const href=item.href?safeUrl(item.href):'';
    const body=href
      ?'<a href="'+escHtml(href)+'" target="_blank" rel="noopener">'+esc(item.label)+'</a>'
      :esc(item.label)+(item.text?': '+esc(item.text):'');
    return '<li'+(start?' class="group"':'')+'>'+(group?esc(group)+': ':'')+body+'</li>';
  }).join('');
  const nav=document.createElement('nav');
  nav.className='find-us';
  nav.setAttribute('aria-label','Find us on');
  nav.innerHTML='<h2>Find us on</h2><ul id="find-us">'+items+'</ul>';
  wrap.insertBefore(nav,wrap.firstChild);
})();
