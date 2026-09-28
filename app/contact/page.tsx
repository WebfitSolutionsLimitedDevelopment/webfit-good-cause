import { JsonLd } from '@/components/seo/JsonLd';
import { absoluteUrl as __abs } from '@/lib/seo';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/contact', title: 'Contact Good Cause', description: 'Get in touch with the Good Cause team about a fundraiser, a donation or a payout.', keywords: ['contact fundraising support NZ'] });
export default function Page(){
  const support=process.env.GOODCAUSE_SUPPORT_EMAIL||process.env.RESEND_REPLY_TO_EMAIL||'support@goodcause.webfitnews.co.nz';
  const complaints=process.env.GOODCAUSE_COMPLIANCE_EMAIL||'complaints@goodcause.webfitnews.co.nz';
  return <><JsonLd data={{'@context':'https://schema.org','@type':'ContactPage',name:'Contact Good Cause',url:__abs('/contact'),about:{'@id':__abs('/#organization')}}}/><section className="page-hero"><div className="shell"><div className="eyebrow">Contact</div><h1>Get in touch with Good Cause</h1><p className="muted">For platform, campaign, payment or general support, contact the Good Cause team.</p></div></section><section className="section"><div className="shell prose"><h2>Support</h2><p><a href={`mailto:${support}`}>{support}</a></p><h2>Complaints and concerns</h2><p><a href={`mailto:${complaints}`}>{complaints}</a></p><h2>Website</h2><p>https://webfitnews.co.nz</p><h2>Platform</h2><p>https://goodcause.webfitnews.co.nz</p></div></section></>;
}
