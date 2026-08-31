export default function Page(){
  const support=process.env.GOODCAUSE_SUPPORT_EMAIL||process.env.RESEND_REPLY_TO_EMAIL||'support@goodcause.webfitnews.co.nz';
  const complaints=process.env.GOODCAUSE_COMPLIANCE_EMAIL||'complaints@goodcause.webfitnews.co.nz';
  return <><section className="page-hero"><div className="shell"><div className="eyebrow">Contact</div><h1>Get in touch with Good Cause</h1><p className="muted">For platform, campaign, payment or general support, contact the Good Cause team.</p></div></section><section className="section"><div className="shell prose"><h2>Support</h2><p><a href={`mailto:${support}`}>{support}</a></p><h2>Complaints and concerns</h2><p><a href={`mailto:${complaints}`}>{complaints}</a></p><h2>Website</h2><p>https://webfitnews.co.nz</p><h2>Platform</h2><p>https://goodcause.webfitnews.co.nz</p></div></section></>;
}
