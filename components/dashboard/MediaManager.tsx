'use client';
import { FormEvent,useState } from 'react';

export function MediaManager({campaignId}:{campaignId:string}){
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage('');
    const form=e.currentTarget;const data=new FormData(form);data.set('campaignId',campaignId);
    const res=await fetch('/api/campaigns/media',{method:'POST',body:data});const json=await res.json();
    setMessage(json.error||'Media submitted for admin approval.');if(res.ok)form.reset();setBusy(false);
  }
  return <form className="card manage-card media-manager" onSubmit={submit}><h3>Add campaign media</h3><p className="muted">Images, video links and news/article links are reviewed before they appear publicly.</p><label>Type<select name="kind" defaultValue="image"><option value="image">Image upload</option><option value="video">Video link</option><option value="article">News/article link</option></select></label><label>Title<input name="title" required placeholder="Describe this item"/></label><label>Image file, if adding an image<input type="file" name="file" accept=".jpg,.jpeg,.png,.webp"/></label><label className="check"><input type="checkbox" name="isPrimary" value="true"/><span>Use this image as the campaign cover after approval</span></label><label>URL, if adding video or article<input type="url" name="url" placeholder="https://..."/></label><button className="button" disabled={busy}>{busy?'Submitting...':'Submit for approval'}</button>{message&&<p className="muted">{message}</p>}</form>
}
