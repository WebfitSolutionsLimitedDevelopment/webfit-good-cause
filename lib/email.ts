export type EmailSendResult = {
  delivered: boolean;
  id?: string;
  skipped?: boolean;
};

export async function sendEmail(input:{to:string|string[];subject:string;html:string}):Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim();

  if (!apiKey || !from) {
    console.error('resend_not_configured', { hasApiKey: Boolean(apiKey), hasFrom: Boolean(from) });
    return { delivered:false, skipped:true };
  }

  const payload:Record<string,unknown> = {
    from,
    to:input.to,
    subject:input.subject,
    html:input.html,
  };
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });

  const responseText = await response.text();
  if (!response.ok) {
    console.error('resend_delivery_failed', { status:response.status, body:responseText.slice(0,1000) });
    throw new Error(`Email delivery failed: ${response.status}`);
  }

  let data:any = {};
  try { data = responseText ? JSON.parse(responseText) : {}; } catch { data = {}; }
  return { delivered:true, id:data?.id };
}

function escapeHtml(value:string){const map:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'};return value.replace(/[&<>'"]/g,char=>map[char]||char)}
function nzd(cents:number){return new Intl.NumberFormat('en-NZ',{style:'currency',currency:'NZD'}).format(cents/100)}

export function contributionReceiptHtml(input:{receiptNumber:string;donorName:string;campaignTitle:string;amountCents:number;paidAt:string;processorReference:string}){
  const operator=process.env.GOODCAUSE_LEGAL_OPERATOR||'Webfit Solutions Limited';
  const address=process.env.GOODCAUSE_BUSINESS_ADDRESS||'New Zealand';
  const support=process.env.GOODCAUSE_SUPPORT_EMAIL||process.env.RESEND_REPLY_TO_EMAIL||'';
  return `<!doctype html><html><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#13283f"><div style="max-width:680px;margin:0 auto;padding:28px 16px"><div style="background:#ffffff;border:1px solid #dfe7df;border-radius:16px;overflow:hidden"><div style="padding:28px 30px;background:#123b2d;color:#fff"><div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase">Good Cause</div><h1 style="margin:8px 0 0;font-size:28px">Contribution receipt</h1></div><div style="padding:30px"><p>Thank you, <strong>${escapeHtml(input.donorName)}</strong>. Your contribution has been successfully received.</p><table style="width:100%;border-collapse:collapse;margin:24px 0"><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Receipt number</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.receiptNumber)}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Cause</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.campaignTitle)}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Contribution amount</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${nzd(input.amountCents)}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Payment date</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.paidAt)}</td></tr><tr><td style="padding:10px 0;color:#5c6e64">Payment reference</td><td style="padding:10px 0;text-align:right;font-weight:700">${escapeHtml(input.processorReference)}</td></tr></table><p style="font-size:13px;line-height:1.6;color:#5c6e64">This receipt confirms the payment received through Good Cause. It is a contribution/payment receipt and does not by itself confirm eligibility for a New Zealand donation tax credit. Tax eligibility depends on the status of the ultimate recipient and applicable law.</p><p style="font-size:13px;line-height:1.6;color:#5c6e64">Issued by ${escapeHtml(operator)}, ${escapeHtml(address)}.${support?` Questions: ${escapeHtml(support)}.`:''}</p></div></div></div></body></html>`;
}

export function adminContributionHtml(input:{campaignTitle:string;campaignReference?:string|null;amountCents:number;donorName:string;donorEmail:string;receiptNumber:string;processorReference:string;paidAt:string}){
  const support=process.env.GOODCAUSE_SUPPORT_EMAIL||process.env.RESEND_REPLY_TO_EMAIL||'';
  return `<!doctype html><html><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#13283f"><div style="max-width:680px;margin:0 auto;padding:28px 16px"><div style="background:#fff;border:1px solid #dfe7df;border-radius:16px;overflow:hidden"><div style="padding:24px 28px;background:#123b2d;color:#fff"><div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase">Good Cause</div><h1 style="margin:8px 0 0;font-size:26px">New contribution received</h1></div><div style="padding:28px"><p>A successful Good Cause payment has been recorded.</p><table style="width:100%;border-collapse:collapse"><tr><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Campaign</td><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.campaignTitle)}</td></tr>${input.campaignReference?`<tr><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Campaign reference</td><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.campaignReference)}</td></tr>`:''}<tr><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Amount</td><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${nzd(input.amountCents)}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Contributor</td><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.donorName)}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Contributor email</td><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.donorEmail||'Not provided')}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Receipt</td><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.receiptNumber)}</td></tr><tr><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Payment date</td><td style="padding:9px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.paidAt)}</td></tr><tr><td style="padding:9px 0;color:#5c6e64">Stripe payment reference</td><td style="padding:9px 0;text-align:right;font-weight:700">${escapeHtml(input.processorReference)}</td></tr></table>${support?`<p style="margin-top:22px;font-size:13px;color:#5c6e64">Good Cause support: ${escapeHtml(support)}</p>`:''}</div></div></div></body></html>`;
}
