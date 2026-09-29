'use client';

import { useEffect, useMemo, useState } from 'react';

export function CampaignShareTools({slug,title}:{slug:string;title:string}){
  const [url,setUrl]=useState('');
  const [copied,setCopied]=useState(false);
  const [snippetCopied,setSnippetCopied]=useState(false);
  useEffect(()=>{setUrl(`${window.location.origin}/campaigns/${slug}`)},[slug]);
  const qrUrl=useMemo(()=>url?`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(url)}`:'',[url]);

  async function share(){
    if(!url)return;
    if(navigator.share){
      try{await navigator.share({title,text:`Support ${title} on Good Cause`,url});return;}catch{}
    }
    await copy();
  }
  const snippet=url?`<a href="${url}" target="_blank" rel="noopener">Support this cause on Good Cause – online fundraising in New Zealand</a>`:'';
  async function copySnippet(){try{await navigator.clipboard.writeText(snippet);setSnippetCopied(true);setTimeout(()=>setSnippetCopied(false),1800);}catch{}}
  async function copy(){
    if(!url)return;
    try{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{}
  }

  return <div className="campaign-share-tools">
    <div className="campaign-share-actions"><button type="button" className="button secondary small" onClick={share}>Share campaign</button><button type="button" className="button secondary small" onClick={copy}>{copied?'Link copied':'Copy link'}</button>{url&&<a className="button secondary small" href={`https://wa.me/?text=${encodeURIComponent(`Support ${title} on Good Cause: ${url}`)}`} target="_blank" rel="noopener">WhatsApp</a>}{url&&<a className="button secondary small" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener">Facebook</a>}</div>
    {qrUrl&&<details className="campaign-qr"><summary>Grab a QR code for this campaign</summary><div><img src={qrUrl} alt={`QR code for ${title}`}/><p className="fineprint">Scan to open this public Good Cause campaign page.</p></div></details>}
    {snippet&&<details className="campaign-qr"><summary>Add a link to your website or newsletter</summary><div><textarea readOnly value={snippet} rows={3} style={{width:'100%',fontSize:13}} onFocus={e=>e.currentTarget.select()}/><button type="button" className="button secondary small" onClick={copySnippet}>{snippetCopied?'Copied':'Copy HTML'}</button><p className="fineprint">Paste this into your school, club, church or business website so supporters can find the fundraiser.</p></div></details>}
  </div>;
}
