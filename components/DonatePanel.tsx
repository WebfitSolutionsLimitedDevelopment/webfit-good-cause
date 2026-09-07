'use client';

import { FormEvent, useMemo, useState } from 'react';

export function DonatePanel({campaignSlug, enabled}:{campaignSlug:string; enabled:boolean}){
  const isOneMoreGift=campaignSlug==='one-more-gift-2026';
  const [amount,setAmount]=useState(isOneMoreGift?20:50);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [mobile,setMobile]=useState('');
  const [message,setMessage]=useState('');
  const [anonymous,setAnonymous]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const presets=isOneMoreGift?[5,10,20,50,100]:[10,25,50,100,250];
  const minimumAmount=isOneMoreGift?2:1;
  const maximumAmount=isOneMoreGift?2000:100000;
  const valid=useMemo(()=>Number.isFinite(amount)&&amount>=minimumAmount&&amount<=maximumAmount&&name.trim().length>=2&&/^\S+@\S+\.\S+$/.test(email.trim())&&mobile.trim().length>=7&&message.length<=500,[amount,name,email,mobile,message,minimumAmount,maximumAmount]);

  async function submit(e:FormEvent){
    e.preventDefault(); setError('');
    if(!enabled){setError('Donations for this campaign are not available until its verified payout destination is configured.');return;}
    if(amount<minimumAmount){setError(`Minimum contribution for this campaign is NZ$${minimumAmount}.`);return;}
    if(amount>maximumAmount){setError(`Maximum online contribution for this campaign is NZ$${maximumAmount.toLocaleString('en-NZ')}.`);return;}
    if(name.trim().length<2){setError('Please enter your full name.');return;}
    if(!/^\S+@\S+\.\S+$/.test(email.trim())){setError('Please enter a valid email address for your receipt.');return;}
    if(mobile.trim().length<7){setError('Please enter a valid mobile number.');return;}
    if(message.length>500){setError('Please keep your public message to 500 characters or fewer.');return;}
    setLoading(true);
    try{
      const res=await fetch('/api/donations/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({campaignSlug,amount,donorName:name.trim(),donorEmail:email.trim(),donorMobile:mobile.trim(),donorMessage:message.trim(),anonymous})});
      const data=await res.json();
      if(!res.ok||!data.url) throw new Error(data.error||'Unable to start donation checkout.');
      window.location.href=data.url;
    }catch(err){setError(err instanceof Error?err.message:'Unable to start donation checkout.');setLoading(false);}
  }

  const previewName=anonymous?'Anonymous supporter':(name.trim()||'Your name');

  return <form className="donate-panel" onSubmit={submit}>
    <div className="donation-preset-grid">{presets.map(v=><button type="button" key={v} className={amount===v?'preset active':'preset'} onClick={()=>setAmount(v)}>NZ${v}</button>)}</div>
    <label className="donation-custom">Or choose an amount<div className="money-field"><span>NZ$</span><input type="number" min={minimumAmount} max={maximumAmount} step="1" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></div></label>
    <div className="donor-fields">
      <label>Full name<input type="text" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required/></label>
      <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
      <label>Mobile<input type="tel" autoComplete="tel" value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="021 123 4567" required/></label>
      <label>Message of support <span className="optional-label">optional</span><textarea value={message} onChange={e=>setMessage(e.target.value.slice(0,500))} placeholder="Leave a public message for this cause" rows={4} maxLength={500}/><small className="field-counter">{message.length}/500</small></label>
    </div>
    <label className="donor-privacy-check"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/><span><strong>Hide my name publicly</strong><small>Your name will still be securely recorded for the contribution receipt and payment records. The campaign activity will show “Anonymous supporter”.</small></span></label>
    {(message.trim()||name.trim())&&<div className="donation-preview" aria-label="Public contribution preview"><small>Public preview</small><div className="donation-preview-card"><div className="donor-avatar">{anonymous?'A':(name.trim().charAt(0).toUpperCase()||'G')}</div><div><strong>{previewName}</strong>{message.trim()&&<p>{message.trim()}</p>}<b>NZ${Number.isFinite(amount)?amount:0}</b></div></div></div>}
    <button className="button donate-button" type="submit" disabled={loading||!valid}>{loading?'Opening secure checkout...':'Continue to secure payment'}</button>
    {error&&<p className="form-error">{error}</p>}
    {isOneMoreGift&&<p className="fineprint"><strong>There is no right amount.</strong> Give what feels comfortable. A small contribution is still a meaningful act of kindness.</p>}
    <p className="fineprint">Your email address and mobile number are private and are not displayed on the public campaign page. A contribution receipt is emailed after successful payment.</p>
  </form>;
}
