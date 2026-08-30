'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export function Header() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const client = supabase;

    let active = true;

    async function refreshAuth() {
      const { data: { user } } = await client.auth.getUser();
      if (!active) return;
      setSignedIn(Boolean(user));
      if (!user) {
        setIsStaff(false);
        return;
      }

      const { data: profile } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!active) return;
      setIsStaff(['reviewer', 'finance', 'admin', 'super_admin'].includes(profile?.role || ''));
    }

    refreshAuth();
    const { data: listener } = client.auth.onAuthStateChange(() => refreshAuth());
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return <header className="site-header">
    <div className="shell header-inner">
      <Link href="/" className="brand-lockup" aria-label="Good Cause home">
        <Image src="/goodcause-mark.png" alt="" width={58} height={58} priority className="brand-mark" />
        <span className="brand-copy"><strong>Good Cause</strong><small>by Webfit News</small></span>
      </Link>
      <button className="menu-button" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>
        <span></span><span></span><span></span>
      </button>
      <nav className={`nav ${open?'open':''}`} aria-label="Primary navigation">
        <Link href="/campaigns" onClick={()=>setOpen(false)}>Explore</Link>
        <Link href="/how-it-works" onClick={()=>setOpen(false)}>How it works</Link>
        <Link href="/fees" onClick={()=>setOpen(false)}>Fees</Link>
        <Link href="/safety" onClick={()=>setOpen(false)}>Safety</Link>
        {signedIn ? <>
          {isStaff && <Link href="/admin" onClick={()=>setOpen(false)}>Admin</Link>}
          <Link href="/dashboard" onClick={()=>setOpen(false)}>Dashboard</Link>
          <Link className="button small secondary" href="/auth/signout" onClick={()=>setOpen(false)}>Log out</Link>
        </> : <>
          <Link href="/login" onClick={()=>setOpen(false)}>Log in</Link>
          <Link className="button small" href="/start" onClick={()=>setOpen(false)}>Start a cause</Link>
        </>}
      </nav>
    </div>
  </header>;
}
