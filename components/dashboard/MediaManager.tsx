'use client';
import { FormEvent,useState } from 'react';

export function MediaManager({campaignId,isSuperAdmin=false}:{campaignId:string,isSuperAdmin?:boolean}){
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage('');
    const form=e.currentTarget;const data=new FormData(form);data.set('campaignId',campaignId);
    const res=await fetch('/api/campaigns/media',{method:'POST',body:data});const json=await res.json();
    setMessage(json.error||json.message||(isSuperAdmin?'Media published successfully.':'Media submitted for admin approval.'));
    if(res.ok){form.reset();window.location.reload();}
    setBusy(false);
  }
  return <form className="card cms-panel" onSubmit={submit}>
    <div className="cms-panel-head"><div><span className="cms-kicker">Media manager</span><h3>Add campaign media</h3></div>{isSuperAdmin&&<span className="cms-live-badge">Direct publish</span>}</div>
    <p className="muted">{isSuperAdmin?'Upload an image or add a reference link. Your changes publish immediately.':'Upload images or add links for review before they appear publicly.'}</p>
    <label>Type<select name="kind" defaultValue="image"><option value="image">Image upload</option><option value="video">Video link</option><option value="article">News/article link</option></select></label>
    <label>Title<input name="title" required placeholder="Describe this item"/></label>
    <label>Image file<input type="file" name="file" accept=".jpg,.jpeg,.png,.webp"/></label>
    <label className="check"><input type="checkbox" name="isPrimary" value="true"/><span>Use this image as the campaign cover</span></label>
    <label>URL, if adding video or article<input type="url" name="url" placeholder="https://..."/></label>
    <button className="button" disabled={busy}>{busy?'Saving...':isSuperAdmin?'Publish media':'Submit for approval'}</button>
    {message&&<p className="cms-message">{message}</p>}
  </form>
}
