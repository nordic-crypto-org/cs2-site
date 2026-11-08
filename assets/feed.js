// Live feed from https://cs2-api.nordiccrypto.workers.dev/feed (names are in-game names; no Steam IDs or IPs).
(()=>{
  const API='https://cs2-api.nordiccrypto.workers.dev';
  const NAMES=Object.fromEntries(Object.entries(window.NC_SERVERS||{}).map(([id,s])=>[id,s.short||s.name]));
  const list=document.getElementById('feed'),tabs=document.getElementById('feed-tabs');
  if(!list)return;
  if(tabs)tabs.querySelectorAll('button[data-server]').forEach(b=>{const s=(window.NC_SERVERS||{})[b.dataset.server];if(s){b.textContent=s.short||s.name;b.title=s.name}});
  const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const who=(n,team)=>'<b class="'+(team==='CT'||team==='T'?team:'')+'">'+esc(n||'Player')+'</b>';
  const line=e=>{switch(e.type){
    case'kill':return e.a?who(e.a,e.ateam)+' killed '+who(e.v,e.vteam)+' with '+esc(e.w||'?')+(e.hs?' <span class="hs">(headshot)</span>':''):who(e.v,e.vteam)+' died';
    case'round':return'Round won by <b class="'+esc(e.win)+'">'+esc(e.win||'?')+'</b>'+(e.ct!=null?' · CT '+esc(e.ct)+' – '+esc(e.t)+' T':'');
    case'match_end':return'Match over'+(e.a?' · top player '+who(e.a):'');
    case'armsrace_win':return who(e.a)+' won Arms Race 🔪';
    case'map':return'Map changed to <code>'+esc(e.map)+'</code>'+(e.item?' ('+esc(e.item)+')':'');
    case'join':return who(e.a)+' joined · '+esc(e.n)+' online';
    case'leave':return who(e.a)+' left · '+esc(e.n)+' online';
    case'voucher':return who(e.a)+' '+(e.win==='redeemed'?'redeemed a ':'won a ')+esc(e.item)+' voucher 🎉'+(e.win==='pending'?' (link a wallet to claim)':e.win==='redeemed'?' — redeemed ✅':'');
    default:return null}};
  let filter='',since=0,items=[];
  const time=t=>new Date(t*1000).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  function render(){
    const rows=items.filter(e=>!filter||e.serverId===filter).slice(-60).reverse().map(e=>{const l=line(e);return l?'<li><time>'+time(e.at)+'</time><span class="srv">'+esc(NAMES[e.serverId]||e.serverId)+'</span><span>'+l+'</span></li>':''}).join('');
    list.innerHTML=rows||'<li class="muted">No events yet. Join a server and get the feed going!</li>';
  }
  async function poll(){
    try{const r=await fetch(API+'/feed?since='+since,{cache:'no-store'});if(!r.ok)throw 0;const d=await r.json();
      for(const e of d.events||[]){items.push(e);since=Math.max(since,e.id)}
      items=items.slice(-200);render();
    }catch(_){if(!items.length)list.innerHTML='<li class="muted">Live feed is unavailable right now.</li>'}
  }
  tabs&&tabs.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;filter=b.dataset.server;tabs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render()});
  poll();setInterval(()=>{if(!document.hidden)poll()},4000);
})();
