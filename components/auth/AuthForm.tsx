'use client';
import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase';

export function AuthForm({mode,next='/dashboard'}:{mode:'login'|'signup';next?:string}) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState(''); const [mobile,setMobile]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage('');const supabase=createClient();if(!supabase){setMessage('Authentication is not configured.');setBusy(false);return;}
    if(mode==='signup'){
      try{const res=await fetch('/api/auth/signup',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password,fullName:name,mobile,next,website:(e.currentTarget as any).website?.value||''})});const data=await res.json().catch(()=>({}));setMessage(res.ok?(data.message||'Check your email to confirm your account.'):(data.error||'Something went wrong. Please try again.'));}catch{setMessage('Something went wrong. Please try again.');}
    } else {
      const {error}=await supabase.auth.signInWithPassword({email,password});
      if(error)setMessage(/confirm/i.test(error.message)?'Please confirm your email first. Use Create an account again with the same email and we will send a new link.':error.message);else window.location.href=next;
    }
    setBusy(false);
  }
  return <form className="auth-card card" onSubmit={submit}><h1>{mode==='login'?'Log in':'Create your Good Cause account'}</h1><p className="muted">{mode==='login'?'Access your campaigns and account.':'Create and manage fundraising campaigns securely.'}</p>{mode==='signup'&&<><label>Full name<input value={name} onChange={e=>setName(e.target.value)} required autoComplete="name"/></label><label>Mobile number<input type="tel" value={mobile} onChange={e=>setMobile(e.target.value)} required autoComplete="tel" placeholder="e.g. 021 123 4567"/></label></>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={10} autoComplete={mode==='login'?'current-password':'new-password'}/></label>{mode==='signup'&&<input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:'absolute',left:'-9999px',width:1,height:1}}/>}{message&&<div className="notice">{message}</div>}<button className="button" disabled={busy}>{busy?'Please wait...':mode==='login'?'Log in':'Create account'}</button>{mode==='login'?<><a className="text-link" href="/forgot-password">Forgot your password?</a><p>New to Good Cause? <a className="text-link" href="/signup">Create an account</a></p></>:<p>Already have an account? <a className="text-link" href="/login">Log in</a></p>}</form>
}
