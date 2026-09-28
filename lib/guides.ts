export type Guide = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string[];
  updated: string;
  intro: string;
  sections: { heading: string; body: string[]; list?: string[] }[];
  faqs: { q: string; a: string }[];
  related: string[];
  sources?: { label: string; url: string }[];
};

const UPDATED = '2026-09-29';

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-fundraise-online-nz',
    title: 'How to raise money online in New Zealand',
    metaTitle: 'How to raise money online in NZ: step-by-step guide',
    description: 'A plain-English guide to starting an online fundraiser in New Zealand: choosing a target, writing your page, getting verified, sharing it and receiving the money.',
    keywords: ['how to raise money online NZ', 'how to start a fundraiser NZ', 'online fundraising New Zealand', 'crowdfunding NZ guide', 'fundraising page NZ'],
    updated: UPDATED,
    intro: 'Most online fundraisers in New Zealand succeed or fail on three things: a clear reason, a believable target and how well the page is shared in the first few days. This guide walks through each step, from deciding what you are raising money for to getting the funds into the right bank account.',
    sections: [
      { heading: '1. Be clear about what the money is for', body: ['Write one sentence that explains who the money is for and what it will pay for. For example: "Helping the Smith family cover rent and travel while Jake has treatment in Starship." If you cannot say it in one sentence, supporters will struggle too.', 'Decide who will receive the money. It can be you, another person (with their consent), a community group or a registered charity. The person or group that receives the funds needs a New Zealand bank account in their own name.'] },
      { heading: '2. Set a target you can explain', body: ['Add up the real costs and show the working on your page. A target of $4,800 that lists flights, accommodation and time off work is more convincing than a round $10,000.', 'You can raise more than your target. It is better to reach a realistic goal and update it than to sit at 8% of a large one.'] },
      { heading: '3. Write a page people want to share', body: ['Lead with the situation, then what the money will do, then how people can help. Keep sentences short. Use a real photo you have permission to use. Avoid pressure or guilt, it tends to reduce giving rather than increase it.'], list: ['A clear title that says who and what', 'A short summary of two or three sentences', 'The full story, with dates and specific facts', 'A breakdown of how the money will be spent', 'A photo you took or have permission to use'] },
      { heading: '4. Get verified before you share', body: ['On Good Cause, every fundraiser is checked by a person before it can take donations. You upload photo ID, proof of the bank account and evidence of the cause. This protects donors and makes your page more credible when people share it.'] },
      { heading: '5. Share it in the first 48 hours', body: ['Most donations arrive soon after a page is shared. Send it personally to 10 to 20 people who know you first, then post it on Facebook, Instagram, WhatsApp groups and community pages. A personal message gets far more response than a public post.', 'Post updates. Each update is a reason for people to share the page again, and it shows donors their money is being used as promised.'] },
      { heading: '6. Receive the money', body: ['On Good Cause the cause receives 97.5% of every donation. Donors pay the card processing fee on top, so it does not come out of the amount raised. Payouts go by bank transfer to the verified account for the campaign.'] },
    ],
    faqs: [
      { q: 'Do I need to be a charity to fundraise online in NZ?', a: 'No. Individuals, families and community groups can fundraise for a genuine cause. If the money is for someone else, you need their consent, and the funds are paid to a verified account.' },
      { q: 'How much does it cost to start a fundraiser?', a: 'It is free to start a fundraiser on Good Cause. We keep 2.5% of each donation, and donors pay the card processing fee on top.' },
      { q: 'How long does verification take?', a: 'It depends on how quickly the documents are provided. Straightforward campaigns with complete documents are usually reviewed within a few working days.' },
    ],
    related: ['write-a-fundraising-page', 'fundraising-ideas-nz', 'online-fundraising-fees-nz'],
  },
  {
    slug: 'fundraising-in-auckland',
    title: 'Fundraising in Auckland: online and in person',
    metaTitle: 'Fundraising in Auckland: online, events and council rules',
    description: 'How to raise money in Auckland, from online fundraising pages to street collections, events and raffles, including when you need Auckland Council approval.',
    keywords: ['fundraising Auckland', 'Auckland fundraiser', 'donate Auckland', 'street collection Auckland permit', 'Auckland community fundraising', 'charity events Auckland'],
    updated: UPDATED,
    intro: 'Auckland has more community groups, schools and sports clubs than anywhere else in New Zealand, which makes it a good place to raise money and a crowded one. The simplest approach is usually an online fundraising page backed by one or two local activities that point people to it.',
    sections: [
      { heading: 'Start with an online page', body: ['An online page works across the whole region, from the North Shore to Pukekohe, without needing a venue or permit. It gives local activities somewhere to send people, and it keeps a clear record of what has been raised.', 'Share it in local Facebook groups, neighbourhood pages, school newsletters, church and marae networks, and community WhatsApp groups. Local media and community newsletters will sometimes cover a fundraiser with a clear local story.'] },
      { heading: 'Street collections and fundraising in public places', body: ['Under Auckland Council’s Public Trading, Events and Filming Bylaw 2022, fundraising for a charitable cause or collecting donations in council-controlled public places needs approval. Apply to the council before you collect on streets, in parks or at town centres. Private venues such as supermarkets and malls need permission from the owner or manager.'] },
      { heading: 'Events that work well in Auckland', body: ['Quiz nights, sausage sizzles, fun runs, school discos, club games and cultural performances are all popular. Keep costs low and put a QR code linking to your online page on posters and tables, so people who do not carry cash can still give.'] },
      { heading: 'Raffles and prize draws', body: ['Small raffles are allowed without a licence as long as they stay within the Department of Internal Affairs limits. See our guide to fundraising rules in New Zealand before you sell tickets.'] },
    ],
    faqs: [
      { q: 'Do I need a permit to collect donations on the street in Auckland?', a: 'Yes. Auckland Council’s Public Trading, Events and Filming Bylaw 2022 requires approval for fundraising and collecting donations in council-controlled public places.' },
      { q: 'Can I run an online fundraiser for an Auckland cause?', a: 'Yes. Online fundraising pages do not need a council permit. The fundraiser is reviewed by Good Cause before donations are enabled.' },
    ],
    related: ['fundraising-rules-nz', 'fundraising-ideas-nz', 'school-and-club-fundraising'],
    sources: [{ label: 'Auckland Council: Public Trading, Events and Filming Bylaw 2022', url: 'https://www.aucklandcouncil.govt.nz/en/plans-policies-bylaws-reports-projects/bylaws/trading-events-public-places-bylaw.html' }],
  },
  {
    slug: 'fundraising-ideas-nz',
    title: 'Fundraising ideas that work in New Zealand',
    metaTitle: '25 fundraising ideas that work in NZ',
    description: 'Practical fundraising ideas for families, schools, clubs and community groups in New Zealand, from easy online ideas to events, challenges and local businesses.',
    keywords: ['fundraising ideas NZ', 'easy fundraising ideas', 'school fundraising ideas NZ', 'fundraising ideas for sports clubs', 'community fundraising ideas', 'fun fundraising ideas'],
    updated: UPDATED,
    intro: 'The best fundraising idea is one your supporters will enjoy and you can run without spending much. Pair any of these with an online fundraising page so people can give even if they cannot attend.',
    sections: [
      { heading: 'Easy ideas you can start this week', body: ['These need little planning and work well for personal causes.'], list: ['Share an online fundraising page with a personal message to friends and whānau', 'Ask for donations instead of birthday or wedding gifts', 'Run a sausage sizzle (ask your local hardware store or supermarket first)', 'Hold a bake sale at school, work or church', 'Sell unwanted items on Trade Me and donate the proceeds', 'Offer a skill such as baking, lawn mowing, haircuts or tutoring for a donation'] },
      { heading: 'Challenges and sponsored events', body: ['Challenges give people a reason to share your page again and again.'], list: ['Walk or run a set distance each day for a month', 'Take part in a local fun run or half marathon and ask for sponsorship', 'Swim, cycle or paddle a distance with meaning, such as the length of a river', 'Shave or colour your hair', 'Go without something, such as coffee or social media, for a month'] },
      { heading: 'Events for groups and clubs', body: ['Events take more organising, but they bring people together and raise awareness as well as money.'], list: ['Quiz night', 'Movie night at a school hall', 'Golf day or club tournament', 'Hāngī or curry night', 'Talent show or cultural performance', 'Garage sale or market stall', 'Car wash'] },
      { heading: 'Working with local businesses', body: ['Many businesses will donate prizes, match donations or put your QR code on the counter. Ask in person, explain exactly what you need, and thank them publicly on your fundraising page.'] },
      { heading: 'Raffles', body: ['Raffles are popular but have rules. Small raffles with total prizes and ticket sales of $500 or less each do not need a licence. Read our guide to fundraising rules before you start.'] },
    ],
    faqs: [
      { q: 'What is the easiest way to raise money quickly?', a: 'An online fundraising page shared personally with people who know you. Personal messages get far more response than public posts.' },
      { q: 'What fundraising ideas work for schools?', a: 'Discos, mufti days, bake sales, fun runs, movie nights and online appeals for a specific project such as new sports gear or a trip.' },
    ],
    related: ['school-and-club-fundraising', 'fundraising-rules-nz', 'how-to-fundraise-online-nz'],
  },
  {
    slug: 'medical-fundraising-nz',
    title: 'Raising money for medical costs in New Zealand',
    metaTitle: 'Medical fundraising in NZ: raising money for treatment',
    description: 'How to fundraise for medical treatment, travel, recovery or living costs in New Zealand, including what to check first and how to write a respectful page.',
    keywords: ['medical fundraising NZ', 'fundraiser for surgery NZ', 'raise money for cancer treatment NZ', 'help with medical bills NZ', 'fundraising for someone who is sick'],
    updated: UPDATED,
    intro: 'Medical fundraisers are among the most common in New Zealand. Even when treatment is publicly funded, families often face costs for travel, accommodation, time off work, equipment or treatment not funded here.',
    sections: [
      { heading: 'Check what support is already available', body: ['Before you set a target, check what may already be covered. ACC may cover costs related to an injury. Your hospital social worker can explain travel and accommodation assistance. Work and Income may help with some costs. This helps you set an honest target and explain it to donors.'] },
      { heading: 'Get consent from the person you are helping', body: ['If you are fundraising for someone else, they must agree to the fundraiser and to what is shared about their health. Keep medical details to what donors need to understand the situation. Good Cause asks for the beneficiary’s consent before a campaign goes live.'] },
      { heading: 'Explain the costs clearly', body: ['List the main costs: treatment, flights, accommodation, lost income, equipment. If treatment is overseas, include the quote. Donors give more confidently when they can see where the money goes.'] },
      { heading: 'Keep supporters updated', body: ['Short updates after appointments or milestones let supporters know how the person is doing and how the money has been used. You decide how much to share.'] },
    ],
    faqs: [
      { q: 'Can I fundraise for someone else’s medical treatment?', a: 'Yes, with their consent. The money is paid to a verified bank account for the beneficiary or someone they have authorised.' },
      { q: 'Are donations to a medical fundraiser tax deductible?', a: 'Usually not. Donation tax credits only apply to donations to approved donee organisations, not gifts to individuals.' },
    ],
    related: ['fundraise-for-someone-else', 'write-a-fundraising-page', 'donation-tax-credits-nz'],
  },
  {
    slug: 'emergency-and-disaster-fundraising',
    title: 'Fundraising after a flood, fire or emergency',
    metaTitle: 'Emergency fundraising NZ: floods, fires and disasters',
    description: 'How to set up a trustworthy fundraiser after a house fire, flood, storm or other emergency in New Zealand or overseas, and how donors can give safely.',
    keywords: ['emergency fundraising NZ', 'flood relief fundraiser', 'house fire fundraiser NZ', 'disaster appeal NZ', 'donate to flood victims', 'storm relief donation'],
    updated: UPDATED,
    intro: 'After a flood, fire or storm, people want to help quickly. That speed is also when scams appear. A good emergency fundraiser is clear about who receives the money and gets verified before it is widely shared.',
    sections: [
      { heading: 'For people setting up an appeal', body: ['Name the people or community the money is for and how you know them. Say what the money will be used for first, for example emergency accommodation, clothing, or replacing tools of trade. If you are raising money for a whole community, say which organisation will distribute it.'] },
      { heading: 'For donors', body: ['Give through a page that says who receives the money and has been checked. Be wary of pages that ask you to pay into a personal bank account, use gift cards or cryptocurrency, or cannot say who they are.'], list: ['Check who the beneficiary is', 'Look for verification or review', 'Pay by card through a secure checkout, not a direct transfer to a stranger', 'Report anything that looks wrong'] },
      { heading: 'Overseas disasters', body: ['Good Cause accepts appeals for overseas disasters when the funds go to a verified beneficiary or relief partner. These campaigns receive extra review.'] },
    ],
    faqs: [
      { q: 'How quickly can an emergency fundraiser go live?', a: 'As soon as the review is complete. Providing ID, bank details and evidence of the situation up front is the fastest route.' },
      { q: 'How do I know an emergency appeal is genuine?', a: 'Check who receives the money, whether the page has been reviewed, and whether updates are posted. Report any page that looks wrong.' },
    ],
    related: ['how-to-fundraise-online-nz', 'fundraise-for-someone-else', 'fundraising-rules-nz'],
  },
  {
    slug: 'school-and-club-fundraising',
    title: 'Fundraising for schools, sports clubs and community groups',
    metaTitle: 'School and club fundraising in NZ: ideas and tips',
    description: 'How schools, PTAs, sports clubs, kapa haka groups and community organisations in New Zealand can raise money online and in person.',
    keywords: ['school fundraising NZ', 'sports club fundraising NZ', 'PTA fundraising ideas', 'community group fundraising', 'fundraising for a team trip', 'club fundraiser NZ'],
    updated: UPDATED,
    intro: 'Groups raise money best for something specific: new uniforms, a trip to nationals, a playground or a van. A clear project with a clear price gives families and local businesses a reason to give.',
    sections: [
      { heading: 'Pick one project with one price', body: ['Rather than a general appeal, choose one thing. "$6,400 to send 16 players to the national tournament in Christchurch" is easier to support than "funds for the club".'] },
      { heading: 'Use an online page alongside events', body: ['An online page lets grandparents, former members and supporters in other cities give. Put the link and a QR code in newsletters, on posters and at events.'] },
      { heading: 'Who receives the money', body: ['The funds should go to the group’s own bank account, not a member’s personal account. Good Cause verifies the account and the person authorised to act for the group.'] },
      { heading: 'Grants and sponsors', body: ['Many groups combine fundraising with community grants and local business sponsorship. Showing grant funders that the community has already contributed can strengthen an application.'] },
    ],
    faqs: [
      { q: 'Can a school or club fundraise on Good Cause?', a: 'Yes. The person applying must be authorised by the group, and funds are paid to the group’s verified bank account.' },
      { q: 'Can donors get a tax credit?', a: 'Only if the group is an approved donee organisation with Inland Revenue. Schools and registered charities often are. Check the IRD approved donee list.' },
    ],
    related: ['fundraising-ideas-nz', 'donation-tax-credits-nz', 'fundraising-rules-nz'],
  },
  {
    slug: 'online-fundraising-fees-nz',
    title: 'Online fundraising fees in New Zealand compared',
    metaTitle: 'Online fundraising fees NZ compared (2026)',
    description: 'What online fundraising platforms in New Zealand charge, how card fees work and how much of each donation actually reaches the cause.',
    keywords: ['fundraising fees NZ', 'crowdfunding fees NZ', 'Givealittle fees', 'cheapest fundraising platform NZ', 'donation platform fees', 'platform fee comparison'],
    updated: UPDATED,
    intro: 'Fundraising platforms usually charge in two ways: a platform fee taken from the donation and a card processing fee. Who pays the card fee makes a real difference to how much reaches the cause.',
    sections: [
      { heading: 'How fees work', body: ['A platform fee is the percentage the platform keeps. A card processing fee is what the payment provider charges to process the card. Some platforms take both from the donation, some ask the donor to pay the card fee on top.'] },
      { heading: 'Good Cause', body: ['Good Cause keeps 2.5% of each donation. The donor pays the card processing fee on top, so the cause receives 97.5% of the donation. On a $20 donation the donor pays $20.86 and the cause receives $19.50.'] },
      { heading: 'Givealittle', body: ['According to Givealittle’s own help page, it charges a 5% service fee (including GST) on the amount raised, deducted at payout, and donors paying by card pay a 1.5% fee on top. On a $20 card donation the donor pays $20.30 and the fundraiser receives $19.00. We checked this on 29 September 2026. Fees can change, so check their site for current pricing.'] },
      { heading: 'What to compare', body: ['Look at how much of each donation reaches the cause, what the donor pays in total, whether there are payout or setup fees, and how the platform checks campaigns.'], list: ['Percentage reaching the cause', 'Total cost to the donor', 'Setup, monthly or payout fees', 'How campaigns are verified', 'How quickly funds are paid out'] },
    ],
    faqs: [
      { q: 'Which fundraising platform has the lowest fees in NZ?', a: 'It depends on who pays the card fee. On Good Cause the cause receives 97.5% of each donation, because the donor pays the card fee on top.' },
      { q: 'Are there setup or payout fees on Good Cause?', a: 'No. There are no setup, monthly or standard payout fees.' },
    ],
    related: ['givealittle-alternative', 'how-to-fundraise-online-nz'],
    sources: [{ label: 'Givealittle: Our fee', url: 'https://givealittle.co.nz/help/help-support/knowledge-base/service-fee' }],
  },
  {
    slug: 'givealittle-alternative',
    title: 'Looking for a Givealittle alternative?',
    metaTitle: 'Givealittle alternative: Good Cause compared',
    description: 'An honest comparison of Good Cause and Givealittle for New Zealand fundraisers: fees, verification, payouts and which suits your cause.',
    keywords: ['Givealittle alternative', 'sites like Givealittle', 'Givealittle vs', 'NZ fundraising platform comparison', 'other fundraising sites NZ'],
    updated: UPDATED,
    intro: 'Givealittle is New Zealand’s best-known fundraising site. Good Cause is a newer, smaller alternative run by Webfit Solutions Limited. Good Cause is not affiliated with Givealittle. Here is how the two compare, so you can choose what suits your cause.',
    sections: [
      { heading: 'Fees', body: ['Good Cause keeps 2.5% of each donation and the donor pays the card fee, so the cause receives 97.5%. Givealittle’s help page states a 5% service fee including GST, with donors paying 1.5% on card donations (checked 29 September 2026). On a $20 card donation, the cause receives $19.50 on Good Cause and $19.00 on Givealittle. The donor pays $20.86 on Good Cause and $20.30 on Givealittle.'] },
      { heading: 'Verification', body: ['Every Good Cause campaign is reviewed by a person before it can accept donations, including checks on the fundraiser, the beneficiary and the bank account.'] },
      { heading: 'When Givealittle may suit you better', body: ['Givealittle is larger and well known, and it offers features Good Cause does not yet have, such as regular giving. If those matter most to you, it may be the better fit.'] },
      { heading: 'When Good Cause may suit you better', body: ['If you want more of each donation to reach the cause, a person reviewing your campaign, and direct contact with a small New Zealand team, Good Cause is worth considering.'] },
    ],
    faqs: [
      { q: 'Is Good Cause part of Givealittle?', a: 'No. Good Cause is operated by Webfit Solutions Limited and is not affiliated with Givealittle.' },
      { q: 'Can I move my fundraiser from another site?', a: 'You can start a new Good Cause campaign for the same cause. Tell supporters on your old page where to find the new one.' },
    ],
    related: ['online-fundraising-fees-nz', 'how-to-fundraise-online-nz'],
    sources: [{ label: 'Givealittle: Our fee', url: 'https://givealittle.co.nz/help/help-support/knowledge-base/service-fee' }],
  },
  {
    slug: 'donation-tax-credits-nz',
    title: 'Can I claim a tax credit on my donation?',
    metaTitle: 'Donation tax credits NZ: what qualifies and how to claim',
    description: 'How New Zealand donation tax credits work, which donations qualify, why gifts to individuals do not, and how to claim from Inland Revenue.',
    keywords: ['donation tax credit NZ', 'IRD donation rebate', 'are donations tax deductible NZ', 'claim donation receipt IRD', 'approved donee organisation'],
    updated: UPDATED,
    intro: 'In New Zealand you can claim a tax credit of one third of eligible donations, but only for donations to approved donee organisations. Most personal fundraisers do not qualify.',
    sections: [
      { heading: 'What qualifies', body: ['Inland Revenue lets individuals who are New Zealand tax residents claim one third of donations of $5 or more made to approved donee organisations, such as many registered charities, schools and kindergartens. The credit cannot be more than one third of your taxable income.'] },
      { heading: 'What does not qualify', body: ['Gifts to individuals, donations where you receive something in return, and non-cash gifts do not qualify. That means donations to a personal fundraiser, such as help for a family after a house fire, are not eligible.'] },
      { heading: 'How to claim', body: ['Keep your receipts. You can claim after the tax year ends on 31 March, through myIR, and you have up to four years to submit receipts.'] },
      { heading: 'Good Cause receipts', body: ['Good Cause emails a contribution receipt for every donation. It is a payment receipt, not a donation tax receipt, unless the campaign’s beneficiary is an approved donee organisation and says so on the campaign page.'] },
    ],
    faqs: [
      { q: 'Are donations to a Givealittle or Good Cause page tax deductible?', a: 'Only if the money goes to an approved donee organisation. Donations to individuals are not eligible.' },
      { q: 'What is the minimum donation for a tax credit?', a: 'Each donation must be $5 or more.' },
    ],
    related: ['school-and-club-fundraising', 'fundraising-rules-nz'],
    sources: [{ label: 'Inland Revenue: About donation tax credits', url: 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/individual-tax-credits/donation-tax-credits/about-donation-tax-credits' }],
  },
  {
    slug: 'fundraising-rules-nz',
    title: 'Fundraising rules in New Zealand',
    metaTitle: 'Fundraising rules NZ: raffles, collections and charities',
    description: 'The main rules for fundraising in New Zealand: raffles and gambling limits, street collections, registered charities, privacy and honest appeals.',
    keywords: ['fundraising rules NZ', 'raffle rules NZ', 'do I need a licence for a raffle NZ', 'street collection rules NZ', 'is it legal to fundraise NZ'],
    updated: UPDATED,
    intro: 'Most online fundraising in New Zealand is straightforward, but raffles, street collections and fundraising for other people have rules. This is a summary, not legal advice.',
    sections: [
      { heading: 'Raffles and prize draws', body: ['Raffles are gambling under the Gambling Act 2003. According to the Department of Internal Affairs, class 1 gambling, where turnover and total prizes are each $500 or less, does not need a licence, and the net proceeds must go to an authorised purpose. Larger raffles have more rules, and prizes over $5,000 generally need a licence. Check the DIA website before you run one.'] },
      { heading: 'Street collections', body: ['Councils control collecting money in public places. In Auckland, fundraising and collecting donations in council-controlled public places needs approval under the Public Trading, Events and Filming Bylaw 2022. Other councils have their own rules.'] },
      { heading: 'Do you need to be a registered charity?', body: ['No. You do not need to be a registered charity to fundraise. Registering with Charities Services has benefits, such as tax exemptions and eligibility to become an approved donee organisation, but it is not required for a personal or community fundraiser.'] },
      { heading: 'Be honest and use money as promised', body: ['Describe the cause accurately, use the money for what you said, and tell donors if plans change. Misleading appeals can breach the Fair Trading Act and may be a criminal offence.'] },
      { heading: 'Privacy', body: ['Only share personal or health information with permission. Donor details should be kept private and used only for the fundraiser.'] },
    ],
    faqs: [
      { q: 'Do I need a licence to run a raffle in NZ?', a: 'Not if turnover and total prizes are each $500 or less (class 1 gambling). Larger raffles have more rules, and prizes over $5,000 generally need a licence from the Department of Internal Affairs.' },
      { q: 'Is it legal to fundraise for a friend?', a: 'Yes, with their consent, as long as the money is used as described.' },
    ],
    related: ['fundraising-in-auckland', 'fundraise-for-someone-else', 'donation-tax-credits-nz'],
    sources: [
      { label: 'Department of Internal Affairs: The rules for running a gambling activity', url: 'https://www.dia.govt.nz/Services-Casino-and-Non-Casino-Gaming-The-Rules-for-Running-a-Gambling-Activity' },
      { label: 'Auckland Council: Public Trading, Events and Filming Bylaw 2022', url: 'https://www.aucklandcouncil.govt.nz/en/plans-policies-bylaws-reports-projects/bylaws/trading-events-public-places-bylaw.html' },
    ],
  },
  {
    slug: 'write-a-fundraising-page',
    title: 'How to write a fundraising page people want to share',
    metaTitle: 'How to write a fundraising page (with examples)',
    description: 'Tips and a simple template for writing a fundraising page: title, summary, story, costs, photos and updates that help people give and share.',
    keywords: ['how to write a fundraising page', 'fundraising page examples', 'fundraiser story template', 'what to write on a fundraiser', 'fundraising message examples'],
    updated: UPDATED,
    intro: 'People give when they understand the situation, trust the person asking and can see what their money will do. Your page needs to do those three things in plain words.',
    sections: [
      { heading: 'A title that says who and what', body: ['Good: "Help Mere and her kids rebuild after the Tairāwhiti floods." Weak: "Please help!!!" Include a name, a place and the need.'] },
      { heading: 'A two-sentence summary', body: ['This is often all people read before deciding. Say what happened and what the money is for.'] },
      { heading: 'The story', body: ['Explain what happened, when, and who you are to the person you are helping. Use specific facts. Keep medical or personal details to what is needed and agreed.'] },
      { heading: 'What the money will pay for', body: ['List the costs. It shows you have thought it through and helps donors trust the target.'], list: ['Rent for 6 weeks: $3,600', 'Replacement school uniforms and bags: $450', 'Travel to hospital appointments: $750'] },
      { heading: 'Photos', body: ['Use a real, clear photo you took or have permission to use. Do not use AI-generated images to represent real people or events.'] },
      { heading: 'Updates and thank-yous', body: ['Post an update when you reach milestones and when the money is spent. Thank donors publicly (without naming anyone who chose to give anonymously).'] },
    ],
    faqs: [
      { q: 'How long should a fundraising page be?', a: 'Long enough to explain the situation and the costs, usually 200 to 500 words. Put the most important facts first.' },
      { q: 'Should I include a target?', a: 'Yes. A realistic target based on real costs helps people decide how much to give.' },
    ],
    related: ['how-to-fundraise-online-nz', 'medical-fundraising-nz'],
  },
  {
    slug: 'fundraise-for-someone-else',
    title: 'How to fundraise for someone else',
    metaTitle: 'Fundraising for a friend or family member in NZ',
    description: 'How to set up a fundraiser for a friend, family member or neighbour in New Zealand: getting consent, who receives the money and keeping donors informed.',
    keywords: ['fundraiser for a friend', 'fundraise for family member NZ', 'raise money for someone else', 'set up a fundraiser for someone', 'help a friend financially'],
    updated: UPDATED,
    intro: 'Many fundraisers are started by a friend, relative or colleague on someone else’s behalf. That is a kind thing to do, and it comes with a responsibility to get it right.',
    sections: [
      { heading: 'Ask first', body: ['The person you are helping must agree to the fundraiser and to what you share about them. Good Cause records their consent before donations are enabled.'] },
      { heading: 'Decide who receives the money', body: ['The safest option is for funds to go directly to the person you are helping, or to a trusted person they choose. Good Cause verifies the bank account and the beneficiary before any payout.'] },
      { heading: 'Be open about your role', body: ['Say who you are and how you know them. Donors trust a fundraiser more when they understand the relationship.'] },
      { heading: 'Keep everyone informed', body: ['Post updates so donors know the money reached the person and how it helped.'] },
    ],
    faqs: [
      { q: 'Can the money go into my account and I pass it on?', a: 'We prefer payouts to go directly to the beneficiary. Where that is not possible, we verify the arrangement and the beneficiary’s consent.' },
      { q: 'What if the person does not want a fundraiser?', a: 'Then do not start one. Consent is required.' },
    ],
    related: ['medical-fundraising-nz', 'emergency-and-disaster-fundraising', 'write-a-fundraising-page'],
  },
  {
    slug: 'funeral-fundraising-nz',
    title: 'Raising money for a funeral or tangihanga',
    metaTitle: 'Funeral fundraising in NZ: help with funeral costs',
    description: 'How to set up a respectful fundraiser for funeral, tangihanga, repatriation or memorial costs in New Zealand, and what support to check first.',
    keywords: ['funeral fundraiser NZ', 'help with funeral costs NZ', 'tangihanga costs', 'raise money for a funeral', 'repatriation fundraiser NZ', 'memorial fundraiser'],
    updated: UPDATED,
    intro: 'Funeral costs often arrive at the hardest time. A simple, respectful fundraiser lets friends, whānau and colleagues help, including those who cannot attend.',
    sections: [
      { heading: 'Check support first', body: ['Work and Income may help with funeral costs for people on low incomes, and ACC may help if the death followed an injury. Knowing this helps you set an honest target.'] },
      { heading: 'Agree with the family', body: ['Make sure the immediate family agrees to the fundraiser, the wording and any photos. Decide together who will receive the funds.'] },
      { heading: 'Keep it simple', body: ['Say who has died, when the service will be, and what the money will cover, such as the funeral director, travel for whānau, or repatriation. Share service details only if the family wants them public.'] },
      { heading: 'Say thank you', body: ['After the service, post a short update thanking supporters and letting them know how the money helped.'] },
    ],
    faqs: [
      { q: 'How quickly can a funeral fundraiser go live?', a: 'As soon as the review is complete. Having the family’s agreement, ID and bank details ready helps.' },
      { q: 'Can we raise money to bring someone home from overseas?', a: 'Yes. Repatriation fundraisers are accepted with evidence of the costs and the family’s consent.' },
    ],
    related: ['fundraise-for-someone-else', 'write-a-fundraising-page'],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug) || null;
}
