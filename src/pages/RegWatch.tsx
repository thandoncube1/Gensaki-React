import { useState, useRef, useEffect } from 'react';
import { CTAButton, HeroEyebrow, HeaderNav } from '../components/HeaderNav';
import { PageFooter } from '../components/PageFooter';

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  bg:    '#FBFBF8',
  ink:   '#0E1410',
  mute:  '#6B7368',
  line:  '#E6E8E2',
  cyan:  '#74E0FF',
  mint1: '#E7F6EC',
  mint2: '#F1FBF3',
} as const;

const B = {
  bg:   '#F7FAFC',
  card: '#FFFFFF',
  p:    '#121C29',
  s:    '#59697A',
  bd:   '#E8EDF2',
  bl:   '#1C63FA',
  gr:   '#00AD47',
  am:   '#D98C00',
  pu:   '#A64DCC',
} as const;

const geist = '"Geist", system-ui, sans-serif';
const mono  = '"JetBrains Mono", "Courier New", monospace';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RadarItem {
  id: string; ymd: number; headline: string; authority: string;
  authorityShort: string; jurisdiction: string; docType: string;
  summary: string; srtRead: string; quote: string; interpretation: string;
  stakeholders: string[]; lifecycle: string[]; workstreams: string[];
  categories: string[]; openQuestions: string[]; nextAction: string;
  validationRequired: boolean; tags: string[]; source: string;
}
interface RadarAug {
  effectiveYMD: number; consultationYMD: number; supersedes: string;
  relatedIds: string[]; interviewQuestions: string[]; followUps: string[];
  publication: string; author: string; articleURL: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TODAY_YMD = 20260613;

const radarItems: RadarItem[] = [
  {
    id: 'EU-2021-04-06-STS-SYNTH', ymd: 20210406,
    headline: 'EU creates STS framework for on-balance-sheet synthetic securitisation',
    authority: 'European Parliament and Council / Official Journal', authorityShort: 'EU', jurisdiction: 'EU',
    docType: 'Regulation',
    summary: 'Regulation (EU) 2021/557 amended the EU Securitisation Regulation to create a specific framework for simple, transparent and standardised on-balance-sheet synthetic securitisations.',
    srtRead: 'This is the core EU legal foundation for STS synthetic SRT. It turns synthetic risk transfer from a bespoke supervisory exercise into a regulated category with specific eligibility and disclosure conditions.',
    quote: '',
    interpretation: 'For EU originators, the STS synthetic framework is a baseline design constraint: portfolio selection, credit protection, loss settlement, premiums, calls and disclosure all need to be checked against it before claiming STS treatment.',
    stakeholders: ['Bank originators & issuers', 'Bank regulatory advisors', 'Investors & protection sellers', 'Lawyers & transaction counsel'],
    lifecycle: ['Mandate & strategic trigger', 'Structuring & modelling', 'Supervisory engagement', 'Documentation & legal execution'],
    workstreams: ['Regulatory capital', 'Structuring', 'Documentation', 'Reporting'],
    categories: ['Significant risk transfer rules', 'Synthetic securitisation', 'Eligibility & structural constraints', 'Supervisory approval / engagement'],
    openQuestions: ['Which reference pools can realistically meet STS synthetic requirements?', 'How should originators evidence STS compliance in supervisory files?', 'Which structures require transaction-specific counsel review before relying on STS treatment?'],
    nextAction: 'Use Regulation 2021/557 as the core EU eligibility checklist for synthetic SRT template design.',
    validationRequired: true, tags: ['EU', 'STS synthetic', 'Securitisation Regulation'], source: 'eur-lex.europa.eu',
  },
  {
    id: 'EU-2021-04-06-STS-CONTROLS', ymd: 20210406,
    headline: 'EU sets STS synthetic controls for credit protection, premiums, calls and SES',
    authority: 'European Parliament and Council / Official Journal', authorityShort: 'EU', jurisdiction: 'EU',
    docType: 'Regulation',
    summary: 'Regulation (EU) 2021/557 introduced synthetic-specific safeguards, including standards around loss settlement, third-party verification, credit protection premiums, early termination, complex call clauses, synthetic excess spread and eligible protection/collateral.',
    srtRead: 'This is not a market article; it is a hard rulebook constraint. Features that weaken true risk transfer, create hidden support, or make protection unstable can jeopardise STS eligibility and capital relief.',
    quote: '',
    interpretation: 'The practical platform implication is a structural poison-pill screen: non-contingent premiums, problematic calls, weak collateral, uncertain loss settlement and poorly disclosed SES should be flagged before mandate approval.',
    stakeholders: ['Bank originators & issuers', 'Lawyers & transaction counsel', 'Bank regulatory advisors', 'Investors & protection sellers'],
    lifecycle: ['Structuring & modelling', 'Documentation & legal execution', 'Supervisory engagement', 'Post-close monitoring & reporting'],
    workstreams: ['Structuring', 'Documentation', 'Regulatory capital', 'Surveillance'],
    categories: ['Eligibility & structural constraints', 'Legal enforceability & documentation', 'Significant risk transfer rules', 'Synthetic securitisation'],
    openQuestions: ['Do any proposed premium mechanics undermine effective risk transfer?', 'Are termination rights limited to permitted regulatory or tax events?', 'Is funded or unfunded protection supported by eligible providers or collateral?'],
    nextAction: 'Add a rule-based STS synthetic structural-controls checklist to the deal-screening workflow.',
    validationRequired: true, tags: ['EU', 'STS controls', 'Credit protection', 'Synthetic excess spread'], source: 'eur-lex.europa.eu',
  },
  {
    id: 'EU-2021-04-06-CRR270-STS', ymd: 20210406,
    headline: 'EU amends CRR Article 270 for senior positions in STS on-balance-sheet securitisations',
    authority: 'European Parliament and Council / Official Journal', authorityShort: 'EU', jurisdiction: 'EU',
    docType: 'CRR amendment',
    summary: 'Regulation (EU) 2021/558 replaced CRR Article 270 and permits an originator institution to calculate risk-weighted exposure amounts for qualifying senior positions in STS on-balance-sheet securitisations under the specified securitisation approaches.',
    srtRead: 'This is the prudential capital leg of EU STS synthetic SRT. It links the STS synthetic framework to risk-weighted asset treatment for retained senior positions.',
    quote: '',
    interpretation: 'The capital model should not treat STS status and Article 270 treatment as automatic. The transaction must satisfy both the Securitisation Regulation STS criteria and the CRR Article 270 conditions.',
    stakeholders: ['Bank originators & issuers', 'Bank regulatory advisors', 'Internal product / platform', 'Investors & protection sellers'],
    lifecycle: ['Structuring & modelling', 'Internal governance & approvals', 'Supervisory engagement', 'Post-close monitoring & reporting'],
    workstreams: ['Regulatory capital', 'Structuring', 'Reporting'],
    categories: ['RWA & capital relief mechanics', 'Securitisation capital treatment', 'Synthetic securitisation', 'Significant risk transfer rules'],
    openQuestions: ['Does the retained senior position qualify under Article 270?', 'Which securitisation approach applies to the retained senior position?', 'How should the platform evidence Article 270 eligibility in the capital memo?'],
    nextAction: 'Map Article 270 conditions into the EU capital-relief calculator and evidence pack.',
    validationRequired: true, tags: ['EU', 'CRR', 'Article 270', 'Senior position', 'STS synthetic'], source: 'eur-lex.europa.eu',
  },
  {
    id: 'EU-2022-04-10-SES', ymd: 20220410,
    headline: 'EU applies dedicated prudential treatment for synthetic excess spread',
    authority: 'European Parliament and Council / Official Journal', authorityShort: 'EU', jurisdiction: 'EU',
    docType: 'CRR amendment',
    summary: 'Regulation (EU) 2021/558 introduced a dedicated prudential treatment for synthetic excess spread and provided that the relevant Article 1 points would apply from 10 April 2022.',
    srtRead: 'SES can materially affect whether risk transfer is real or artificially enhanced. The EU treatment is directly relevant to capital relief, tranche attachment/detachment economics and investor loss exposure.',
    quote: '',
    interpretation: 'Any EU synthetic SRT with contractual SES should be treated as a capital and structuring hot spot. The platform should calculate, disclose and separately track SES exposure rather than burying it in economics.',
    stakeholders: ['Bank originators & issuers', 'Bank regulatory advisors', 'Investors & protection sellers', 'Lawyers & transaction counsel'],
    lifecycle: ['Structuring & modelling', 'Internal governance & approvals', 'Supervisory engagement', 'Post-close monitoring & reporting'],
    workstreams: ['Regulatory capital', 'Structuring', 'Reporting', 'Surveillance'],
    categories: ['RWA & capital relief mechanics', 'Synthetic securitisation', 'Eligibility & structural constraints', 'Disclosure & reporting templates'],
    openQuestions: ['Is SES contractually designated in the transaction?', 'What is the SES exposure value under the applicable CRR method?', 'Could SES make the investor loss position too remote to evidence meaningful transfer?'],
    nextAction: 'Add SES detection, exposure-value calculation and disclosure fields to the EU deal template.',
    validationRequired: true, tags: ['EU', 'Synthetic excess spread', 'SES', 'CRR', 'Capital treatment'], source: 'eur-lex.europa.eu',
  },
  {
    id: 'EU-2021-04-06-STS-REPORTING', ymd: 20210406,
    headline: 'EU adds reporting for originated STS on-balance-sheet securitisations and asset-class breakdowns',
    authority: 'European Parliament and Council / Official Journal', authorityShort: 'EU', jurisdiction: 'EU',
    docType: 'CRR reporting requirement',
    summary: 'Regulation (EU) 2021/558 amended CRR Article 430 so that securitisation own-funds reporting includes information on originated STS on-balance-sheet securitisations and the asset-class breakdown of the underlying assets.',
    srtRead: 'This makes STS synthetic SRT a reporting data problem, not only a structuring problem. Originators need clean transaction, tranche and asset-class data after closing.',
    quote: '',
    interpretation: 'A platform should capture reporting-ready data at issuance because retrofitting asset-class and capital fields after close creates operational risk.',
    stakeholders: ['Bank originators & issuers', 'Internal product / platform', 'Bank regulatory advisors', 'Reporters & market analysts'],
    lifecycle: ['Closing & settlement', 'Post-close monitoring & reporting', 'Supervisory engagement'],
    workstreams: ['Reporting', 'Surveillance', 'Platform operations', 'Regulatory capital'],
    categories: ['Disclosure & reporting templates', 'Synthetic securitisation', 'Securitisation capital treatment', 'Post-close monitoring / credit events'],
    openQuestions: ['Which fields are needed at origination to satisfy Article 430 reporting?', 'How should asset-class breakdowns be normalised across issuer data tapes?', 'What audit trail is needed for revisions after replenishment or amortisation?'],
    nextAction: 'Add Article 430 reporting fields to the post-close data model for EU STS synthetic deals.',
    validationRequired: true, tags: ['EU', 'Article 430', 'Reporting', 'STS synthetic'], source: 'eur-lex.europa.eu',
  },
  {
    id: 'FED-2023-09-28-CLN', ymd: 20230928,
    headline: 'Federal Reserve clarifies capital treatment path for credit-linked notes and synthetic securitisation',
    authority: 'Federal Reserve', authorityShort: 'Fed', jurisdiction: 'US',
    docType: 'Regulatory FAQ / interpretation',
    summary: "The Federal Reserve's Regulation Q FAQ explains when CLN structures may be recognised under synthetic securitisation rules, states that directly issued CLNs generally do not automatically qualify, and describes a reservation-of-authority request path.",
    srtRead: 'This is the key US supervisory interpretation for bank-issued CLNs used as SRT. It distinguishes SPV/guarantee or credit-derivative structures from directly issued CLNs and makes supervisory approval a practical gating item.',
    quote: '',
    interpretation: 'For US-originated CLN transactions, the platform should not assume SSFA eligibility or RWA relief. The first screen is whether the structure satisfies the synthetic securitisation definition and operational CRM criteria, or needs a reservation-of-authority request.',
    stakeholders: ['Bank originators & issuers', 'Bank regulatory advisors', 'Lawyers & transaction counsel', 'Investors & protection sellers'],
    lifecycle: ['Mandate & strategic trigger', 'Structuring & modelling', 'Supervisory engagement', 'Internal governance & approvals'],
    workstreams: ['Regulatory capital', 'Structuring', 'Documentation'],
    categories: ['Significant risk transfer rules', 'Credit risk mitigation', 'Bank-issued CLN treatment', 'Supervisory approval / engagement'],
    openQuestions: ['Is the CLN directly issued or issued through an SPV with recognised collateral?', 'Does the transaction include a guarantee or credit derivative documented in a form that satisfies the capital rule?', 'Is a reservation-of-authority request required before capital relief can be recognised?'],
    nextAction: 'Add a US CLN gating checklist before SSFA modelling or issuer-facing capital-relief estimates.',
    validationRequired: true, tags: ['US', 'Federal Reserve', 'CLN', 'SSFA', 'Synthetic securitisation'], source: 'federalreserve.gov',
  },
  {
    id: 'OSFI-2025-09-11-CAR6-SRT', ymd: 20250911,
    headline: 'OSFI CAR 2026 Chapter 6 sets significant risk-transfer recognition test for securitisation',
    authority: 'Office of the Superintendent of Financial Institutions', authorityShort: 'OSFI', jurisdiction: 'Canada',
    docType: 'Guideline',
    summary: "OSFI's CAR 2026 Chapter 6 states that an originating institution may exclude securitised exposures from risk-weighted assets only if operational requirements are met, including transfer of significant credit risk and a quantitative test requiring retained capital to be no more than 40% of the pre-securitisation capital requirement.",
    srtRead: 'This is a direct Canadian SRT recognition threshold. For platform purposes, Canadian capital relief should be gated by both the 60% RWA-reduction test and OSFI reviewable policies/procedures.',
    quote: '',
    interpretation: 'The Canadian workflow should force originators to document ongoing SRT assessment, retained-capital calculations and OSFI-reviewable evidence before treating securitised exposures as removed from RWA.',
    stakeholders: ['Bank originators & issuers', 'Bank regulatory advisors', 'Internal product / platform', 'Lawyers & transaction counsel'],
    lifecycle: ['Portfolio screening & selection', 'Structuring & modelling', 'Internal governance & approvals', 'Supervisory engagement'],
    workstreams: ['Regulatory capital', 'Structuring', 'Platform operations'],
    categories: ['Significant risk transfer rules', 'Securitisation capital treatment', 'RWA & capital relief mechanics', 'Supervisory approval / engagement'],
    openQuestions: ['Does the retained-capital calculation show at least a 60% RWA reduction?', 'Are ongoing SRT assessment policies documented and OSFI-reviewable?', 'How should IRB expected-loss adjustments be reflected in the test?'],
    nextAction: 'Build the OSFI 40% retained-capital / 60% RWA-reduction test into the Canada capital-relief workflow.',
    validationRequired: true, tags: ['Canada', 'OSFI', 'CAR 2026', 'SRT test', 'Capital relief'], source: 'osfi-bsif.gc.ca',
  },
  {
    id: 'OSFI-2025-09-11-CAR6-SYNTH', ymd: 20250911,
    headline: 'OSFI CAR 2026 Chapter 6 defines synthetic securitisation operational requirements',
    authority: 'Office of the Superintendent of Financial Institutions', authorityShort: 'OSFI', jurisdiction: 'Canada',
    docType: 'Guideline',
    summary: "OSFI's CAR 2026 Chapter 6 recognises synthetic securitisation CRM for risk-based capital only if conditions are met, including eligible collateral or guarantors, significant credit-risk transfer, no clauses that limit risk transfer, legal enforceability opinions and compliant clean-up calls.",
    srtRead: 'This is the Canadian synthetic SRT poison-pill checklist. Terms that cap protection, terminate protection on deterioration, require pool improvement or increase originator support can impair recognition.',
    quote: '',
    interpretation: 'For Canadian synthetic transactions, legal enforceability and clause-level review are not optional. The platform should flag prohibited protection-limiting features before transaction approval.',
    stakeholders: ['Bank originators & issuers', 'Bank regulatory advisors', 'Lawyers & transaction counsel', 'Investors & protection sellers'],
    lifecycle: ['Structuring & modelling', 'Documentation & legal execution', 'Supervisory engagement', 'Post-close monitoring & reporting'],
    workstreams: ['Structuring', 'Documentation', 'Regulatory capital', 'Surveillance'],
    categories: ['Synthetic securitisation', 'Eligibility & structural constraints', 'Legal enforceability & documentation', 'Credit risk mitigation'],
    openQuestions: ['Are all protection providers, collateral arrangements and guarantors eligible under OSFI CRM rules?', 'Does the contract contain termination, threshold, cost-step-up or pool-quality clauses that limit risk transfer?', 'Has counsel delivered an enforceability opinion covering the protection contract?'],
    nextAction: 'Create an OSFI synthetic operational-requirements checklist for the Canadian deal intake flow.',
    validationRequired: true, tags: ['Canada', 'OSFI', 'Synthetic securitisation', 'CRM', 'Legal enforceability'], source: 'osfi-bsif.gc.ca',
  },
];

const defaultAug: RadarAug = {
  effectiveYMD: 0, consultationYMD: 0, supersedes: '', relatedIds: [],
  interviewQuestions: [], followUps: [], publication: '', author: '', articleURL: '',
};

const radarAug: Record<string, RadarAug> = {
  'EU-2021-04-06-STS-SYNTH': {
    ...defaultAug, effectiveYMD: 20210409,
    relatedIds: ['EU-2021-04-06-STS-CONTROLS', 'EU-2021-04-06-CRR270-STS', 'EU-2022-04-10-SES', 'EU-2021-04-06-STS-REPORTING'],
    interviewQuestions: [
      'Ask EU originators: which planned synthetic transactions are intended to qualify as STS on-balance-sheet securitisations?',
      'Ask counsel: which STS criteria are most likely to create structuring friction in the current pipeline?',
      'Ask investors: does STS status change pricing, diligence scope or eligibility for the protection-selling mandate?',
    ],
    followUps: [
      'Translate Regulation 2021/557 into a transaction-level STS synthetic eligibility checklist.',
      'Separate hard legal criteria from supervisor-facing evidence and platform workflow controls.',
    ],
    publication: 'EUR-Lex / Official Journal',
    articleURL: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0557',
  },
  'EU-2021-04-06-STS-CONTROLS': {
    ...defaultAug, effectiveYMD: 20210409,
    relatedIds: ['EU-2021-04-06-STS-SYNTH', 'EU-2022-04-10-SES', 'OSFI-2025-09-11-CAR6-SYNTH'],
    interviewQuestions: [
      'Ask transaction counsel: which premium, termination, loss-settlement or collateral terms would block STS synthetic treatment?',
      'Ask originators: are any pipeline deals using non-contingent premiums, complex calls or SES mechanics that need redesign?',
      'Ask investors: do stricter protection-quality standards narrow the eligible investor or collateral universe?',
    ],
    followUps: [
      'Add prohibited-premium and call-feature checks to the structural poison-pill screen.',
      'Create a separate evidence field for eligible funded and unfunded credit protection.',
    ],
    publication: 'EUR-Lex / Official Journal',
    articleURL: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0557',
  },
  'EU-2021-04-06-CRR270-STS': {
    ...defaultAug, effectiveYMD: 20210409,
    relatedIds: ['EU-2021-04-06-STS-SYNTH', 'EU-2022-04-10-SES', 'EU-2021-04-06-STS-REPORTING'],
    interviewQuestions: [
      'Ask capital teams: what documentation proves that the retained senior position qualifies for Article 270 treatment?',
      'Ask supervisors: where do Article 270 eligibility questions most often arise in practice?',
      'Ask originators: does STS synthetic treatment materially change deal economics versus non-STS synthetic SRT?',
    ],
    followUps: [
      'Map Article 270 requirements into the EU capital model assumptions sheet.',
      'Add a validation flag whenever a model assumes Article 270 treatment before legal/regulatory sign-off.',
    ],
    publication: 'EUR-Lex / Official Journal',
    articleURL: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0558',
  },
  'EU-2022-04-10-SES': {
    ...defaultAug, effectiveYMD: 20220410,
    relatedIds: ['EU-2021-04-06-STS-SYNTH', 'EU-2021-04-06-STS-CONTROLS', 'EU-2021-04-06-CRR270-STS'],
    interviewQuestions: [
      'Ask EU originators: do any synthetic SRT structures designate excess spread contractually to absorb losses?',
      'Ask capital teams: how is SES exposure value calculated and stored for regulatory reporting?',
      'Ask investors: does SES make investor loss exposure too remote to support a robust SRT conclusion?',
    ],
    followUps: [
      'Build SES-specific fields into the structuring model and data tape.',
      'Require counsel/regulatory review where SES is present in an EU STS synthetic deal.',
    ],
    publication: 'EUR-Lex / Official Journal',
    articleURL: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0558',
  },
  'EU-2021-04-06-STS-REPORTING': {
    ...defaultAug, effectiveYMD: 20210409,
    relatedIds: ['EU-2021-04-06-CRR270-STS', 'EU-2021-04-06-STS-SYNTH'],
    interviewQuestions: [
      'Ask reporting teams: which Article 430 fields are not captured in the current post-close surveillance workflow?',
      'Ask originators: can asset-class breakdowns be reconciled from issuance through replenishment and amortisation?',
      'Ask platform owners: should reporting fields be mandatory at deal setup rather than collected after closing?',
    ],
    followUps: [
      'Add Article 430 reporting fields to the EU post-close data model.',
      'Create audit trail requirements for asset-class breakdown changes after close.',
    ],
    publication: 'EUR-Lex / Official Journal',
    articleURL: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0558',
  },
  'FED-2023-09-28-CLN': {
    ...defaultAug,
    relatedIds: ['OSFI-2025-09-11-CAR6-SYNTH'],
    interviewQuestions: [
      'Ask US bank originators: is the proposed CLN directly issued or issued through an SPV with recognised collateral?',
      'Ask counsel: does the structure include a guarantee or credit derivative satisfying the capital rule\'s synthetic securitisation requirements?',
      'Ask supervisory contacts: is a reservation-of-authority request needed before modelling SSFA capital relief?',
    ],
    followUps: [
      'Add a US CLN structure-type gate before capital-relief estimates are shown.',
      'Create a reservation-of-authority workflow step for directly issued CLNs.',
    ],
    publication: 'Federal Reserve',
    articleURL: 'https://www.federalreserve.gov/supervisionreg/legalinterpretations/reg-q-frequently-asked-questions.htm',
  },
  'OSFI-2025-09-11-CAR6-SRT': {
    ...defaultAug, effectiveYMD: 20260101,
    relatedIds: ['OSFI-2025-09-11-CAR6-SYNTH', 'FED-2023-09-28-CLN'],
    interviewQuestions: [
      'Ask Canadian originators: which reference pools can pass the 60% RWA-reduction threshold after retained securitisation exposures are capitalised?',
      'Ask OSFI-facing regulatory teams: what evidence will be maintained to prove significant credit-risk transfer on an ongoing basis?',
      'Ask model owners: how are retained exposures, caps, floors and IRB expected-loss adjustments reflected in the retained-capital test?',
    ],
    followUps: [
      'Implement the OSFI retained-capital test as a required Canada workflow calculation.',
      'Add an evidence checklist for OSFI-reviewable SRT policies and procedures.',
    ],
    publication: 'OSFI',
    articleURL: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/capital-adequacy-requirements-car-2026-chapter-6-securitization',
  },
  'OSFI-2025-09-11-CAR6-SYNTH': {
    ...defaultAug, effectiveYMD: 20260101,
    relatedIds: ['OSFI-2025-09-11-CAR6-SRT', 'EU-2021-04-06-STS-CONTROLS', 'FED-2023-09-28-CLN'],
    interviewQuestions: [
      'Ask transaction counsel: does the synthetic protection contract include any clause that limits credit-risk transfer or enforceability?',
      'Ask originators: are protection providers, guarantors and collateral arrangements eligible under OSFI CRM rules?',
      'Ask investors: do clean-up call, early amortisation or pool-quality provisions change investor exposure after closing?',
    ],
    followUps: [
      'Create a Canada-specific synthetic CRM eligibility checklist.',
      'Flag protection-limiting clauses as validation-required before deal approval.',
    ],
    publication: 'OSFI',
    articleURL: 'https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/capital-adequacy-requirements-car-2026-chapter-6-securitization',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MO = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const jurisShort: Record<string, string> = {
  'EU': 'EU', 'UK': 'UK', 'US': 'US', 'Canada': 'CA',
  'Switzerland': 'CH', 'Global / Basel': 'BIS', 'Global / IFRS': 'IFRS', 'Global': 'GBL',
};

function ymdToDays(v: number): number {
  const y = Math.floor(v / 10000), m = Math.floor((v / 100) % 100), d = v % 100;
  return y * 372 + m * 31 + d;
}
function ymdLabel(ymd: number, short = false): string {
  const y = Math.floor(ymd / 10000), m = Math.floor((ymd / 100) % 100), d = ymd % 100;
  return short ? `${d} ${MO[m]}` : `${d} ${MO[m]} ${y}`;
}
function ageLabel(ymd: number): string {
  const diff = ymdToDays(TODAY_YMD) - ymdToDays(ymd);
  if (diff <= 0) return 'today';
  if (diff === 1) return '1d ago';
  if (diff < 30) return `${diff}d ago`;
  return ymdLabel(ymd, true);
}
function countdownLabel(ymd: number): string {
  const diff = ymdToDays(ymd) - ymdToDays(TODAY_YMD);
  if (diff < 0) return 'passed';
  if (diff === 0) return 'today';
  if (diff < 31) return `in ${diff}d`;
  return `in ${Math.floor(diff / 31)}mo`;
}
function aug(id: string): RadarAug { return radarAug[id] ?? defaultAug; }
function itemFor(id: string): RadarItem | undefined { return radarItems.find(r => r.id === id); }
function dateChipText(id: string): string | null {
  const a = aug(id);
  if (a.consultationYMD > 0) return `Comment closes ${ymdLabel(a.consultationYMD, true)}`;
  if (a.effectiveYMD > 0) return `Effective ${ymdLabel(a.effectiveYMD)}`;
  return null;
}
function validationDomains(item: RadarItem): string[] {
  const d: string[] = [];
  const c = item.categories.join(' | ');
  if (c.includes('capital') || c.includes('RWA') || c.includes('Basel')) d.push('Regulatory capital treatment');
  if (c.includes('Supervisory')) d.push('Supervisory approval likelihood');
  if (c.includes('Legal')) d.push('Legal enforceability');
  if (c.includes('Accounting')) d.push('Accounting treatment');
  if (c.includes('Investor')) d.push('Investor eligibility');
  if (item.tags.includes('CLN') || item.headline.toLowerCase().includes('cln')) d.push('Bank-issued CLN treatment');
  if (item.jurisdiction === 'Canada') d.push('OSFI / FSRA implications');
  if (c.includes('Cross-border')) d.push('Cross-border conclusions');
  return d;
}
function matches(item: RadarItem, q: string): boolean {
  if (!q) return true;
  const hay = [item.headline, item.summary, item.srtRead, item.interpretation,
    item.authority, item.docType, item.jurisdiction, ...item.tags, ...item.categories, ...item.workstreams]
    .join(' ').toLowerCase();
  return hay.includes(q);
}

// ─── Micro components ─────────────────────────────────────────────────────────

function Bdg({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 999,
      background: color + '20', fontSize: 10, fontWeight: 700,
      color, fontFamily: mono, letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function SecCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: B.card, borderRadius: 10, border: `1px solid ${B.bd}`, overflow: 'hidden' }}>
      <div style={{
        padding: '14px 16px 11px', display: 'flex', gap: 8, alignItems: 'center',
        borderBottom: `1px solid ${B.bd}`,
      }}>
        <span style={{ fontSize: 8, color: B.bl }}>■</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: B.p, fontFamily: geist }}>{title}</span>
      </div>
      <div style={{ padding: '12px 16px 16px' }}>{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: B.gr, fontFamily: mono, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>›</span>
          <span style={{ fontSize: 14, color: B.p, fontFamily: geist, lineHeight: 1.5 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function ChipFlow({ items, ghost }: { items: string[]; ghost: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((s, i) => (
        <span key={i} style={{
          fontSize: 11, fontWeight: 600, fontFamily: mono,
          color: ghost ? B.s : 'rgb(18, 28, 67)',
          background: ghost ? B.bg : 'rgb(230, 235, 245)',
          padding: '4px 9px', borderRadius: 5,
          border: ghost ? `1px solid ${B.bd}` : 'none',
        }}>
          {s}
        </span>
      ))}
    </div>
  );
}

// ─── SectionIndicator ─────────────────────────────────────────────────────────

function SectionIndicator({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[0, 1].map(i => (
        <div
          key={i}
          onClick={() => onSelect(i)}
          style={{
            width: i === active ? 22 : 14,
            height: 3,
            borderRadius: 999,
            background: i === active ? C.cyan : '#1C63FA',
            boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
            cursor: 'pointer',
            transition: 'width 0.25s ease-out, background 0.25s ease-out',
          }}
        />
      ))}
    </div>
  );
}

// ─── ItemCard ─────────────────────────────────────────────────────────────────

function ItemCard({
  item, compact, isSaved, onToggleSave, onOpen,
}: {
  item: RadarItem; compact: boolean; isSaved: boolean;
  onToggleSave: () => void; onOpen: () => void;
}) {
  const dc = dateChipText(item.id);
  return (
    <div
      onClick={onOpen}
      style={{
        padding: 16, background: B.card, borderRadius: 10,
        border: `1px solid ${B.bd}`, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: B.s }}>
          {item.authorityShort}
        </span>
        <span style={{ color: B.bd }}>·</span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: 'rgb(18, 36, 107)',
          background: 'rgb(230, 235, 245)', padding: '2px 6px', borderRadius: 4,
        }}>
          {jurisShort[item.jurisdiction] ?? item.jurisdiction}
        </span>
        <span style={{ color: B.bd }}>·</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: B.s }}>{item.docType}</span>
        <span style={{ color: B.bd }}>·</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: B.s + 'B3' }}>{ageLabel(item.ymd)}</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
            fontSize: 13, color: isSaved ? B.bl : B.s + '8C',
            fontFamily: geist, fontWeight: isSaved ? 700 : 400,
          }}
          title={isSaved ? 'Unsave' : 'Save'}
        >
          {isSaved ? '⊡' : '⊟'}
        </button>
      </div>

      {/* Headline */}
      <div style={{ fontSize: 16, fontWeight: 700, color: B.p, fontFamily: geist, lineHeight: 1.4 }}>
        {item.headline}
      </div>

      {/* Summary */}
      {!compact && (
        <div style={{ fontSize: 13, color: B.s, fontFamily: geist, lineHeight: 1.55 }}>
          {item.summary}
        </div>
      )}

      {/* SRT READ block */}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        padding: 12, background: B.gr + '0F',
        borderLeft: `3px solid ${B.gr}`, borderRadius: 6,
      }}>
        <span style={{
          fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.6px',
          color: B.gr, width: 70, flexShrink: 0, paddingTop: 2,
        }}>
          SRT READ
        </span>
        <span style={{ fontSize: 12.5, color: B.p, fontFamily: geist, lineHeight: 1.5 }}>
          {item.srtRead}
        </span>
      </div>

      {/* Chips */}
      {!compact && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {dc && <Bdg label={dc} color={B.am} />}
          {item.tags.slice(0, 3).map((t, i) => (
            <span key={i} style={{
              fontFamily: mono, fontSize: 10, color: B.s,
              padding: '3px 8px', background: B.bg, borderRadius: 5,
              border: `1px solid ${B.bd}`,
            }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

function FilterBar({
  juris, lifecycle, query,
  presentJuris, presentLifecycle,
  onJuris, onLifecycle, onQuery, onClear,
}: {
  juris: string | null; lifecycle: string | null; query: string;
  presentJuris: string[]; presentLifecycle: string[];
  onJuris: (v: string | null) => void; onLifecycle: (v: string | null) => void;
  onQuery: (v: string) => void; onClear: () => void;
}) {
  const hasFilter = juris !== null || lifecycle !== null || query !== '';
  return (
    <div style={{
      padding: 16, background: B.card, borderRadius: 10,
      border: `1px solid ${B.bd}`, display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: B.p, fontFamily: geist }}>Filter feed</span>
        <div style={{ flex: 1 }} />
        {hasFilter && (
          <button
            onClick={onClear}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, color: B.s, fontFamily: geist,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 12px', background: B.bg, borderRadius: 8,
        border: `1px solid ${B.bd}`,
      }}>
        <span style={{ color: B.s, fontSize: 13 }}>⌕</span>
        <input
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Search headline, summary, authority, tag"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: 13, color: B.p, fontFamily: geist,
          }}
        />
        {query && (
          <button
            onClick={() => onQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: B.s, fontSize: 13 }}
          >✕</button>
        )}
      </div>

      {/* Jurisdiction chips */}
      <FilterRow
        label="JURISDICTION"
        options={presentJuris}
        selected={juris}
        onAll={() => onJuris(null)}
        onPick={onJuris}
      />

      {/* Lifecycle chips */}
      <FilterRow
        label="LIFECYCLE STAGE"
        options={presentLifecycle}
        selected={lifecycle}
        onAll={() => onLifecycle(null)}
        onPick={onLifecycle}
      />
    </div>
  );
}

function FilterRow({
  label, options, selected, onAll, onPick,
}: {
  label: string; options: string[]; selected: string | null;
  onAll: () => void; onPick: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.7px', color: B.s }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <FilterChip label="All" selected={selected === null} onClick={onAll} />
        {options.map(opt => (
          <FilterChip key={opt} label={opt} selected={selected === opt} onClick={() => onPick(opt)} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? B.bl + '1F' : 'none',
        border: selected ? 'none' : `1px solid ${B.bd}`,
        borderRadius: 999, padding: '6px 12px',
        fontSize: 12, fontWeight: 600,
        color: selected ? B.bl : B.s,
        cursor: 'pointer', fontFamily: geist,
      }}
    >
      {label}
    </button>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

function DetailModal({
  item, isSaved, onToggleSave, onClose,
}: {
  item: RadarItem; isSaved: boolean; onToggleSave: () => void; onClose: () => void;
}) {
  const [savedLocal, setSavedLocal] = useState(isSaved);
  const a = aug(item.id);
  const related = a.relatedIds.map(id => itemFor(id)).filter(Boolean) as RadarItem[];
  const domains = validationDomains(item);

  function handleSave() { setSavedLocal(v => !v); onToggleSave(); }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: B.bg, display: 'flex', flexDirection: 'column',
      overflowY: 'hidden',
    }}>
      {/* Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 24px',
        background: B.card, borderBottom: `1px solid ${B.bd}`,
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: B.bl, fontFamily: geist,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ‹ Back
        </button>
        <div style={{ width: 1, height: 26, background: B.bd }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: B.p }}>{item.id}</span>
          <span style={{ fontSize: 11, color: B.s, fontFamily: geist }}>
            {item.authority} · {ymdLabel(item.ymd)}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        {a.articleURL && (
          <a
            href={a.articleURL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: geist,
              padding: '6px 12px', background: B.bl, borderRadius: 999,
              textDecoration: 'none',
            }}
          >
            Open source ↗
          </a>
        )}
        <button
          onClick={handleSave}
          style={{
            background: savedLocal ? B.bl + '1F' : 'none',
            border: savedLocal ? 'none' : `1px solid ${B.bd}`,
            borderRadius: 999, padding: '6px 12px',
            fontSize: 12, fontWeight: 600,
            color: savedLocal ? B.bl : B.s,
            cursor: 'pointer', fontFamily: geist,
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          {savedLocal ? '⊡ Saved' : '⊟ Save'}
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Headline */}
          <div style={{ fontSize: 24, fontWeight: 800, color: B.p, fontFamily: geist, lineHeight: 1.3 }}>
            {item.headline}
          </div>

          {/* Meta strip */}
          <div style={{
            padding: 14, background: B.bg, borderRadius: 10, border: `1px solid ${B.bd}`,
            display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <Bdg label="✓ Official source" color={B.gr} />
            <Bdg label="◈ Gensaki interpretation" color={B.pu} />
            <span style={{ fontSize: 11, color: B.s, fontFamily: geist }}>
              Confirmed regulatory facts are kept separate from interpretation.
            </span>
          </div>

          {/* Key dates */}
          {(a.effectiveYMD > 0 || a.consultationYMD > 0 || a.supersedes) && (
            <SecCard title="Key dates">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <DateRow label="Published" ymd={item.ymd} color={B.s} countdown={null} />
                {a.consultationYMD > 0 && (
                  <DateRow label="Comment / consultation closes" ymd={a.consultationYMD} color={B.am} countdown={countdownLabel(a.consultationYMD)} />
                )}
                {a.effectiveYMD > 0 && (
                  <DateRow label="Takes effect" ymd={a.effectiveYMD} color={B.bl} countdown={countdownLabel(a.effectiveYMD)} />
                )}
                {a.supersedes && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: B.s, fontFamily: geist, width: 230, flexShrink: 0 }}>Supersedes</span>
                    <span style={{ fontSize: 13, color: B.p, fontFamily: geist }}>{a.supersedes}</span>
                  </div>
                )}
              </div>
            </SecCard>
          )}

          {/* Summary */}
          <DetailBlock label="Plain-English summary" text={item.summary} tag="FROM SOURCE" tagColor={B.gr} />

          {/* SRT read */}
          <AccentBlock label="Why it matters for SRT" text={item.srtRead} color={B.gr} />

          {/* Quote */}
          {item.quote && <QuoteBlock text={item.quote} />}

          {/* Interpretation */}
          <DetailBlock label="Interpretation / SRT read-through" text={item.interpretation} tag="GENSAKI VIEW" tagColor={B.pu} />

          {/* Two-col: stakeholders + lifecycle */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <SecCard title="Affected stakeholders">
                <BulletList items={item.stakeholders} />
              </SecCard>
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <SecCard title="Lifecycle stage">
                <BulletList items={item.lifecycle} />
              </SecCard>
            </div>
          </div>

          {/* Two-col: workstreams + categories */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <SecCard title="Impacted workstreams">
                <ChipFlow items={item.workstreams} ghost={false} />
              </SecCard>
            </div>
            <div style={{ flex: '1 1 280px' }}>
              <SecCard title="Categories">
                <ChipFlow items={item.categories} ghost />
              </SecCard>
            </div>
          </div>

          {/* Open questions */}
          <SecCard title="Open questions">
            <BulletList items={item.openQuestions} />
          </SecCard>

          {/* Interview questions */}
          {a.interviewQuestions.length > 0 && (
            <SecCard title="Questions to put to the market">
              <BulletList items={a.interviewQuestions} />
            </SecCard>
          )}

          {/* Action block */}
          <div style={{
            padding: 20, background: B.p, borderRadius: 10,
            display: 'flex', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 260px' }}>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: B.am }}>
                RECOMMENDED NEXT ACTION
              </span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontFamily: geist, lineHeight: 1.5 }}>
                {item.nextAction}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '0 0 240px' }}>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: B.am }}>
                VALIDATION REQUIRED
              </span>
              <span style={{
                fontFamily: mono, fontSize: 12, fontWeight: 600,
                color: item.validationRequired ? B.am : B.gr,
              }}>
                {item.validationRequired ? 'Yes, counsel / advisor / auditor review' : 'No, informational'}
              </span>
              {item.validationRequired && domains.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {domains.map((d, i) => (
                    <span key={i} style={{
                      fontSize: 10, fontWeight: 600, fontFamily: mono,
                      color: 'rgba(255,255,255,0.92)',
                      background: B.am + '47', padding: '4px 8px', borderRadius: 5,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <SecCard title="Related developments">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {related.map((r, i) => (
                  <div key={r.id}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0' }}>
                      <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: B.gr, width: 78, flexShrink: 0 }}>
                        {r.authorityShort} · {jurisShort[r.jurisdiction] ?? r.jurisdiction}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                        <span style={{ fontSize: 13, color: B.p, fontFamily: geist, lineHeight: 1.4 }}>{r.headline}</span>
                        <span style={{ fontFamily: mono, fontSize: 10, color: B.s }}>{ymdLabel(r.ymd, true)}</span>
                      </div>
                    </div>
                    {i < related.length - 1 && <div style={{ height: 1, background: B.bd }} />}
                  </div>
                ))}
              </div>
            </SecCard>
          )}

          {/* Follow-ups */}
          {a.followUps.length > 0 && (
            <SecCard title="Follow-up angles">
              <BulletList items={a.followUps} />
            </SecCard>
          )}

          {/* Tags */}
          <SecCard title="Tags">
            <ChipFlow items={item.tags} ghost />
          </SecCard>

          {/* Source row */}
          <div style={{
            padding: 16, background: B.bg, borderRadius: 10,
            border: `1px solid ${B.bd}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: B.gr }}>OFFICIAL SOURCE</span>
              <span style={{ fontSize: 13, color: B.p, fontFamily: geist }}>{item.source}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: B.s }}>{item.id}</span>
            </div>
            {a.articleURL && (
              <a
                href={a.articleURL}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: geist,
                  padding: '10px 14px', background: B.bl, borderRadius: 6,
                  textDecoration: 'none',
                }}
              >
                ↗ Open source
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function DateRow({ label, ymd, color, countdown }: { label: string; ymd: number; color: string; countdown: string | null }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: B.s, fontFamily: geist, width: 230, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: B.p }}>{ymdLabel(ymd)}</span>
      {countdown && <Bdg label={countdown} color={color} />}
    </div>
  );
}

function DetailBlock({ label, text, tag, tagColor }: { label: string; text: string; tag?: string; tagColor?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: B.s }}>
          {label.toUpperCase()}
        </span>
        {tag && tagColor && <Bdg label={tag} color={tagColor} />}
      </div>
      <span style={{ fontSize: 15, color: B.p, fontFamily: geist, lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function AccentBlock({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div style={{
      padding: 18, background: color + '0F',
      borderLeft: `4px solid ${color}`, borderRadius: 8,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 15, color: B.p, fontFamily: geist, lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function QuoteBlock({ text }: { text: string }) {
  return (
    <div style={{
      padding: 18, background: B.am + '14',
      borderLeft: `4px solid ${B.am}`, borderRadius: 8,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: B.am }}>KEY QUOTED LANGUAGE</span>
      <span style={{ fontSize: 13.5, fontFamily: mono, fontStyle: 'italic', color: 'rgb(89, 77, 0)', lineHeight: 1.6 }}>
        "{text}"
      </span>
    </div>
  );
}

// ─── SectionHead ──────────────────────────────────────────────────────────────

function SectionHead({
  eyebrow, title, aside, isCompact,
}: {
  eyebrow: string;
  title: Array<{ text: string; em: boolean }>;
  aside: string;
  isCompact: boolean;
}) {
  const titleBlock = (
    <div style={{
      fontSize: isCompact ? 36 : 52,
      fontFamily: geist,
      letterSpacing: isCompact ? '-1.1px' : '-1.6px',
      lineHeight: 1.1,
      maxWidth: 760,
    }}>
      {title.map((s, i) => (
        <span key={i} style={{ color: s.em ? C.mute : C.ink, fontWeight: s.em ? 400 : 500 }}>
          {s.text}
        </span>
      ))}
    </div>
  );

  const eyebrowEl = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: C.cyan, flexShrink: 0 }} />
      <span style={{
        fontFamily: mono, fontSize: 11.5, letterSpacing: '0.8px',
        color: C.mute, textTransform: 'uppercase',
      }}>
        {eyebrow}
      </span>
    </div>
  );

  const asideEl = (
    <div style={{
      fontSize: isCompact ? 15 : 17, fontFamily: geist,
      fontWeight: 400, color: C.mute, lineHeight: 1.6, maxWidth: 340,
    }}>
      {aside}
    </div>
  );

  if (isCompact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {eyebrowEl}
          {titleBlock}
        </div>
        {asideEl}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 25 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        {eyebrowEl}
        {titleBlock}
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: C.line, flexShrink: 0 }} />
      {asideEl}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RegWatchView({ onSelectItem }: { onSelectItem: (v: string | null) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sec0Ref  = useRef<HTMLDivElement>(null);
  const sec1Ref  = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [isCompact, setIsCompact]         = useState(false);

  const [tab, setTab]                     = useState<'daily' | 'saved'>('daily');
  const [saved, setSaved]                 = useState<Set<string>>(new Set());
  const [dailyJuris, setDailyJuris]       = useState<string | null>(null);
  const [dailyLifecycle, setDailyLifecycle] = useState<string | null>(null);
  const [dailyQuery, setDailyQuery]       = useState('');
  const [selectedItem, setSelectedItem]   = useState<RadarItem | null>(null);

  // Responsive width tracking
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setIsCompact(e.contentRect.width < 1080);
    });
    if (scrollRef.current) obs.observe(scrollRef.current);
    return () => obs.disconnect();
  }, []);

  // Active section detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      const st = el!.scrollTop;
      const vh = el!.clientHeight;
      const sec1Top = sec1Ref.current?.offsetTop ?? vh;
      setActiveSection(st >= sec1Top - vh / 2 ? 1 : 0);
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  function goSection(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    const target = i === 0 ? sec0Ref.current : sec1Ref.current;
    if (target) el.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
  }

  function toggleSave(id: string) {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const hPad = isCompact ? 20 : 40;

  // Derived filter data
  const jurisOrder = ['EU', 'UK', 'US', 'Canada', 'Switzerland', 'Global / Basel', 'Global / IFRS', 'Global'];
  const lcOrder = [
    'Mandate & strategic trigger', 'Portfolio screening & selection', 'Structuring & modelling',
    'Internal governance & approvals', 'Supervisory engagement', 'Investor outreach & placement',
    'Documentation & legal execution', 'Closing & settlement', 'Post-close monitoring & reporting',
    'Credit event handling', 'Replenishment', 'Maturity / call / unwind / refinancing',
  ];
  const presentJuris     = jurisOrder.filter(j => radarItems.some(it => it.jurisdiction === j));
  const presentLifecycle = lcOrder.filter(s => radarItems.some(it => it.lifecycle.includes(s)));
  const sortedItems      = [...radarItems].sort((a, b) => b.ymd - a.ymd);

  const q = dailyQuery.trim().toLowerCase();
  const dailyFiltered = sortedItems.filter(it =>
    (!dailyJuris     || it.jurisdiction === dailyJuris) &&
    (!dailyLifecycle || it.lifecycle.includes(dailyLifecycle)) &&
    matches(it, q)
  );

  const groupMap = new Map<number, RadarItem[]>();
  for (const it of dailyFiltered) {
    if (!groupMap.has(it.ymd)) groupMap.set(it.ymd, []);
    groupMap.get(it.ymd)!.push(it);
  }
  const dateGroups  = [...groupMap.entries()].sort((a, b) => b[0] - a[0]);
  const savedItems  = sortedItems.filter(it => saved.has(it.id));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        style={{
          width: '100%', height: '100%', overflowY: 'scroll',
          scrollSnapType: 'y mandatory', scrollBehavior: 'smooth',
        }}
      >
        {/* ── Section 0: Hero ─────────────────────────────────────────────── */}
        <div
          ref={sec0Ref}
          style={{
            scrollSnapAlign: 'start',
            height: '100vh', display: 'flex', flexDirection: 'column',
            background: `linear-gradient(to bottom, #F2FBF4, ${C.bg} 55%), radial-gradient(ellipse at 50% -20%, ${C.mint1}, ${C.mint2}, transparent 60%)`,
          }}
        >
          {/* spacer matching nav height so hero content is truly centered in the remainder */}
          <div style={{ height: 80, flexShrink: 0 }} />

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: `0 ${hPad}px` }}>
            <div style={{ maxWidth: 1180, width: '100%', margin: '0 auto' }}>
              <div style={{ maxWidth: 720 }}>

                <div style={{ marginBottom: 32 }}>
                  <HeroEyebrow text="Regulatory Radar · SRT intelligence" />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <span style={{
                    fontSize: isCompact ? 44 : 80, fontWeight: 500,
                    letterSpacing: isCompact ? '-1.4px' : '-2.6px',
                    lineHeight: 1.05, color: C.ink, fontFamily: geist,
                  }}>
                    SRT regulatory{'\n'}
                  </span>
                  <span style={{
                    fontSize: isCompact ? 44 : 80, fontWeight: 400,
                    letterSpacing: isCompact ? '-1.4px' : '-2.6px',
                    lineHeight: 1.05, color: C.mute, fontFamily: geist,
                  }}>
                    intelligence
                  </span>
                </div>

                <div style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    '// Official-source tracking for synthetic risk transfer, built for reporters and analysts.',
                    '// What changed, why it matters, who is affected, and what to ask the market.',
                    '// Cut by date, jurisdiction and transaction lifecycle.',
                  ].map((line, i) => (
                    <div key={i} style={{
                      fontFamily: mono, fontSize: isCompact ? 12.5 : 14.5,
                      color: C.ink, lineHeight: 1.6, opacity: 0.7,
                    }}>
                      {line}
                    </div>
                  ))}
                </div>

                <CTAButton title="Open the feed" kind="ink" onClick={() => goSection(1)} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 1: Radar content ─────────────────────────────────────── */}
        <div
          ref={sec1Ref}
          style={{ scrollSnapAlign: 'start', minHeight: '100vh', background: B.bg }}
        >
          <div style={{
            maxWidth: 1180, margin: '0 auto',
            padding: `${isCompact ? 56 : 76}px ${hPad}px 56px`,
          }}>

            <SectionHead
              eyebrow="THE FEED"
              title={[
                { text: 'What changed, ', em: false },
                { text: 'and what to ask.', em: true },
              ]}
              aside="Official-source regulatory developments for synthetic risk transfer, cut by date, jurisdiction, forward calendar, and lifecycle. Open any item for the full structured brief."
              isCompact={isCompact}
            />

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {([
                { id: 'daily' as const, label: 'Daily feed' },
                { id: 'saved' as const, label: 'Saved' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '9px 14px', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, fontFamily: geist, cursor: 'pointer',
                    color: tab === t.id ? '#fff' : B.s,
                    background: tab === t.id ? B.bl : 'none',
                    border: tab === t.id ? 'none' : `1px solid ${B.bd}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Daily feed */}
            {tab === 'daily' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <FilterBar
                  juris={dailyJuris} lifecycle={dailyLifecycle} query={dailyQuery}
                  presentJuris={presentJuris} presentLifecycle={presentLifecycle}
                  onJuris={setDailyJuris} onLifecycle={setDailyLifecycle}
                  onQuery={setDailyQuery}
                  onClear={() => { setDailyJuris(null); setDailyLifecycle(null); setDailyQuery(''); }}
                />

                {dailyFiltered.length === 0 ? (
                  <div style={{
                    padding: 40, textAlign: 'center',
                    border: `1px dashed ${B.bd}`, borderRadius: 10,
                    display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
                  }}>
                    <div style={{ fontSize: 22, color: B.s }}>⊘</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: B.p, fontFamily: geist }}>
                      No stories match these filters.
                    </div>
                    <button
                      onClick={() => { setDailyJuris(null); setDailyLifecycle(null); setDailyQuery(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: B.bl, fontFamily: geist }}
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  dateGroups.map(([ymd, items]) => {
                    const day = ymd % 100;
                    const mo  = MO[Math.floor((ymd / 100) % 100)];
                    const yr  = Math.floor(ymd / 10000);
                    return (
                      <div key={ymd} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                        <div style={{ width: 64, flexShrink: 0 }}>
                          <div style={{ fontFamily: mono, fontSize: 30, fontWeight: 900, color: B.p, lineHeight: 1 }}>{day}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: B.gr, fontFamily: geist }}>{mo}</div>
                          <div style={{ fontFamily: mono, fontSize: 11, color: B.s + '99' }}>{yr}</div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {items.map(it => (
                            <ItemCard
                              key={it.id} item={it} compact={false}
                              isSaved={saved.has(it.id)}
                              onToggleSave={() => toggleSave(it.id)}
                              onOpen={() => setSelectedItem(it)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Saved tab */}
            {tab === 'saved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {savedItems.length === 0 ? (
                  <div style={{
                    padding: '56px 24px', textAlign: 'center',
                    background: B.card, borderRadius: 10, border: `1px dashed ${B.bd}`,
                    display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
                  }}>
                    <div style={{ fontSize: 26, color: B.s + '99' }}>⊟</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: B.p, fontFamily: geist }}>No saved stories yet</div>
                    <div style={{ fontSize: 12.5, color: B.s, fontFamily: geist, maxWidth: 360, lineHeight: 1.5 }}>
                      Tap the bookmark on any story to save it here for quick access.
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: B.p, fontFamily: geist }}>
                        {savedItems.length} saved {savedItems.length === 1 ? 'story' : 'stories'}
                      </span>
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={() => setSaved(new Set())}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: B.s, fontFamily: geist }}
                      >
                        Clear all
                      </button>
                    </div>
                    {savedItems.map(it => (
                      <ItemCard
                        key={it.id} item={it} compact={false} isSaved
                        onToggleSave={() => toggleSave(it.id)}
                        onOpen={() => setSelectedItem(it)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ marginTop: 48, padding: 20, background: B.p, borderRadius: 10 }}>
              <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', color: B.am, marginBottom: 6 }}>
                DISCLAIMER
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                This radar is for regulatory intelligence and workflow support only. It is not legal, accounting, tax, investment, or regulatory advice. Any transaction-specific conclusion should be validated by qualified counsel, accountants, regulatory advisors, and relevant supervisory guidance. Source links and quoted language are illustrative for this build.
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: isCompact ? 56 : 96 }}>
              <PageFooter isCompact={isCompact} />
            </div>

          </div>
        </div>
      </div>

      {/* Fixed header */}
      <HeaderNav isCompact={isCompact} scrollRef={scrollRef} onSelectItem={onSelectItem} />

      {/* Section indicator */}
      <div style={{
        position: 'fixed', left: isCompact ? 8 : 12,
        top: '50%', transform: 'translateY(-50%)', zIndex: 99, padding: 8,
      }}>
        <SectionIndicator active={activeSection} onSelect={goSection} />
      </div>

      {/* Detail modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          isSaved={saved.has(selectedItem.id)}
          onToggleSave={() => toggleSave(selectedItem.id)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
