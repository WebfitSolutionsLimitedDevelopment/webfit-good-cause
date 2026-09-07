'use client';

import { useEffect, useMemo, useState } from 'react';

export function CampaignShareTools({slug,title}:{slug:string;title:string}){
  const [url,setUrl]=useState('');
  const [copied,setCopied]=useState(false);
  useEffect(()=>{setUrl(`${window.location.origin}/campaigns/${slug}`)},[slug]);
  const qrUrl=useMemo(()=>url?`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(url)}`:'',[url]);

  async function share(){
    if(!url)return;
    if(navigator.share){
      try{await navigator.share({title,text:`Support ${title} on Good Cause`,url});return;}catch{}
    }
    await copy();
  }
  async function copy(){
    if(!url)return;
    try{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{}
  }

  return <div className="campaign-share-tools">
    <div className="campaign-share-actions"><button type="button" className="button secondary small" onClick={share}>Share campaign</button><button type="button" className="button secondary small" onClick={copy}>{copied?'Link copied':'Copy link'}</button></div>
    {qrUrl&&<details className="campaign-qr"><summary>Grab a QR code for this campaign</summary><div><img src={qrUrl} alt={`QR code for ${title}`}/><p className="fineprint">Scan to open this public Good Cause campaign page.</p></div></details>}
  </div>;
}
