import { money } from '@/lib/fees';

export type PublicDonation = {
  id: string;
  amount_cents: number;
  donor_display_name: string | null;
  anonymous: boolean;
  message: string | null;
  paid_at: string | null;
  created_at: string;
};

function displayName(d: PublicDonation) {
  return d.anonymous ? 'Anonymous supporter' : (d.donor_display_name?.trim() || 'Supporter');
}

function initial(d: PublicDonation) {
  if (d.anonymous) return 'A';
  return displayName(d).charAt(0).toUpperCase() || 'G';
}

export function DonorWall({donations}:{donations:PublicDonation[]}) {
  return <section className="campaign-section donor-wall">
    <div className="section-heading-row">
      <div><h2>Latest donations</h2><p className="muted">Every successful contribution to this campaign is shown below. Email addresses and mobile numbers are never displayed publicly.</p></div>
      <span className="supporter-count">{donations.length} {donations.length===1?'supporter':'supporters'}</span>
    </div>
    {donations.length ? <div className="donation-list">
      {donations.map((d)=><article className="donation-card" key={d.id}>
        <div className="donor-avatar" aria-hidden="true">{initial(d)}</div>
        <div className="donation-card-body">
          <div className="donation-card-head"><div><strong>{displayName(d)}</strong><span> on {new Date(d.paid_at || d.created_at).toLocaleDateString('en-NZ',{day:'2-digit',month:'short',year:'numeric'})}</span></div><b>{money(Number(d.amount_cents||0)/100)}</b></div>
          {d.message?.trim()&&<p className="donor-message">{d.message.trim()}</p>}
        </div>
      </article>)}
    </div> : <p className="muted">Be the first supporter to leave a message with your contribution.</p>}
  </section>;
}
