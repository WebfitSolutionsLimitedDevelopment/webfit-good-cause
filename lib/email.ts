export type EmailAttachment = {
  filename: string;
  content: string;
};

export type EmailSendResult = {
  delivered: boolean;
  id?: string;
  skipped?: boolean;
};

export async function sendEmail(input:{to:string|string[];subject:string;html:string;text?:string;attachments?:EmailAttachment[]}):Promise<EmailSendResult> {
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
  if (input.text) payload.text = input.text;
  if (input.attachments?.length) payload.attachments = input.attachments;
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

export function contributionReceiptEmailHtml(input:{donorName:string;receiptNumber:string;campaignTitle:string}){
  const support=process.env.GOODCAUSE_SUPPORT_EMAIL?.trim()||process.env.RESEND_REPLY_TO_EMAIL?.trim()||'sandy@webfitnews.co.nz';
  return `<!doctype html><html><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#13283f"><div style="max-width:620px;margin:0 auto;padding:24px 14px"><div style="background:#ffffff;border:1px solid #dfe7df;border-radius:14px;overflow:hidden"><div style="padding:24px;background:#123b2d;color:#ffffff"><div style="font-size:12px;letter-spacing:.09em;text-transform:uppercase">Good Cause</div><h1 style="margin:8px 0 0;font-size:25px;line-height:1.2">Thank you for your contribution</h1></div><div style="padding:26px"><p style="margin:0 0 16px;font-size:16px;line-height:1.6">Thank you, <strong>${escapeHtml(input.donorName)}</strong>. Your contribution to <strong>${escapeHtml(input.campaignTitle)}</strong> has been successfully received.</p><p style="margin:0 0 16px;font-size:16px;line-height:1.6">Please find your Good Cause contribution receipt attached as a PDF.</p><p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#5c6e64">Receipt number: <strong>${escapeHtml(input.receiptNumber)}</strong></p><p style="margin:0;font-size:13px;line-height:1.6;color:#5c6e64">For receipt verification or questions, email <a href="mailto:${escapeHtml(support)}" style="color:#287a42">${escapeHtml(support)}</a>.</p></div></div></div></body></html>`;
}

function mobileRow(label:string,value:string){
  return `<div style="padding:12px 0;border-bottom:1px solid #e5ebe6"><div style="font-size:12px;line-height:1.4;color:#5c6e64;margin-bottom:4px">${escapeHtml(label)}</div><div style="font-size:15px;line-height:1.45;font-weight:700;color:#13283f;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</div></div>`;
}

export function adminContributionHtml(input:{campaignTitle:string;campaignReference?:string|null;amountCents:number;donorName:string;donorEmail:string;receiptNumber:string;processorReference:string;paidAt:string}){
  const support=process.env.GOODCAUSE_SUPPORT_EMAIL?.trim()||process.env.RESEND_REPLY_TO_EMAIL?.trim()||'sandy@webfitnews.co.nz';
  return `<!doctype html><html><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#13283f"><div style="max-width:620px;margin:0 auto;padding:20px 12px"><div style="background:#fff;border:1px solid #dfe7df;border-radius:14px;overflow:hidden"><div style="padding:22px 24px;background:#123b2d;color:#fff"><div style="font-size:12px;letter-spacing:.09em;text-transform:uppercase">Good Cause</div><h1 style="margin:8px 0 0;font-size:24px;line-height:1.2">New contribution received</h1></div><div style="padding:24px"><p style="margin:0 0 14px;font-size:15px;line-height:1.6">A successful Good Cause payment has been recorded.</p>${mobileRow('Campaign',input.campaignTitle)}${input.campaignReference?mobileRow('Campaign reference',input.campaignReference):''}${mobileRow('Amount',nzd(input.amountCents))}${mobileRow('Contributor',input.donorName)}${mobileRow('Contributor email',input.donorEmail||'Not provided')}${mobileRow('Receipt',input.receiptNumber)}${mobileRow('Payment date',input.paidAt)}${mobileRow('Stripe payment reference',input.processorReference)}<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#5c6e64">Good Cause support: <a href="mailto:${escapeHtml(support)}" style="color:#287a42;overflow-wrap:anywhere">${escapeHtml(support)}</a></p></div></div></div></body></html>`;
}
