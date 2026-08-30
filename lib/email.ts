export async function sendEmail(input:{to:string|string[];subject:string;html:string}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return { skipped:true };
  const response = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({from,to:input.to,subject:input.subject,html:input.html,reply_to:process.env.RESEND_REPLY_TO_EMAIL})
  });
  if (!response.ok) throw new Error(`Email delivery failed: ${response.status}`);
  return response.json();
}

function escapeHtml(value:string){const map:Record<string,string>={'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'};return value.replace(/[&<>'"]/g,char=>map[char]||char)}
function nzd(cents:number){return new Intl.NumberFormat('en-NZ',{style:'currency',currency:'NZD'}).format(cents/100)}

export function contributionReceiptHtml(input:{receiptNumber:string;donorName:string;campaignTitle:string;amountCents:number;paidAt:string;processorReference:string}){
  const operator=process.env.GOODCAUSE_LEGAL_OPERATOR||'Webfit Solutions Limited';
  const address=process.env.GOODCAUSE_BUSINESS_ADDRESS||'New Zealand';
  const support=process.env.GOODCAUSE_SUPPORT_EMAIL||process.env.RESEND_REPLY_TO_EMAIL||'';
  return `<!doctype html><html><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#13283f"><div style="max-width:680px;margin:0 auto;padding:28px 16px"><div style="background:#ffffff;border:1px solid #dfe7df;border-radius:16px;overflow:hidden"><div style="padding:28px 30px;background:#123b2d;color:#fff"><div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase">Good Cause</div><h1 style="margin:8px 0 0;font-size:28px">Contribution receipt</h1></div><div style="padding:30px"><p>Thank you, <strong>${escapeHtml(input.donorName)}</strong>. Your contribution has been successfully received.</p><table style="width:100%;border-collapse:collapse;margin:24px 0"><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Receipt number</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.receiptNumber)}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Cause</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.campaignTitle)}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Contribution amount</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${nzd(input.amountCents)}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;color:#5c6e64">Payment date</td><td style="padding:10px 0;border-bottom:1px solid #e5ebe6;text-align:right;font-weight:700">${escapeHtml(input.paidAt)}</td></tr><tr><td style="padding:10px 0;color:#5c6e64">Payment reference</td><td style="padding:10px 0;text-align:right;font-weight:700">${escapeHtml(input.processorReference)}</td></tr></table><p style="font-size:13px;line-height:1.6;color:#5c6e64">This receipt confirms the payment received through Good Cause. It is a contribution/payment receipt and does not by itself confirm eligibility for a New Zealand donation tax credit. Tax eligibility depends on the status of the ultimate recipient and applicable law.</p><p style="font-size:13px;line-height:1.6;color:#5c6e64">Issued by ${escapeHtml(operator)}, ${escapeHtml(address)}.${support?` Questions: ${escapeHtml(support)}.`:''}</p></div></div></div></body></html>`;
}
