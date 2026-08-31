'use client';
import { useState } from 'react';

export function MediaCoverActions({campaignId,mediaId,isPrimary}:{campaignId:string;mediaId:string;isPrimary:boolean}){
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  if(isPrimary)return <span className="cms-cover-state">Main image</span>;
  async function makeCover(){
    setBusy(true);setMessage('');
    const res=await fetch('/api/campaigns/media',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({campaignId,mediaId,action:'set_primary'})});
    const json=await res.json();
    if(!res.ok){setMessage(json.error||'Could not update cover image.');setBusy(false);return;}
    window.location.reload();
  }
  return <div className="cms-media-actions"><button type="button" className="button secondary small" disabled={busy} onClick={makeCover}>{busy?'Updating...':'Set as main image'}</button>{message&&<small>{message}</small>}</div>;
}
