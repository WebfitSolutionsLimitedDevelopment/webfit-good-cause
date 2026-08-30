export type RiskLevel = 'standard' | 'enhanced' | 'restricted';
export type ReviewState = 'not_started' | 'pending' | 'verified' | 'needs_information' | 'failed';
export type CampaignLifecycle = 'draft' | 'submitted' | 'under_review' | 'more_information_required' | 'enhanced_review' | 'approved' | 'live' | 'suspended' | 'payout_review' | 'paid' | 'rejected' | 'closed';

export type ComplianceCheck = {
  key: string;
  label: string;
  status: ReviewState;
  required: boolean;
  detail: string;
};

export type ReviewCase = {
  id: string;
  campaign: string;
  fundraiser: string;
  beneficiary: string;
  fundraiserType: string;
  amount: number;
  country: string;
  risk: RiskLevel;
  status: CampaignLifecycle;
  submittedAt: string;
  reason: string;
  checks: ComplianceCheck[];
};

export const reviewCases: ReviewCase[] = [
  {
    id: 'GC-000124',
    campaign: 'Nepal Flash Flood Relief 2026',
    fundraiser: 'Aroha Thompson',
    beneficiary: 'Verified local household',
    fundraiserType: 'Fundraising for another person',
    amount: 18000,
    country: 'New Zealand',
    risk: 'enhanced',
    status: 'under_review',
    submittedAt: '30 Aug 2026, 9:42 am',
    reason: 'Fundraising for another person and target exceeds internal enhanced-review threshold.',
    checks: [
      {key:'identity',label:'Fundraiser identity',status:'verified',required:true,detail:'Identity evidence received and reviewed.'},
      {key:'contact',label:'Email and mobile',status:'verified',required:true,detail:'Contact channels confirmed.'},
      {key:'beneficiary',label:'Beneficiary identity',status:'verified',required:true,detail:'Beneficiary details independently checked.'},
      {key:'consent',label:'Beneficiary consent',status:'verified',required:true,detail:'Consent recorded.'},
      {key:'bank',label:'Payment destination',status:'pending',required:true,detail:'Bank-account ownership review pending.'},
      {key:'evidence',label:'Supporting evidence',status:'verified',required:true,detail:'Documents support the stated fundraising purpose.'},
      {key:'purpose',label:'Purpose review',status:'verified',required:true,detail:'Permitted purpose under Good Cause policy.'},
      {key:'risk',label:'Risk screening',status:'pending',required:true,detail:'Enhanced review in progress.'},
      {key:'declaration',label:'Declarations and terms',status:'verified',required:true,detail:'Required declarations accepted and timestamped.'},
      {key:'human',label:'Human moderation',status:'pending',required:true,detail:'Final approval not yet recorded.'},
    ],
  },
  {
    id: 'GC-000125',
    campaign: 'School Music Equipment Appeal',
    fundraiser: 'Harbour Community Trust',
    beneficiary: 'Harbour Community Trust',
    fundraiserType: 'Community organisation',
    amount: 6500,
    country: 'New Zealand',
    risk: 'standard',
    status: 'more_information_required',
    submittedAt: '29 Aug 2026, 4:18 pm',
    reason: 'Organisation authority document needs clarification.',
    checks: [
      {key:'identity',label:'Representative identity',status:'verified',required:true,detail:'Representative checked.'},
      {key:'authority',label:'Authority to act',status:'needs_information',required:true,detail:'Please provide current authority or committee confirmation.'},
      {key:'bank',label:'Payment destination',status:'verified',required:true,detail:'Organisation account confirmed.'},
      {key:'evidence',label:'Supporting evidence',status:'verified',required:true,detail:'Supplier quote supplied.'},
      {key:'purpose',label:'Purpose review',status:'verified',required:true,detail:'Permitted community purpose.'},
      {key:'declaration',label:'Declarations and terms',status:'verified',required:true,detail:'Accepted.'},
      {key:'human',label:'Human moderation',status:'pending',required:true,detail:'Blocked until requested information is supplied.'},
    ],
  },
  {
    id: 'GC-000126',
    campaign: 'Overseas Emergency Relief',
    fundraiser: 'Nepal Flood Relief Appeal Team',
    beneficiary: 'Overseas relief partner',
    fundraiserType: 'Emergency relief',
    amount: 50000,
    country: 'Overseas',
    risk: 'enhanced',
    status: 'enhanced_review',
    submittedAt: '29 Aug 2026, 11:03 am',
    reason: 'International beneficiary and emergency-relief payment route require enhanced checks before publication.',
    checks: [
      {key:'identity',label:'Organiser identity',status:'verified',required:true,detail:'Checked.'},
      {key:'beneficiary',label:'Beneficiary organisation',status:'pending',required:true,detail:'Independent verification underway.'},
      {key:'authority',label:'Authority and relationship',status:'pending',required:true,detail:'Relationship evidence under review.'},
      {key:'bank',label:'Payment destination',status:'pending',required:true,detail:'International payment route not yet approved.'},
      {key:'evidence',label:'Relief evidence',status:'verified',required:true,detail:'Emergency context documented.'},
      {key:'risk',label:'Sanctions and risk screening',status:'pending',required:true,detail:'Enhanced geographic and counterparty review required.'},
      {key:'human',label:'Human moderation',status:'pending',required:true,detail:'Cannot be published until all enhanced checks pass.'},
    ],
  },
];

export const riskLabel: Record<RiskLevel,string> = {standard:'Standard',enhanced:'Enhanced review',restricted:'Restricted'};
export const statusLabel: Record<CampaignLifecycle,string> = {
  draft:'Draft',submitted:'Submitted',under_review:'Under review',more_information_required:'More information required',enhanced_review:'Enhanced review',approved:'Approved',live:'Live',suspended:'Suspended',payout_review:'Payout review',paid:'Paid',rejected:'Rejected',closed:'Closed'
};

export function canActivateDonations(checks: ComplianceCheck[]) {
  return checks.filter(c => c.required).every(c => c.status === 'verified');
}
