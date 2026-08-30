'use client';

import { FormEvent, useMemo, useState } from 'react';

export function DonatePanel({campaignSlug, enabled}:{campaignSlug:string; enabled:boolean}){
  const [amount,setAmount]=useState(50);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [mobile,setMobile]=useState('');
  const [anonymous,setAnonymous]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const presets=[10,25,50,100,250];
  const valid=useMemo(()=>Number.isFinite(amount)&&amount>=1&&name.trim().length>=2&&/^\S+@\S+\.\S+$/.test(email.trim())&&mobile.trim().length>=7,[amount,name,email,mobile]);

  async function submit(e:FormEvent){
    e.preventDefault(); setError('');
    if(!enabled){setError('Donations are not currently available for this campaign.');return;}
    if(amount<1){setError('Please enter a valid donation amount.');return;}
    if(name.trim().length<2){setError('Please enter your full name.');return;}
    if(!/^\S+@\S+\.\S+$/.test(email.trim())){setError('Please enter a valid email address for your receipt.');return;}
    if(mobile.trim().length<7){setError('Please enter a valid mobile number.');return;}
    setLoading(true);
    try{
      const res=await fetch('/api/donations/create',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({campaignSlug,amount,donorName:name.trim(),donorEmail:email.trim(),donorMobile:mobile.trim(),anonymous})});
      const data=await res.json();
      if(!res.ok||!data.url) throw new Error(data.error||'Unable to start donation checkout.');
      window.location.href=data.url;
    }catch(err){setError(err instanceof Error?err.message:'Unable to start donation checkout.');setLoading(false);}
  }

  return <form className="donate-panel" onSubmit={submit}>
    <div className="donation-preset-grid">{presets.map(v=><button type="button" key={v} className={amount===v?'preset active':'preset'} onClick={()=>setAmount(v)}>NZ${v}</button>)}</div>
    <label className="donation-custom">Or choose an amount<div className="money-field"><span>NZ$</span><input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></div></label>
    <div className="donor-fields">
      <label>Full name<input type="text" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required/></label>
      <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
      <label>Mobile<input type="tel" autoComplete="tel" value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="021 123 4567" required/></label>
    </div>
    <label className="donor-privacy-check"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/><span><strong>Hide my name publicly</strong><small>Your name is still recorded securely for the contribution receipt and payment records. Public campaign activity will show “Anonymous supporter”.</small></span></label>
    <button className="button donate-button" type="submit" disabled={loading||!valid}>{loading?'Opening secure checkout...':'Continue to secure payment'}</button>
    {error&&<p className="form-error">{error}</p>}
    <p className="fineprint">You pay the amount you choose. Good Cause deducts its 2.5% platform fee and the actual applicable Stripe processing cost from the donation. A contribution receipt is emailed after successful payment.</p>
  </form>;
}
