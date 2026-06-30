// src/pages/GISTIndex.tsx
// Converted from GISTIndex.swift (Gensaki institutional SRT platform)

import React, { useState, useRef, useEffect } from 'react';
import { CTAButton, HeroEyebrow, HeaderNav } from '../components/HeaderNav';
import { PageFooter } from '../components/PageFooter';

// ─── Blotter palette ──────────────────────────────────────────────────────────
const B = {
  bg:   '#F7F8FC', card: '#FFFFFF',
  p:    '#121C28', s:    '#5A6878', bd:   '#E8EBEF',
  bl:   '#1C63FA', gr:   '#00AE47', am:   '#D98C00',
  rd:   '#CC2525', pu:   '#A64CCC',
} as const;

// ─── Landing-shell palette (hero + nav) ───────────────────────────────────────
const C = {
  bg: '#FBFBF8', ink: '#0E1410', ink2: '#2A312D', mute: '#6B7368',
  line: '#E6E8E2', cyan: '#74E0FF', cyanInk: '#0B1D27',
  green: '#2F9E69', mint1: '#E7F6EC', mint2: '#F1FBF3',
} as const;

function ff(f: 'geist' | 'mono') {
  return f === 'geist' ? '"Geist", system-ui, sans-serif' : '"JetBrains Mono", "Courier New", monospace';
}

// ─── Format helpers ───────────────────────────────────────────────────────────
const fmtAssets = (m: number) => m >= 1000 ? `$${(m / 1000).toFixed(1)}B` : `$${m}M`;
const fmtPct = (v?: number | null, dp = 1) => v == null ? 'n/a' : `${v.toFixed(dp)}%`;
const fmtNum = (v?: number | null, dp = 1) => v == null ? 'n/a' : v.toFixed(dp);

function scoreColor(s: number): string {
  if (s >= 90) return B.gr;
  if (s >= 80) return '#269669';
  if (s >= 70) return B.bl;
  if (s >= 60) return '#6175BC';
  if (s >= 50) return B.am;
  if (s >= 40) return '#D6712E';
  return B.rd;
}

// ─── SRT Signal ───────────────────────────────────────────────────────────────
type SRTKey = 'none'|'monitor'|'capital'|'concentration'|'growth'|'risk'|'advisor';
const SRT: Record<SRTKey, { label: string; sub: string; color: string; icon: string }> = {
  none:          { label: 'No signal',          sub: 'No obvious SRT signal from current public data',      color: B.s,       icon: '−' },
  monitor:       { label: 'Monitor',            sub: 'Worth tracking; no immediate use case',               color: '#73808E', icon: '◉' },
  capital:       { label: 'Capital efficiency', sub: 'Possible capital-efficiency use case',                color: B.bl,      icon: '◑' },
  concentration: { label: 'Concentration',      sub: 'Possible concentration-management use case',          color: B.am,      icon: '◕' },
  growth:        { label: 'Growth capacity',    sub: 'Possible growth-capacity use case',                   color: B.gr,      icon: '↗' },
  risk:          { label: 'Risk transfer',      sub: 'Possible risk-transfer use case',                     color: B.rd,      icon: '⚠' },
  advisor:       { label: 'Advisor review',     sub: 'Advisor review suggested',                            color: B.pu,      icon: '⊛' },
};
const SRT_ORDER: SRTKey[] = ['capital','concentration','growth','risk','advisor','monitor'];

// ─── Capital Archetype ────────────────────────────────────────────────────────
type ArcKey = 'trapped'|'growth'|'concentration'|'funding'|'excess'|'creditWatch'|'efficient';
const ARC: Record<ArcKey, { label: string; short: string; blurb: string; color: string; icon: string; actions: string[] }> = {
  trapped:       { label:'Capital trapped',          short:'Capital trapped',  color:B.bl,      icon:'⊘',
    blurb:'Good assets, but low capital productivity. Capital is tied up in profitable lending that earns a thin return on RWA.',
    actions:['Synthetic risk transfer / CRT','Securitisation','Loan participations','RWA optimisation','Reprice to lift return on RWA'] },
  growth:        { label:'Growth constrained',       short:'Growth constr.',   color:B.gr,      icon:'↗',
    blurb:'Profitable growth opportunities, but limited capital capacity to fund them.',
    actions:['Risk transfer to free capital','Retain earnings','Trim buybacks','Capital-light fee expansion','Selective securitisation'] },
  concentration: { label:'Concentration heavy',      short:'Concentration',    color:B.am,      icon:'◕',
    blurb:'Overexposed to a sector, geography, or borrower set, with investor or supervisory attention on the exposure.',
    actions:['Loan sale','Portfolio runoff','Origination slowdown','Credit risk transfer','Higher reserves','Enhanced disclosure'] },
  funding:       { label:'Funding constrained',      short:'Funding constr.',  color:B.pu,      icon:'▽',
    blurb:'Pressure from deposit cost, deposit outflows, or wholesale-funding reliance.',
    actions:['Slow originations','Sell assets','Securitise assets','Reprice deposits','Reduce wholesale reliance','Preserve liquidity'] },
  excess:        { label:'Excess capital / low growth', short:'Excess capital',color:'#6175BC', icon:'◇',
    blurb:'More capital than near-term opportunities require, with limited reinvestment need.',
    actions:['Buybacks','Dividends','M&A','Strategic investment','Balance-sheet restructuring'] },
  creditWatch:   { label:'Credit normalisation watch', short:'Credit watch',   color:B.rd,      icon:'⚠',
    blurb:'Rising credit risk that is not yet a credit problem. Reserve and capital posture matter most.',
    actions:['Capital retention','Reserve build','Tighten underwriting','Risk reduction','More disclosure','Avoid aggressive buybacks'] },
  efficient:     { label:'Structurally efficient',   short:'Efficient',        color:'#269669', icon:'✓',
    blurb:'Already using capital efficiently, with balanced growth, clean credit, and a clear capital policy.',
    actions:['Maintain discipline','Fine-tune capital return','Continue selective growth','Opportunistic structured finance','Avoid unnecessary complexity'] },
};
const ARC_ORDER: ArcKey[] = ['trapped','growth','concentration','funding','excess','creditWatch','efficient'];

// ─── Data models ──────────────────────────────────────────────────────────────
interface GMetrics {
  cet1?: number; tier1?: number; leverage?: number; tce?: number; netWorth?: number;
  nim: number; efficiency: number; roe: number; roa: number; rwaDensity?: number;
  npa: number; nco: number; allowance: number; ltd: number; creConc?: number;
  loanGrowth: number; depGrowth: number; capGen: number;
}
interface AssetMix { cre: number; ci: number; res: number; cons: number; other: number; }
interface Institution {
  id: string; name: string; ticker?: string; charter: string; peerGroup: string;
  state: string; assets: number; jurisdiction: string;
  gist: number; capital: number; balance: number; riskRoe: number;
  rankQoQ: number; rankYoY: number; srtSignalRaw: SRTKey; srtReason: string;
  metrics: GMetrics; assetMix: AssetMix;
  driversPlus: string[]; driversMinus: string[]; driversQuestions: string[];
  confidence: string; listed: boolean; rank: number; isCU: boolean;
}

function gm(o: Partial<GMetrics> = {}): GMetrics {
  return { cet1:11.2, tier1:12.4, leverage:9.1, tce:8.5, nim:3.05, efficiency:58.2,
    roe:11.2, roa:1.04, rwaDensity:66, npa:0.62, nco:0.21, allowance:1.35,
    ltd:84, creConc:220, loanGrowth:5.4, depGrowth:3.2, capGen:1.05, ...o };
}
const mix = (cre: number, ci: number, res: number, cons: number, other: number): AssetMix =>
  ({ cre, ci, res, cons, other });
const defaultMix = mix(30, 25, 20, 15, 10);

// ─── Derived helpers ──────────────────────────────────────────────────────────
function archetypeOf(it: Institution): ArcKey {
  const m = it.metrics;
  const cet1 = m.cet1 ?? m.netWorth ?? 12.0;
  const cre = m.creConc ?? 0;
  const density = m.rwaDensity ?? 62;
  if (m.nco >= 0.38 || m.npa >= 0.95) return 'creditWatch';
  if (cre >= 330) return 'concentration';
  if (m.ltd >= 96 || (m.depGrowth < 2.0 && m.loanGrowth >= 6.0)) return 'funding';
  if (cet1 >= 12.5 && m.loanGrowth < 5.0) return 'excess';
  if (cet1 < 11.0 && m.loanGrowth >= 7.0) return 'growth';
  if (density >= 70 && m.roe < 12.0) return 'trapped';
  if (it.gist >= 80 && m.npa < 0.70) return 'efficient';
  if (density >= 66) return 'trapped';
  if (m.loanGrowth >= 6.5) return 'growth';
  return 'efficient';
}
function returnOnRWA(it: Institution): number | undefined {
  if (!it.metrics.rwaDensity || it.metrics.rwaDensity <= 0) return undefined;
  return it.metrics.roa * 100.0 / it.metrics.rwaDensity;
}
function ratingBand(s: number): { label: string; color: string } {
  if (s >= 85) return { label: 'Elite',    color: scoreColor(s) };
  if (s >= 75) return { label: 'Strong',   color: scoreColor(s) };
  if (s >= 60) return { label: 'Capable',  color: scoreColor(s) };
  if (s >= 45) return { label: 'Modest',   color: scoreColor(s) };
  return            { label: 'Limited',   color: scoreColor(s) };
}

// ─── Raw institution data ─────────────────────────────────────────────────────
type RawInst = Omit<Institution, 'rank' | 'isCU'>;

function inst(id: string, name: string, ticker: string|undefined, charter: string, peerGroup: string,
  state: string, assets: number, jurisdiction: string, gist: number, capital: number,
  balance: number, riskRoe: number, rankQoQ: number, rankYoY: number,
  srtSignalRaw: SRTKey, srtReason: string, m: GMetrics, assetMix?: AssetMix,
  driversPlus?: string[], driversMinus?: string[], driversQuestions?: string[],
  confidence?: string, listed?: boolean): RawInst {
  return { id, name, ticker, charter, peerGroup, state, assets, jurisdiction, gist, capital, balance,
    riskRoe, rankQoQ, rankYoY, srtSignalRaw, srtReason, metrics: m,
    assetMix: assetMix ?? defaultMix, driversPlus: driversPlus ?? [],
    driversMinus: driversMinus ?? [], driversQuestions: driversQuestions ?? [],
    confidence: confidence ?? 'high', listed: listed ?? true };
}

const RAW: RawInst[] = [
  inst('NPNB','Northpoint National Bank','NPNB','Bank','Mid-cap US bank','OH',38500,'US',
    88,91,85,88,3,7,'capital',
    'Strong franchise, capital ratio compressing as loan growth outpaces internal capital generation',
    gm({cet1:11.4,tier1:12.7,leverage:9.2,tce:8.8,nim:3.18,efficiency:54.2,roe:13.4,roa:1.22,rwaDensity:68,npa:0.51,nco:0.18,allowance:1.42,ltd:91,creConc:295,loanGrowth:8.4,depGrowth:4.1,capGen:1.18}),
    mix(38,31,18,8,5),
    ['Disciplined capital generation supports continued growth','Pre-provision earnings strength above peer median','Credit quality stable with declining charge-offs'],
    ['CRE concentration above peer 75th percentile','Loan growth has outpaced deposit growth four quarters running'],
    ['How does management plan to fund continued CRE growth?','Is SRT under consideration for the CRE book?']),

  inst('GCBS','Granite Coast Bancshares','GCBS','Bank','Regional US bank','NC',24200,'US',
    84,82,86,85,1,4,'capital',
    'High-quality earnings with binding capital ratio at ~11%; classic capital-efficiency profile',
    gm({cet1:10.9,tier1:12.0,leverage:8.7,tce:8.1,nim:3.21,efficiency:53.8,roe:13.1,roa:1.18,npa:0.48,nco:0.16,allowance:1.31,ltd:88,creConc:260,loanGrowth:7.1,depGrowth:3.6,capGen:1.11}),
    mix(34,33,22,7,4)),

  inst('RVST','Riverstone Federal Bank','RVST','Bank','Mid-cap US bank','TX',52000,'US',
    91,90,89,93,0,2,'none',
    'Capital position and growth pace are well-matched',
    gm({cet1:12.1,tier1:13.2,leverage:9.6,tce:9.4,nim:3.32,efficiency:50.4,roe:14.1,roa:1.35,npa:0.42,nco:0.14,allowance:1.28,ltd:78,creConc:165,loanGrowth:5.2,depGrowth:5.8,capGen:1.32}),
    mix(22,28,30,14,6)),

  inst('CDVF','Cedar Valley Financial','CDVF','Bank','Community bank','WI',8800,'US',
    79,85,76,77,-2,1,'monitor',
    'Disciplined operator but loan-to-deposit ratio rising; worth monitoring',
    gm({cet1:12.3,tier1:13.4,leverage:9.8,tce:9.1,nim:2.94,efficiency:60.1,roe:10.4,roa:1.01,npa:0.59,nco:0.20,allowance:1.30,ltd:95,creConc:210,loanGrowth:6.2,depGrowth:1.8,capGen:0.94}),
    mix(31,24,24,14,7)),

  inst('CLTR','Coastline Trust','CLTR','Bank','Mid-cap US bank','FL',41800,'US',
    73,68,72,79,-5,-8,'concentration',
    'CRE concentration well above peer 90th percentile; concentration-management use case',
    gm({cet1:10.4,tier1:11.5,leverage:8.4,tce:7.6,nim:3.11,efficiency:55.6,roe:12.6,roa:1.10,npa:0.71,nco:0.28,allowance:1.45,ltd:96,creConc:412,loanGrowth:9.4,depGrowth:2.2,capGen:0.86}),
    mix(48,22,14,11,5),
    ['Strong NIM despite concentration','Allowance coverage above peer median'],
    ['CRE concentration at 412% of risk-based capital, peer 95th percentile','Capital generation insufficient to support growth pace','Loan growth materially outstripping deposit growth'],
    ['Has the board discussed SRT for concentration management?','What is the path back to a sub-300% CRE ratio?']),

  inst('BYSH','Bayshore Mutual','BYSH','Bank','Community bank','CA',6400,'US',
    71,78,70,66,4,-3,'monitor','Strong capital but mixed loan-mix signals',
    gm({cet1:12.8,tier1:13.9,leverage:10.2,tce:9.6,nim:2.88,efficiency:64.2,roe:8.9,roa:0.88,npa:0.68,nco:0.24,allowance:1.38,ltd:82,creConc:178,loanGrowth:4.1,depGrowth:4.6,capGen:1.05}),
    mix(28,24,30,13,5)),

  inst('NWST','Northwind Bancshares','NWST','Bank','Mid-cap US bank','WA',31600,'US',
    82,79,84,84,6,9,'growth',
    'Profitable franchise constrained by capital, possible growth-capacity use case',
    gm({cet1:10.7,tier1:11.8,leverage:8.8,tce:8.3,nim:3.06,efficiency:56.4,roe:12.8,roa:1.16,npa:0.55,nco:0.19,allowance:1.34,ltd:89,creConc:245,loanGrowth:8.2,depGrowth:4.4,capGen:1.04}),
    mix(34,30,21,10,5)),

  inst('STBR','Stonebridge Community Bank','STBR','Bank','Community bank','PA',4900,'US',
    68,72,70,62,-1,-4,'monitor','Adequate capital, weaker risk-adjusted ROE',
    gm({cet1:11.6,tier1:12.5,leverage:9.4,tce:8.7,nim:2.81,efficiency:67.1,roe:8.1,roa:0.79,npa:0.78,nco:0.31,allowance:1.42,ltd:86,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(30,22,28,14,6)),

  inst('ANSB','Anchor State Bank','ANSB','Bank','Regional US bank','GA',19400,'US',
    76,74,78,76,8,12,'capital','Strong operator with binding capital, capital-efficiency profile',
    gm({cet1:10.6,tier1:11.7,leverage:8.6,tce:8.0,nim:3.04,efficiency:57.3,roe:12.0,roa:1.09,npa:0.58,nco:0.20,allowance:1.35,ltd:88,creConc:232,loanGrowth:7.4,depGrowth:3.5,capGen:0.96})),

  inst('MDBR','Meadowbrook Bancorp','MDBR','Bank','Regional US bank','IL',17800,'US',
    65,60,64,70,-11,-15,'risk',
    'Rising NCOs and stretched capital ratio, possible risk-transfer use case',
    gm({cet1:9.8,tier1:10.9,leverage:8.1,tce:7.2,nim:2.96,efficiency:60.4,roe:10.4,roa:0.92,npa:0.94,nco:0.42,allowance:1.48,ltd:97,creConc:320,loanGrowth:6.4,depGrowth:1.4,capGen:0.76}),
    mix(40,26,18,12,4),
    ['NIM has held up despite rate compression elsewhere'],
    ['CET1 at 9.8%, well below peer median','NCO trend has deteriorated four straight quarters','Funding mix has shifted toward higher-cost wholesale sources'],
    ['What is the capital plan for the next four quarters?','Is the board reviewing risk-transfer alternatives on the CRE book?']),

  inst('SHB','Summit Heritage Bank','SHB','Bank','Mid-cap US bank','CO',29400,'US',
    86,87,84,88,2,5,'none','',
    gm({cet1:11.8,tier1:12.9,leverage:9.4,tce:9.0,nim:3.16,efficiency:52.7,roe:13.0,roa:1.21,npa:0.46,nco:0.15,allowance:1.30,ltd:81,creConc:195,loanGrowth:5.8,depGrowth:5.2,capGen:1.22})),

  inst('PNCB','Pinewater Community Bank','PNCB','Bank','Community bank','VT',3200,'US',
    74,81,73,68,5,2,'none','',
    gm({cet1:12.9,tier1:14.1,leverage:10.3,tce:9.8,nim:2.96,efficiency:65.4,roe:9.4,roa:0.94,npa:0.54,nco:0.16,allowance:1.36,ltd:78,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.05})),

  inst('LBNW','Liberty Northwest CU',undefined,'Credit Union','Federal credit union','OR',11200,'US',
    80,86,80,74,4,8,'monitor',
    'Solid net worth ratio with rising auto and member-business loan growth',
    gm({cet1:undefined,tier1:undefined,leverage:undefined,tce:undefined,netWorth:11.2,nim:3.42,efficiency:71.2,roe:9.6,roa:1.05,rwaDensity:undefined,npa:0.61,nco:0.34,allowance:1.35,ltd:88,creConc:undefined,loanGrowth:9.4,depGrowth:4.8,capGen:0.91}),
    mix(8,22,38,28,4),[],[],[],undefined,false),

  inst('HMFC','Highmark Federal CU',undefined,'Credit Union','Federal credit union','MI',8400,'US',
    77,82,78,71,2,3,'monitor',
    'Concentration in auto and consumer; capital efficiency could be enhanced',
    gm({cet1:undefined,tier1:undefined,leverage:undefined,tce:undefined,netWorth:10.8,nim:3.38,efficiency:73.4,roe:8.9,roa:1.01,rwaDensity:undefined,npa:0.66,nco:0.42,allowance:1.35,ltd:84,creConc:undefined,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(6,14,32,42,6),[],[],[],undefined,false),

  inst('RMTN','Rocky Mountain CU',undefined,'Credit Union','State credit union','CO',5600,'US',
    72,78,73,66,-2,1,'none','',
    gm({cet1:undefined,tier1:undefined,leverage:undefined,tce:undefined,netWorth:10.1,nim:3.30,efficiency:75.6,roe:8.0,roa:0.94,rwaDensity:undefined,npa:0.72,nco:0.21,allowance:1.35,ltd:84,creConc:undefined,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(4,12,30,48,6),[],[],[],undefined,false),

  inst('PVCU','Patriot Valley Federal CU',undefined,'Credit Union','Federal credit union','VA',3900,'US',
    69,76,70,62,0,-2,'none','',
    gm({cet1:undefined,tier1:undefined,leverage:undefined,tce:undefined,netWorth:9.4,nim:3.24,efficiency:78.1,roe:7.4,roa:0.86,rwaDensity:undefined,npa:0.62,nco:0.21,allowance:1.35,ltd:84,creConc:undefined,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(2,10,28,54,6),[],[],[],'med',false),

  inst('SBFC','Sunbelt Federal CU',undefined,'Credit Union','Federal credit union','AZ',14600,'US',
    81,84,82,76,6,11,'growth',
    'Member-business loan growth running ahead of net worth growth',
    gm({cet1:undefined,tier1:undefined,leverage:undefined,tce:undefined,netWorth:10.6,nim:3.36,efficiency:71.8,roe:9.4,roa:1.06,rwaDensity:undefined,npa:0.62,nco:0.21,allowance:1.35,ltd:84,creConc:undefined,loanGrowth:11.2,depGrowth:5.4,capGen:1.02}),
    mix(12,26,30,28,4),[],[],[],undefined,false),

  inst('NLCU','Northern Lakes CU',undefined,'Credit Union','State credit union','MN',4200,'US',
    66,71,68,60,-4,-6,'none','',
    gm({cet1:undefined,tier1:undefined,leverage:undefined,tce:undefined,netWorth:8.8,nim:3.18,efficiency:79.4,roe:7.0,roa:0.81,rwaDensity:undefined,npa:0.80,nco:0.21,allowance:1.35,ltd:84,creConc:undefined,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(3,8,26,56,7),[],[],[],'med',false),

  inst('THCB','Thames Capital Bank','THCB.L','Bank','UK challenger','London',18400,'UK',
    78,80,76,79,1,6,'capital',
    'Capital efficiency would benefit from synthetic protection on SME book',
    gm({cet1:12.6,tier1:14.1,leverage:5.4,tce:9.6,nim:2.85,efficiency:54.2,roe:11.8,roa:0.91,rwaDensity:58,npa:1.04,nco:0.32,allowance:1.35,ltd:92,creConc:188,loanGrowth:8.6,depGrowth:4.4,capGen:1.08}),
    mix(32,42,16,6,4)),

  inst('NSUK','Northstar UK Bank','NSUK.L','Bank','UK challenger','Manchester',9200,'UK',
    64,62,66,64,-8,-11,'concentration',
    'Specialty lending concentration combined with thin CET1 buffer',
    gm({cet1:10.2,tier1:11.4,leverage:4.6,tce:7.4,nim:3.18,efficiency:62.6,roe:10.6,roa:0.78,rwaDensity:71,npa:1.42,nco:0.46,allowance:1.35,ltd:98,creConc:220,loanGrowth:12.4,depGrowth:2.1,capGen:0.72}),
    mix(28,38,8,22,4)),

  inst('BRTM','Brighton Mutual',undefined,'Bank','UK specialist','Brighton',3800,'UK',
    71,76,72,66,2,4,'monitor','',
    gm({cet1:13.4,tier1:14.6,leverage:5.8,tce:9.8,nim:2.62,efficiency:64.4,roe:9.0,roa:0.74,npa:0.92,nco:0.24,allowance:1.35,ltd:84,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(18,8,56,14,4),[],[],[],undefined,false),

  inst('RHSP','Rheinland Sparkasse Gruppe',undefined,'Bank','EU specialist lender','Köln',26800,'EU',
    75,79,74,72,3,2,'capital',
    'Capital position binds against SME growth ambition, programmatic SRT candidate',
    gm({cet1:13.8,tier1:15.2,leverage:5.2,tce:10.1,nim:2.18,efficiency:58.1,roe:8.4,roa:0.62,rwaDensity:54,npa:0.84,nco:0.18,allowance:1.35,ltd:102,creConc:224,loanGrowth:6.8,depGrowth:2.4,capGen:0.94}),
    mix(34,46,12,4,4),[],[],[],undefined,false),

  inst('BAPS','Banque Atlantique de Paris','BAPS.PA','Bank','EU mid-cap','Paris',64200,'EU',
    83,84,82,83,1,3,'monitor',
    'Already programmatic in SRT, well-positioned',
    gm({cet1:13.1,tier1:14.6,leverage:5.6,tce:9.4,nim:2.04,efficiency:56.2,roe:9.6,roa:0.66,rwaDensity:48,npa:0.78,nco:0.16,allowance:1.35,ltd:84,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.04}),
    mix(26,42,24,5,3)),

  inst('IBCB','Iberia Capital Bank','IBCB.MC','Bank','EU specialist lender','Madrid',21400,'EU',
    70,73,68,70,-3,-5,'capital','Capital constraint with strong client franchise',
    gm({cet1:12.4,tier1:13.7,leverage:5.1,tce:8.6,nim:2.34,efficiency:60.4,roe:8.8,roa:0.61,rwaDensity:56,npa:1.42,nco:0.34,allowance:1.35,ltd:104,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:0.86}),
    mix(36,40,14,6,4)),

  inst('VEGA','Vega Banco','VEGA.MI','Bank','EU specialist lender','Milan',15800,'EU',
    58,56,58,62,-6,-9,'advisor',
    'Capital and asset quality both pressuring, advisor review',
    gm({cet1:9.6,tier1:10.8,leverage:4.4,tce:6.8,nim:2.42,efficiency:64.6,roe:9.4,roa:0.55,rwaDensity:68,npa:2.84,nco:0.62,allowance:1.35,ltd:108,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:0.62}),
    mix(38,42,8,8,4)),

  inst('VSTA','Vesta Bank','VSTA.AS','Bank','EU mid-cap','Amsterdam',42600,'EU',
    89,92,87,88,2,6,'none','',
    gm({cet1:14.4,tier1:16.1,leverage:6.2,tce:10.6,nim:2.12,efficiency:51.8,roe:11.4,roa:0.78,rwaDensity:44,npa:0.64,nco:0.12,allowance:1.35,ltd:84,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.28}),
    mix(22,36,32,6,4)),

  inst('BORE','Boreal Bancorp','BORE.TO','Bank','Canadian Schedule I','Toronto',58400,'Canada',
    87,86,86,89,0,4,'monitor',
    'OSFI B-5 framework opens programmatic opportunity',
    gm({cet1:12.6,tier1:13.8,leverage:4.8,tce:9.4,nim:2.74,efficiency:51.4,roe:13.4,roa:0.92,rwaDensity:52,npa:0.58,nco:0.18,allowance:1.35,ltd:84,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.18}),
    mix(24,32,32,8,4)),

  inst('MPLT','Maple Trust','MPLT.TO','Bank','Canadian Schedule I','Montréal',32100,'Canada',
    81,83,80,80,4,8,'capital',
    'Strong franchise; OSFI B-5 makes Canada workable',
    gm({cet1:12.1,tier1:13.3,leverage:4.6,tce:8.8,nim:2.66,efficiency:53.8,roe:12.6,roa:0.86,rwaDensity:56,npa:0.62,nco:0.20,allowance:1.35,ltd:84,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.06}),
    mix(28,34,26,8,4)),

  inst('APBC','Aurora Provincial Bank','APBC.TO','Bank','Canadian Schedule I','Calgary',14800,'Canada',
    73,74,71,73,-1,0,'monitor','',
    gm({cet1:11.6,tier1:12.8,leverage:4.4,tce:8.1,nim:2.71,efficiency:58.2,roe:11.6,roa:0.81,rwaDensity:58,npa:0.82,nco:0.24,allowance:1.35,ltd:84,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(34,28,22,12,4)),

  inst('EVBC','Evergreen Bancshares','EVBC','Bank','Mid-cap US bank','WA',22600,'US',
    78,75,80,80,-2,1,'monitor','',
    gm({cet1:10.8,tier1:11.9,leverage:8.7,tce:8.2,nim:3.02,efficiency:56.8,roe:12.1,roa:1.12,npa:0.56,nco:0.21,allowance:1.35,ltd:86,creConc:234,loanGrowth:6.4,depGrowth:4.2,capGen:1.05})),

  inst('PRWB','Prairie West Bank','PRWB','Bank','Community bank','KS',5400,'US',
    67,71,66,63,-3,-7,'advisor',
    'Agriculture concentration plus thin liquidity, advisor review',
    gm({cet1:11.4,tier1:12.5,leverage:9.0,tce:8.4,nim:2.94,efficiency:64.8,roe:8.4,roa:0.84,npa:0.96,nco:0.36,allowance:1.62,ltd:102,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(14,18,16,12,40)),

  inst('CTXB','Centennial Texas Bank','CTXB','Bank','Regional US bank','TX',16200,'US',
    85,82,88,86,9,14,'growth',
    'High-growth profitable bank, capital constraint is now binding',
    gm({cet1:10.9,tier1:12.0,leverage:8.7,tce:8.2,nim:3.24,efficiency:51.4,roe:14.6,roa:1.32,npa:0.42,nco:0.13,allowance:1.28,ltd:91,creConc:218,loanGrowth:12.6,depGrowth:5.2,capGen:1.24})),

  inst('KSTN','Keystone Northeast Bank','KSTN','Bank','Regional US bank','NY',28400,'US',
    62,58,64,66,-7,-10,'risk',
    'CRE office exposure plus elevated NCO trend',
    gm({cet1:9.6,tier1:10.7,leverage:7.9,tce:6.8,nim:2.84,efficiency:62.1,roe:9.4,roa:0.84,npa:1.18,nco:0.54,allowance:1.56,ltd:98,creConc:358,loanGrowth:3.4,depGrowth:0.4,capGen:1.05}),
    mix(46,24,14,10,6)),

  inst('CCBN','Capitol City Bank & Trust','CCBN','Bank','Community bank','DC',2900,'US',
    41,38,46,41,-12,-22,'advisor',
    'Capital ratio nearing minimum; risk-transfer alternatives may need advisor scoping',
    gm({cet1:8.4,tier1:9.6,leverage:7.2,tce:5.8,nim:2.62,efficiency:71.4,roe:5.4,roa:0.51,npa:2.14,nco:0.86,allowance:1.82,ltd:104,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.05}),
    mix(42,16,14,18,10),[],[],[],'med'),

  inst('OZTB','Ozark Trust Bank','OZTB','Bank','Community bank','MO',7100,'US',
    72,75,74,67,1,3,'none','',
    gm({cet1:11.8,tier1:12.9,leverage:9.3,tce:8.6,nim:2.98,efficiency:62.4,roe:9.6,roa:0.96,npa:0.62,nco:0.18,allowance:1.35,ltd:84,creConc:220,loanGrowth:5.4,depGrowth:3.2,capGen:1.05})),
];

// ─── GISTData ─────────────────────────────────────────────────────────────────
const GISTData = (() => {
  const sorted = [...RAW].sort((a, b) => b.gist - a.gist);
  const items: Institution[] = sorted.map((r, i) => ({ ...r, rank: i + 1, isCU: r.charter === 'Credit Union' }));
  const peerGroups = [...new Set(items.map(it => it.peerGroup))];
  const jurisdictions = [...new Set(items.map(it => it.jurisdiction))];
  return {
    quarter: 'Q2 2026', refresh: '12 Jun 2026', methodology: 'v1.0',
    universe: '1,247 institutions screened · 36 in scored universe',
    items, peerGroups, jurisdictions,
    sources: [
      'Regulatory call reports (FFIEC / NCUA)', 'SEC filings (10-K / 10-Q / FR Y-9C)',
      'Annual + quarterly reports', 'Investor presentations', 'Earnings call transcripts',
      'Bank websites', 'Public market data', 'Rating agency commentary', 'Public news sources',
    ],
    caveat: 'The GIST Index is a public-source benchmark and decision-support tool. It is not a credit rating, investment recommendation, regulatory conclusion, or SRT recommendation. Scores reflect public data, Gensaki\'s normalisation choices, and methodology v1.0. Institution-specific conclusions require further diligence.',
  };
})();

// ─── Axis metrics (peer map) ──────────────────────────────────────────────────
type AxisId = 'gist'|'capital'|'balance'|'riskRoe'|'cet1'|'roe'|'returnOnRwa'|'ltd'|'creConc'|'loanGrowth'|'capGen';
const AXES: { id: AxisId; label: string; fn: (it: Institution) => number | undefined }[] = [
  { id:'gist',        label:'GIST',             fn: it => it.gist },
  { id:'capital',     label:'Capital pillar',   fn: it => it.capital },
  { id:'balance',     label:'Balance pillar',   fn: it => it.balance },
  { id:'riskRoe',     label:'Risk-adj ROE',     fn: it => it.riskRoe },
  { id:'cet1',        label:'CET1 %',           fn: it => it.metrics.cet1 ?? it.metrics.netWorth },
  { id:'roe',         label:'ROE %',            fn: it => it.metrics.roe },
  { id:'returnOnRwa', label:'Return on RWA %',  fn: it => returnOnRWA(it) },
  { id:'ltd',         label:'LTD %',            fn: it => it.metrics.ltd },
  { id:'creConc',     label:'CRE conc %',       fn: it => it.metrics.creConc },
  { id:'loanGrowth',  label:'Loan growth %',    fn: it => it.metrics.loanGrowth },
  { id:'capGen',      label:'Cap gen x',        fn: it => it.metrics.capGen },
];

// ─── Small UI atoms ───────────────────────────────────────────────────────────
function ScoreChip({ s }: { s: number }) {
  const c = scoreColor(s);
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:38, height:26, borderRadius:6, fontSize:13, fontWeight:700,
      fontFamily:ff('mono'), color:c, background:`${c}1F` }}>
      {s}
    </span>
  );
}

function RankDelta({ d }: { d: number }) {
  if (d > 0) return <span style={{ color:B.gr, fontFamily:ff('mono'), fontSize:13, fontWeight:600 }}>↑{d}</span>;
  if (d < 0) return <span style={{ color:B.rd, fontFamily:ff('mono'), fontSize:13, fontWeight:600 }}>↓{Math.abs(d)}</span>;
  return <span style={{ color:B.s, fontFamily:ff('mono'), fontSize:13 }}>−</span>;
}

function Bdg({ label, color, icon }: { label: string; color: string; icon?: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      fontSize:12, fontWeight:600, color, background:`${color}1F`,
      padding:'4px 10px', borderRadius:999, whiteSpace:'nowrap' }}>
      {icon && <span>{icon}</span>}{label}
    </span>
  );
}

function FlowWrap({ gap = 8, children }: { gap?: number; children: React.ReactNode }) {
  return <div style={{ display:'flex', flexWrap:'wrap', gap }}>{children}</div>;
}

function Sec({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background:B.card, borderRadius:12, border:`1px solid ${B.bd}`, overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 20px 14px' }}>
        <span style={{ color:B.bl, fontSize:15, fontWeight:700 }}>{icon}</span>
        <span style={{ fontSize:16, fontWeight:700, color:B.p, fontFamily:ff('geist') }}>{title}</span>
      </div>
      <div style={{ padding:'0 20px 20px' }}>{children}</div>
    </div>
  );
}

function Eyebrow({ label }: { label: string }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.7px', color:B.s, textTransform:'uppercase', marginBottom:8 }}>{label}</div>;
}

function AiInsight({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ background:`${B.pu}0F`, border:`1px solid ${B.pu}33`, borderRadius:10,
      padding:18, display:'flex', gap:12, alignItems:'flex-start' }}>
      <span style={{ fontSize:18, color:B.pu, flexShrink:0, marginTop:1 }}>◈</span>
      <div>
        <div style={{ fontSize:12, fontWeight:700, color:B.pu, marginBottom:6, letterSpacing:'0.04em', textTransform:'uppercase' }}>{title}</div>
        <div style={{ fontSize:14, color:B.p, lineHeight:1.65, fontFamily:ff('geist') }}>{text}</div>
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({ tabs, sel, onSel }: { tabs: { id: string; label: string; icon: string }[]; sel: string; onSel: (id: string) => void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, justifyContent:'space-between' }}>
      <div style={{ display:'flex', gap:8, overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onSel(t.id)} style={{
            display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:8,
            fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', border:'none',
            background: sel === t.id ? B.bl : 'transparent',
            color: sel === t.id ? '#fff' : B.s,
            outline: sel === t.id ? 'none' : `1px solid ${B.bd}`,
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <span style={{ fontFamily: ff('geist'), fontSize:13, fontWeight:600, color:B.s, whiteSpace:'nowrap', paddingLeft:16 }}>
        1,247 institutions scored · Methodology v1.0 · Refreshed 12 Jun 2026
      </span>
    </div>
  );
}

function PillPicker({ options, sel, onSel }: { options: string[]; sel: string; onSel: (s: string) => void }) {
  return (
    <div style={{ display:'flex', gap:6, overflowX:'auto' }}>
      {options.map(o => (
        <button key={o} onClick={() => onSel(o)} style={{
          fontSize:13, fontWeight:600, padding:'7px 14px', borderRadius:7, cursor:'pointer',
          border:'none', background: sel === o ? B.p : 'transparent',
          color: sel === o ? '#fff' : B.s,
          outline: sel === o ? 'none' : `1px solid ${B.bd}`,
          fontFamily: ff('geist'),
        }}>{o}</button>
      ))}
    </div>
  );
}

function FilterGroup({ label, opts, sel, onSel }: { label: string; opts: string[]; sel: string; onSel: (s: string) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ fontSize:11, fontWeight:700, color:B.s, letterSpacing:'0.5px', textTransform:'uppercase', fontFamily:ff('geist') }}>{label}</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {opts.map(o => (
          <button key={o} onClick={() => onSel(o)} style={{
            fontSize:12, fontWeight:500, padding:'6px 12px', borderRadius:6, cursor:'pointer',
            border:'none', background: sel === o ? `${B.bl}1F` : 'transparent',
            color: sel === o ? B.bl : B.s,
            outline: sel === o ? 'none' : `1px solid ${B.bd}`,
            fontFamily: ff('geist'),
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Section indicator ────────────────────────────────────────────────────────
function SectionIndicator({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} onClick={() => onSelect(i)} style={{
          width: i === active ? 22 : 14, height:3, borderRadius:99,
          background: i === active ? C.cyan : B.bl,
          cursor:'pointer', transition:'width 0.25s ease-out',
          boxShadow:'0 2px 4px rgba(0,0,0,0.22)',
        }} />
      ))}
    </div>
  );
}

// ─── Institution detail modal ─────────────────────────────────────────────────
function InstitutionDetail({ item, onClose }: { item: Institution; onClose: () => void }) {
  const [sub, setSub] = useState('summary');
  const m = item.metrics;
  const arc = archetypeOf(item);
  const arcData = ARC[arc];
  const rb = ratingBand(item.gist);
  const srt = SRT[item.srtSignalRaw];
  const rorwa = returnOnRWA(item);

  const detailTabs = [
    { id:'summary', label:'Summary', icon:'⊟' },
    { id:'capital', label:'Capital', icon:'◑' },
    { id:'balance', label:'Balance sheet', icon:'⚖' },
    { id:'risk',    label:'Risk-adj ROE', icon:'↗' },
    { id:'srt',     label:'SRT & sources', icon:'⚡' },
  ];

  function MetricGrid({ rows }: { rows: [string, string, string][] }) {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:12 }}>
        {rows.map(([label, val, color]) => (
          <div key={label} style={{ background:B.bg, borderRadius:10, border:`1px solid ${B.bd}`, padding:14 }}>
            <div style={{ fontSize:11, fontWeight:600, color:B.s, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6, fontFamily:ff('geist') }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, fontFamily:ff('mono'), color }}>{val}</div>
          </div>
        ))}
      </div>
    );
  }

  const insightText = item.srtSignalRaw === 'none'
    ? `${item.name} scores ${item.gist} on the blend, with capital, balance sheet, and risk-adjusted ROE reading consistently. No SRT signal is visible from current public data.`
    : `${item.name} scores ${item.gist} on the blend. The signal is ${srt.label.toLowerCase()}: ${item.srtReason || srt.sub}. This is a public-source flag, not a recommendation.`;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:B.bg, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Banner */}
      <div style={{ background:B.card, borderBottom:`1px solid ${B.bd}`, padding:'0 28px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18, padding:'20px 0 16px' }}>
          <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:B.s, fontSize:14, fontWeight:600, fontFamily:ff('geist'), flexShrink:0 }}>
            ← Back
          </button>
          <div style={{ width:1, height:32, background:B.bd }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5, flexWrap:'wrap' }}>
              <span style={{ fontSize:20, fontWeight:700, color:B.p, fontFamily:ff('geist') }}>{item.name}</span>
              <span style={{ fontSize:12, fontWeight:600, fontFamily:ff('mono'), color:B.s, background:B.bg, padding:'3px 8px', borderRadius:5 }}>{item.ticker ?? item.id}</span>
              {item.confidence === 'med' && <Bdg label="Med confidence" color={B.am} icon="⚠" />}
            </div>
            <div style={{ fontSize:13, color:B.s, fontFamily:ff('geist') }}>{item.peerGroup} · {item.state} · {item.jurisdiction} · {fmtAssets(item.assets)} assets</div>
          </div>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:600, color:B.s, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:2 }}>GIST</div>
            <div style={{ fontSize:32, fontWeight:700, fontFamily:ff('mono'), color:scoreColor(item.gist), lineHeight:1 }}>{item.gist}</div>
            <div style={{ fontSize:11, fontWeight:700, color:rb.color, marginTop:3 }}>{rb.label}</div>
          </div>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:600, color:B.s, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:2 }}>RANK</div>
            <div style={{ fontSize:24, fontWeight:700, fontFamily:ff('mono'), color:B.p, lineHeight:1 }}>{item.rank}</div>
          </div>
          {item.srtSignalRaw !== 'none' && <Bdg label={srt.label} color={srt.color} icon={srt.icon} />}
        </div>
        <div style={{ display:'flex', gap:4, paddingBottom:0 }}>
          {detailTabs.map(t => (
            <button key={t.id} onClick={() => setSub(t.id)} style={{
              display:'flex', alignItems:'center', gap:7, padding:'10px 16px',
              background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600,
              color: sub===t.id ? B.bl : B.s, fontFamily:ff('geist'),
              borderBottom: sub===t.id ? `2px solid ${B.bl}` : '2px solid transparent',
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:28 }}>
        <div style={{ maxWidth:1000 }}>
          {sub === 'summary' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <AiInsight title="Institution read" text={insightText} />
              <Sec title="Pillar scores" icon="⊟">
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                  {([['Capital','35%',item.capital,scoreColor(item.capital)],['Balance sheet','30%',item.balance,scoreColor(item.balance)],['Risk-adj ROE','35%',item.riskRoe,scoreColor(item.riskRoe)],['GIST','blend',item.gist,scoreColor(item.gist)]] as [string,string,number,string][]).map(([lbl,wt,score,col]) => (
                    <div key={lbl} style={{ background:B.bg, borderRadius:10, border:`1px solid ${B.bd}`, padding:16, minWidth:140 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:B.s, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6, fontFamily:ff('geist') }}>{lbl}</div>
                      <div style={{ fontSize:30, fontWeight:700, fontFamily:ff('mono'), color:col, lineHeight:1 }}>{score}</div>
                      <div style={{ height:4, borderRadius:99, background:B.bd, marginTop:10, marginBottom:6 }}>
                        <div style={{ height:4, borderRadius:99, background:col, width:`${score}%`, transition:'width 0.6s ease' }} />
                      </div>
                      <div style={{ fontSize:12, color:B.s, fontFamily:ff('geist') }}>weight {wt}</div>
                    </div>
                  ))}
                </div>
              </Sec>
              <Sec title={`Capital archetype & indicated actions · ${arcData.icon} ${arcData.label}`} icon={arcData.icon}>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <Bdg label={arcData.label} color={arcData.color} icon={arcData.icon} />
                    <Bdg label={rb.label} color={rb.color} />
                  </div>
                  <div style={{ fontSize:14, color:B.p, lineHeight:1.65, fontFamily:ff('geist') }}>{arcData.blurb}</div>
                  <div>
                    <Eyebrow label="Indicated capital actions" />
                    <FlowWrap gap={6} >
                      {arcData.actions.map(a => (
                        <span key={a} style={{ fontSize:12, fontWeight:600, color:arcData.color,
                          background:`${arcData.color}1A`, border:`1px solid ${arcData.color}40`,
                          padding:'5px 10px', borderRadius:6 }}>{a}</span>
                      ))}
                    </FlowWrap>
                  </div>
                  <div style={{ fontSize:13, color:B.s, fontStyle:'italic', fontFamily:ff('geist') }}>Instrument-neutral read. Synthetic risk transfer is one option among the actions above.</div>
                </div>
              </Sec>
              {(item.driversPlus.length > 0 || item.driversMinus.length > 0) && (
                <Sec title="What is driving the score" icon="↔">
                  <div style={{ display:'flex', gap:20 }}>
                    {[['Supporting', item.driversPlus, B.gr,'↑'],['Pressuring',item.driversMinus,B.rd,'↓']].map(([title, items, color, icon]) => (
                      <div key={title as string} style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:color as string, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>{title as string}</div>
                        {(items as string[]).length === 0
                          ? <div style={{ fontSize:13, color:B.s, fontFamily:ff('geist') }}>None noted this quarter</div>
                          : (items as string[]).map(t => (
                            <div key={t} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
                              <span style={{ color:color as string, marginTop:2, fontSize:14 }}>{icon as string}</span>
                              <span style={{ fontSize:13, color:B.p, lineHeight:1.55, fontFamily:ff('geist') }}>{t}</span>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </Sec>
              )}
              {item.driversQuestions.length > 0 && (
                <Sec title="Questions a diligence team would ask" icon="?">
                  {item.driversQuestions.map((q, i) => (
                    <div key={i} style={{ display:'flex', gap:12, marginBottom:12, alignItems:'flex-start' }}>
                      <span style={{ fontSize:13, fontWeight:700, fontFamily:ff('mono'), color:B.bl, minWidth:20, flexShrink:0 }}>{i+1}</span>
                      <span style={{ fontSize:14, color:B.p, lineHeight:1.6, fontFamily:ff('geist') }}>{q}</span>
                    </div>
                  ))}
                </Sec>
              )}
            </div>
          )}
          {sub === 'capital' && (
            <Sec title="Capital & buffers" icon="◑">
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <MetricGrid rows={[
                  ['CET1 ratio', fmtPct(m.cet1), (m.cet1??99) < 10 ? B.am : B.p],
                  ['Tier 1 ratio', fmtPct(m.tier1), B.p],
                  ['Leverage ratio', fmtPct(m.leverage), B.p],
                  ['TCE / TA', fmtPct(m.tce), B.p],
                  ['Net worth (CU)', fmtPct(m.netWorth), B.p],
                  ['Capital generation', `${fmtNum(m.capGen,2)}x`, (m.capGen??1) < 1 ? B.am : B.gr],
                ]} />
                <div style={{ fontSize:14, color:B.s, lineHeight:1.7, fontFamily:ff('geist') }}>
                  {item.isCU
                    ? 'As a credit union, the binding capital measure is the net worth ratio rather than CET1. NCUA does not yet recognise synthetic risk transfer for regulatory net worth relief, which is an active area of engagement.'
                    : 'The capital pillar weighs the level and trend of the ratio against internal generation and the pace of RWA growth. A binding ratio with strong earnings is the classic capital-efficiency profile for synthetic protection.'}
                </div>
              </div>
            </Sec>
          )}
          {sub === 'balance' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Sec title="Asset mix" icon="◕">
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ height:26, borderRadius:6, overflow:'hidden', display:'flex' }}>
                    {([['CRE',item.assetMix.cre,B.bl],['C&I',item.assetMix.ci,B.pu],['Residential',item.assetMix.res,B.gr],['Consumer',item.assetMix.cons,B.am],['Other',item.assetMix.other,B.s]] as [string,number,string][]).map(([lbl,pct,col]) => (
                      <div key={lbl} title={lbl} style={{ width:`${pct}%`, background:col }} />
                    ))}
                  </div>
                  <FlowWrap gap={10}>
                    {([['CRE',item.assetMix.cre,B.bl],['C&I',item.assetMix.ci,B.pu],['Residential',item.assetMix.res,B.gr],['Consumer',item.assetMix.cons,B.am],['Other',item.assetMix.other,B.s]] as [string,number,string][]).map(([lbl,pct,col]) => (
                      <span key={lbl} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                        <span style={{ width:10, height:10, borderRadius:2, background:col, display:'inline-block' }} />
                        <span style={{ color:B.p, fontWeight:500 }}>{lbl}</span>
                        <span style={{ fontFamily:ff('mono'), fontWeight:700, color:B.s }}>{pct}%</span>
                      </span>
                    ))}
                  </FlowWrap>
                </div>
              </Sec>
              <Sec title="Balance-sheet metrics" icon="⚖">
                <MetricGrid rows={[
                  ['Loan / deposit', fmtPct(m.ltd,0), m.ltd > 95 ? B.am : B.p],
                  ['CRE concentration', m.creConc != null ? fmtPct(m.creConc,0) : 'n/a', (m.creConc??0) > 300 ? B.am : B.p],
                  ['Loan growth', fmtPct(m.loanGrowth), B.p],
                  ['Deposit growth', fmtPct(m.depGrowth), B.p],
                  ['NIM', fmtPct(m.nim,2), B.p],
                  ['Efficiency ratio', fmtPct(m.efficiency), B.p],
                ]} />
              </Sec>
            </div>
          )}
          {sub === 'risk' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Sec title="Profitability & capital productivity" icon="↗">
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <MetricGrid rows={[
                    ['ROE', fmtPct(m.roe), B.p],
                    ['ROA', fmtPct(m.roa,2), B.p],
                    ['Return on RWA', rorwa != null ? fmtPct(rorwa,2) : 'n/a', B.bl],
                    ['RWA density', m.rwaDensity != null ? fmtPct(m.rwaDensity,0) : 'n/a', B.p],
                    ['NIM', fmtPct(m.nim,2), B.p],
                    ['Efficiency', fmtPct(m.efficiency), B.p],
                    ['Cap generation', `${fmtNum(m.capGen,2)}x`, (m.capGen??1) < 1 ? B.am : B.gr],
                  ]} />
                  {rorwa != null && <div style={{ fontSize:14, color:B.s, lineHeight:1.7, fontFamily:ff('geist') }}>
                    {rorwa >= 1.8 ? `Return on RWA of ${fmtPct(rorwa,2)} is strong: the balance sheet is converting risk-weighted capital into earnings efficiently.`
                    : rorwa < 1.4 ? `Return on RWA of ${fmtPct(rorwa,2)} is on the softer side of the universe. Capital productivity is a watch item.`
                    : `Return on RWA of ${fmtPct(rorwa,2)} sits around the middle of the scored universe.`}
                  </div>}
                </div>
              </Sec>
              <Sec title="Asset quality" icon="⚠">
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <MetricGrid rows={[
                    ['NPA / assets', fmtPct(m.npa,2), m.npa > 1.0 ? B.rd : m.npa > 0.7 ? B.am : B.gr],
                    ['Net charge-offs', fmtPct(m.nco,2), m.nco > 0.4 ? B.rd : m.nco > 0.3 ? B.am : B.gr],
                    ['Allowance / loans', fmtPct(m.allowance,2), B.p],
                  ]} />
                  <div style={{ fontSize:14, color:B.s, fontFamily:ff('geist') }}>NPA at {fmtPct(m.npa,2)}, NCO at {fmtPct(m.nco,2)}, allowance coverage at {fmtPct(m.allowance,2)} of loans.</div>
                </div>
              </Sec>
            </div>
          )}
          {sub === 'srt' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Sec title={`SRT signal · ${srt.label}`} icon={srt.icon}>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <Bdg label={srt.label} color={srt.color} icon={srt.icon} />
                  <div style={{ fontSize:14, color:B.p, lineHeight:1.65, fontFamily:ff('geist') }}>{item.srtReason || srt.sub}</div>
                  {item.srtSignalRaw !== 'none' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {['A synthetic structure could transfer credit risk on a reference pool to third-party protection sellers','Regulatory capital relief depends on a significant-risk-transfer assessment in the relevant jurisdiction','This is a public-source signal, not a recommendation, and would require institution-level diligence'].map(t => (
                        <div key={t} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                          <span style={{ color:srt.color, fontSize:12, marginTop:2, flexShrink:0 }}>→</span>
                          <span style={{ fontSize:14, color:B.p, lineHeight:1.6, fontFamily:ff('geist') }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Sec>
              <Sec title="Sources & method" icon="⊡">
                <FlowWrap gap={8}>
                  {['Regulatory call reports','SEC filings / FR Y-9C','Investor presentations','Earnings transcripts','Public market data'].map(s => (
                    <span key={s} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:500,
                      background:B.bg, border:`1px solid ${B.bd}`, padding:'5px 10px', borderRadius:6 }}>
                      <span style={{ color:B.gr }}>✓</span> {s}
                    </span>
                  ))}
                </FlowWrap>
                <div style={{ fontSize:13, color:B.s, marginTop:14, lineHeight:1.7, fontFamily:ff('geist') }}>{GISTData.caveat}</div>
              </Sec>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
export interface GISTIndexProps {
  onSelectItem?: (v: string | null) => void;
}

export default function GISTIndexView({ onSelectItem }: GISTIndexProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [tab, setTab] = useState('leaderboard');
  const [selected, setSelected] = useState<Institution | null>(null);

  // Leaderboard state
  const [lbSub, setLbSub] = useState('Ranked');
  const [lbSort, setLbSort] = useState<string>('rank');
  const [lbSortAsc, setLbSortAsc] = useState(true);
  const [fCharter, setFCharter] = useState('All');
  const [fSize, setFSize] = useState('All');
  const [fJuris, setFJuris] = useState('All');
  const [lbSearch, setLbSearch] = useState('');

  // Peer map state
  const [xAxisId, setXAxisId] = useState<AxisId>('capital');
  const [yAxisId, setYAxisId] = useState<AxisId>('riskRoe');

  const sectionRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  // Responsive breakpoint
  useEffect(() => {
    const obs = new ResizeObserver(es => setIsCompact(es[0].contentRect.width < 1080));
    const el = scrollRef.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // IntersectionObserver for active section
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const idx = sectionRefs.findIndex(r => r.current === e.target);
          if (idx >= 0) setActiveIndex(idx);
        }
      }
    }, { root, threshold: 0.5 });
    sectionRefs.forEach(r => { if (r.current) obs.observe(r.current); });
    return () => obs.disconnect();
  }, []);

  function scrollTo(idx: number) {
    sectionRefs[idx]?.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // ─── Leaderboard filtering & sorting ────────────────────────────────────────
  const items = GISTData.items;

  function sizeMatch(assets: number, band: string) {
    if (band === '< $10B') return assets < 10000;
    if (band === '$10–50B') return assets >= 10000 && assets < 50000;
    if (band === '> $50B') return assets >= 50000;
    return true;
  }

  function matchesSearch(it: Institution) {
    const q = lbSearch.trim().toLowerCase();
    if (!q) return true;
    const arc = archetypeOf(it);
    const fields = [it.name, it.ticker??'', it.id, it.peerGroup, it.state, it.jurisdiction,
      SRT[it.srtSignalRaw].label, ARC[arc].label, ARC[arc].short];
    return fields.some(f => f.toLowerCase().includes(q));
  }

  const lbFiltered = items.filter(it =>
    (fCharter === 'All' || it.charter === fCharter) &&
    (fJuris === 'All' || it.jurisdiction === fJuris) &&
    sizeMatch(it.assets, fSize) &&
    matchesSearch(it)
  );

  function defaultAsc(col: string) {
    return ['rank','institution','peerGroup','signal','archetype'].includes(col);
  }

  function handleSort(col: string) {
    if (lbSort === col) { setLbSortAsc(a => !a); }
    else { setLbSort(col); setLbSortAsc(defaultAsc(col)); }
  }

  const lbDisplayed = [...lbFiltered].sort((a, b) => {
    const asc = lbSortAsc;
    function tie<T extends number|string>(x: T, y: T): number {
      if (x === y) return a.rank - b.rank;
      if (typeof x === 'string') return asc ? (x as string).localeCompare(y as string) : (y as string).localeCompare(x as string);
      return asc ? (x as number) - (y as number) : (y as number) - (x as number);
    }
    switch (lbSort) {
      case 'rank':      return tie(a.rank, b.rank);
      case 'assets':    return tie(a.assets, b.assets);
      case 'gist':      return tie(a.gist, b.gist);
      case 'capital':   return tie(a.capital, b.capital);
      case 'balance':   return tie(a.balance, b.balance);
      case 'riskRoe':   return tie(a.riskRoe, b.riskRoe);
      case 'qoq':       return tie(a.rankQoQ, b.rankQoQ);
      case 'yoy':       return tie(a.rankYoY, b.rankYoY);
      case 'institution': return tie(a.name, b.name);
      case 'peerGroup': return tie(a.peerGroup, b.peerGroup);
      case 'signal':    return tie(SRT[a.srtSignalRaw].label, SRT[b.srtSignalRaw].label);
      case 'archetype': return tie(ARC[archetypeOf(a)].label, ARC[archetypeOf(b)].label);
      default:          return a.rank - b.rank;
    }
  });

  // ─── Column header ───────────────────────────────────────────────────────────
  function Thd({ label, col, w }: { label: string; col: string; w: number }) {
    const active = lbSort === col;
    return (
      <button onClick={() => handleSort(col)} style={{
        display:'flex', alignItems:'center', gap:4, width:w, minWidth:w, fontSize:12,
        fontWeight:600, color: active ? B.bl : B.s, background:'none', border:'none',
        cursor:'pointer', padding:0, textAlign:'left', fontFamily:ff('geist'),
        letterSpacing:'0.01em',
      }}>
        {label}
        <span style={{ fontSize:9, opacity: active ? 1 : 0.4 }}>{active ? (lbSortAsc?'↑':'↓') : '↕'}</span>
      </button>
    );
  }

  // ─── Leaderboard row ─────────────────────────────────────────────────────────
  function LbRow({ it }: { it: Institution }) {
    const arc = archetypeOf(it);
    const arcData = ARC[arc];
    const srt = SRT[it.srtSignalRaw];
    return (
      <div onClick={() => setSelected(it)} style={{ display:'flex', alignItems:'center', padding:'13px 0',
        borderBottom:`1px solid ${B.bd}`, cursor:'pointer', fontFamily:ff('geist'),
        transition:'background 0.1s' }}
        onMouseEnter={e => (e.currentTarget.style.background = `${B.bl}05`)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <span style={{ width:36, minWidth:36, fontSize:13, fontWeight:600, fontFamily:ff('mono'), color:B.s }}>{it.rank}</span>
        <div style={{ width:240, minWidth:240, paddingRight:12 }}>
          <div style={{ fontSize:14, fontWeight:600, color:B.p, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it.name}</div>
          <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:3 }}>
            <span style={{ fontSize:11, fontWeight:500, fontFamily:ff('mono'), color:B.s }}>{it.ticker??it.id}</span>
            <span style={{ color:B.bd }}>·</span>
            <span style={{ fontSize:11, color:B.s }}>{it.charter === 'Credit Union' ? 'CU' : 'Bank'}</span>
            <span style={{ fontSize:11, fontWeight:600, color:B.bl, background:`${B.bl}1A`, padding:'1px 6px', borderRadius:4 }}>{it.jurisdiction}</span>
          </div>
        </div>
        <span style={{ width:170, minWidth:170, fontSize:13, color:B.s, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', paddingRight:12 }}>{it.peerGroup}</span>
        <span style={{ width:80, minWidth:80, fontSize:13, fontWeight:500, fontFamily:ff('mono'), color:B.p }}>{fmtAssets(it.assets)}</span>
        <span style={{ width:60, minWidth:60 }}><ScoreChip s={it.gist} /></span>
        <span style={{ width:60, minWidth:60 }}><ScoreChip s={it.capital} /></span>
        <span style={{ width:60, minWidth:60 }}><ScoreChip s={it.balance} /></span>
        <span style={{ width:68, minWidth:68 }}><ScoreChip s={it.riskRoe} /></span>
        <span style={{ width:60, minWidth:60 }}><RankDelta d={it.rankQoQ} /></span>
        <span style={{ width:56, minWidth:56 }}><RankDelta d={it.rankYoY} /></span>
        <span style={{ width:162, minWidth:162 }}>
          {it.srtSignalRaw === 'none' ? <span style={{ fontSize:13, color:B.s }}>−</span> : <Bdg label={srt.label} color={srt.color} icon={srt.icon} />}
        </span>
        <span style={{ width:162, minWidth:162 }}><Bdg label={arcData.short} color={arcData.color} icon={arcData.icon} /></span>
      </div>
    );
  }

  // ─── Watch chip ──────────────────────────────────────────────────────────────
  function WatchChip({ it }: { it: Institution }) {
    const srt = SRT[it.srtSignalRaw];
    return (
      <div onClick={() => setSelected(it)} style={{ width:320, padding:12, background:B.card,
        borderRadius:9, border:`1px solid ${srt.color}4D`, cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          <span style={{ color:srt.color, fontWeight:700, fontSize:11 }}>{srt.icon} {srt.label}</span>
          <div style={{ flex:1 }} />
          <ScoreChip s={it.gist} />
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:B.p, marginBottom:4 }}>{it.name}</div>
        <div style={{ fontSize:11, color:B.s, lineHeight:1.4 }}>{it.srtReason || srt.sub}</div>
      </div>
    );
  }

  // ─── Scatter chart ───────────────────────────────────────────────────────────
  function ScatterChart() {
    const xAxis = AXES.find(a => a.id === xAxisId)!;
    const yAxis = AXES.find(a => a.id === yAxisId)!;
    const pts = items.filter(it => xAxis.fn(it) != null && yAxis.fn(it) != null);
    const xs = pts.map(it => xAxis.fn(it) as number);
    const ys = pts.map(it => yAxis.fn(it) as number);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const W = 600, H = 360, PAD = 40;
    const scaleX = (v: number) => PAD + ((v - xMin) / (xMax - xMin || 1)) * (W - PAD * 2);
    const scaleY = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin || 1)) * (H - PAD * 2);
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block', overflow:'visible' }}>
        {/* Grid */}
        {[0.25,0.5,0.75].map(t => (
          <React.Fragment key={t}>
            <line x1={PAD} x2={W-PAD} y1={PAD + t*(H-PAD*2)} y2={PAD + t*(H-PAD*2)} stroke={B.bd} strokeWidth={1} />
            <line x1={PAD + t*(W-PAD*2)} x2={PAD + t*(W-PAD*2)} y1={PAD} y2={H-PAD} stroke={B.bd} strokeWidth={1} />
          </React.Fragment>
        ))}
        {/* Points */}
        {pts.map(it => {
          const x = scaleX(xAxis.fn(it) as number);
          const y = scaleY(yAxis.fn(it) as number);
          const r = Math.sqrt(it.assets / 1000) * 2 + 4;
          const srtData = SRT[it.srtSignalRaw];
          return (
            <g key={it.id} onClick={() => setSelected(it)} style={{ cursor:'pointer' }}>
              <circle cx={x} cy={y} r={r} fill={srtData.color} opacity={0.78} />
              <text x={x} y={y - r - 2} textAnchor="middle" fontSize={7} fontWeight={600}
                fontFamily={ff('mono')} fill={B.s}>{it.ticker??it.id}</text>
            </g>
          );
        })}
        {/* Axis labels */}
        <text x={W/2} y={H-4} textAnchor="middle" fontSize={10} fill={B.s}>{xAxis.label}</text>
        <text x={8} y={H/2} textAnchor="middle" fontSize={10} fill={B.s} transform={`rotate(-90,8,${H/2})`}>{yAxis.label}</text>
      </svg>
    );
  }

  // ─── Pillar card (method tab) ────────────────────────────────────────────────
  function PillarCard({ tag, weight, color, title, body, bullets }: {
    tag: string; weight: string; color: string; title: string; body: string; bullets: string[];
  }) {
    return (
      <div style={{ background:B.bg, borderRadius:12, border:`1px solid ${B.bd}`, padding:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <span style={{ fontSize:11, fontWeight:700, color, background:`${color}1F`, padding:'4px 10px', borderRadius:6, letterSpacing:'0.04em' }}>PILLAR {tag}</span>
          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ fontSize:12, color:B.s, fontFamily:ff('geist') }}>weight</span>
            <span style={{ fontSize:16, fontWeight:700, fontFamily:ff('mono'), color }}>{weight}</span>
          </span>
        </div>
        <div style={{ fontSize:17, fontWeight:700, color:B.p, marginBottom:8, fontFamily:ff('geist') }}>{title}</div>
        <div style={{ fontSize:14, color:B.s, marginBottom:14, lineHeight:1.65, fontFamily:ff('geist') }}>{body}</div>
        {bullets.map(b => (
          <div key={b} style={{ display:'flex', gap:10, marginBottom:7, alignItems:'flex-start' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:color, marginTop:7, flexShrink:0, display:'block' }} />
            <span style={{ fontSize:13, color:B.p, lineHeight:1.5, fontFamily:ff('geist') }}>{b}</span>
          </div>
        ))}
      </div>
    );
  }

  const TABS = [
    { id:'leaderboard', label:'Leaderboard',     icon:'☰' },
    { id:'method',      label:'Method & sources', icon:'⌕' },
  ];

  const flagged = items.filter(it => it.srtSignalRaw !== 'none');

  // ─── Hero section ────────────────────────────────────────────────────────────
  const heroSection = (
    <div ref={sectionRefs[0]} style={{
      height:'100vh', scrollSnapAlign:'start', flexShrink:0,
      background:`linear-gradient(to bottom, #F2FBF4, ${C.bg} 42%), radial-gradient(ellipse at 50% -20%, ${C.mint1}, ${C.mint2}, transparent 60%)`,
      display:'flex', flexDirection:'column',
    }}>
      <div style={{ flex:1, display:'flex', alignItems:'center', padding:`0 ${isCompact?20:40}px` }}>
        <div style={{ maxWidth:1180, width:'100%', margin:'0 auto' }}>
          <div style={{ maxWidth:720 }}>
            <div style={{ marginBottom:32 }}>
              <HeroEyebrow text={`Capital stewardship, scored · ${GISTData.quarter}`} />
            </div>
            <div style={{ fontFamily:ff('geist'), fontSize:isCompact?46:70, fontWeight:500,
              letterSpacing:isCompact?'-1.6px':'-3px', lineHeight:1.05, marginBottom:28 }}>
              <span style={{ color:C.ink }}>The Gensaki Index{'\n'}of Stewardship Tiers, </span>
              <span style={{ color:C.mute }}>(GIST).</span>
            </div>
            <div style={{ fontFamily:ff('mono'), fontSize:isCompact?13:15, color:C.ink2, lineHeight:1.8, marginBottom:36 }}>
              <div>// A quarterly capital-stewardship benchmark for banks and credit unions.</div>
              <div>// Scored on capital, balance-sheet discipline, and risk-adjusted ROE.</div>
              <div>// GIST = 0.35 Capital + 0.30 Balance + 0.35 Risk-adjusted ROE.</div>
            </div>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              <CTAButton title="Explore the index" kind="ink" onClick={() => scrollTo(1)} />
              <CTAButton title="Read the methodology" kind="ghost" onClick={() => { setTab('method'); scrollTo(1); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Data section ────────────────────────────────────────────────────────────
  const hPad = isCompact ? 20 : 40;

  const dataSection = (
    <div ref={sectionRefs[1]} style={{ height:'100vh', scrollSnapAlign:'start', flexShrink:0, overflowY:'auto', background:B.bg }}>
      <div style={{ maxWidth:1180, margin:'0 auto', padding:`${isCompact?56:76}px ${hPad}px 56px` }}>

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:C.cyan }} />
            <span style={{ fontFamily:ff('mono'), fontSize:11.5, letterSpacing:'0.8px', color:C.mute, textTransform:'uppercase' }}>The GIST</span>
          </div>
          <div style={{ fontFamily:ff('geist'), fontSize:isCompact?30:40, fontWeight:500, letterSpacing:isCompact?'-1px':'-1.4px', marginBottom:12 }}>
            <span style={{ color:C.ink }}>The Gensaki Index </span>
            <span style={{ color:C.mute }}>of Stewardship Tiers</span>
          </div>
          <div style={{ fontFamily:ff('geist'), fontSize:15, fontWeight:400, color:C.mute, lineHeight:1.6, maxWidth:720 }}>
            Ranked view of the scored universe. GIST blends capital strength, balance-sheet discipline, and risk-adjusted ROE to compare how effectively each institution is stewarding capital. Tap any row for the full institution read.
          </div>
        </div>

        <TabBar tabs={TABS} sel={tab} onSel={id => setTab(id)} />

        <div style={{ marginTop:20 }}>

          {/* ── Leaderboard ── */}
          {tab === 'leaderboard' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ position:'relative' }}>
                <Sec title="Leaderboard" icon="☰">
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <PillPicker options={['Ranked','Most improved']} sel={lbSub} onSel={s => {
                      setLbSub(s);
                      if (s === 'Most improved') { setLbSort('yoy'); setLbSortAsc(false); }
                      else { setLbSort('rank'); setLbSortAsc(true); }
                    }} />
                    <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
                      <FilterGroup label="Charter" opts={['All','Bank','Credit Union']} sel={fCharter} onSel={setFCharter} />
                      <FilterGroup label="Size" opts={['All','< $10B','$10–50B','> $50B']} sel={fSize} onSel={setFSize} />
                      <FilterGroup label="Jurisdiction" opts={['All', ...GISTData.jurisdictions]} sel={fJuris} onSel={setFJuris} />
                    </div>
                    <div style={{ height:1, background:B.bd }} />
                    <div style={{ overflowX:'auto' }}>
                      <div style={{ minWidth:1234 }}>
                        <div style={{ display:'flex', alignItems:'center', padding:'10px 0', borderBottom:`2px solid ${B.bd}` }}>
                          <Thd label="#" col="rank" w={36} />
                          <Thd label="Institution" col="institution" w={240} />
                          <Thd label="Peer group" col="peerGroup" w={170} />
                          <Thd label="Assets" col="assets" w={80} />
                          <Thd label="GIST" col="gist" w={60} />
                          <Thd label="CAP" col="capital" w={60} />
                          <Thd label="BAL" col="balance" w={60} />
                          <Thd label="R-ROE" col="riskRoe" w={68} />
                          <Thd label="QoQ" col="qoq" w={60} />
                          <Thd label="YoY" col="yoy" w={56} />
                          <Thd label="SRT Signal" col="signal" w={162} />
                          <Thd label="Archetype" col="archetype" w={162} />
                        </div>
                        {lbDisplayed.map(it => <LbRow key={it.id} it={it} />)}
                      </div>
                    </div>
                  </div>
                </Sec>
                {/* Search overlay */}
                <div style={{ position:'absolute', top:12, right:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px',
                    background:B.bg, border:`1px solid ${B.bd}`, borderRadius:8 }}>
                    <span style={{ color:B.s, fontSize:13 }}>⌕</span>
                    <input value={lbSearch} onChange={e => setLbSearch(e.target.value)}
                      placeholder="Search institutions"
                      style={{ border:'none', outline:'none', background:'none', fontSize:13, color:B.p, width:200, fontFamily:ff('geist') }} />
                    {lbSearch && <button onClick={() => setLbSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:B.s, fontSize:13 }}>✕</button>}
                  </div>
                </div>
              </div>
              <div style={{ fontSize:13, color:B.s }}>{lbDisplayed.length} institutions shown · click any row for the full institution read</div>
            </div>
          )}

          {/* ── Peer map ── */}
          {tab === 'peermap' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Sec title="Peer map" icon="⊹">
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div style={{ fontSize:12, color:B.s }}>Plot any two dimensions of the scored universe. Color encodes the SRT signal; point size scales with assets.</div>
                  <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
                    {[['X AXIS', xAxisId, setXAxisId], ['Y AXIS', yAxisId, setYAxisId]].map(([lbl, sel, setSel]) => (
                      <div key={lbl as string} style={{ display:'flex', flexDirection:'column', gap:5 }}>
                        <Eyebrow label={lbl as string} />
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap', maxWidth:360 }}>
                          {AXES.map(a => (
                            <button key={a.id} onClick={() => (setSel as (v: AxisId) => void)(a.id)} style={{
                              fontSize:10, fontWeight:600, padding:'4px 8px', borderRadius:5, cursor:'pointer',
                              background: sel === a.id ? B.bl : 'transparent', color: sel === a.id ? '#fff' : B.s,
                              border: sel === a.id ? 'none' : `1px solid ${B.bd}`,
                            }}>{a.label}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <ScatterChart />
                  {/* Legend */}
                  <FlowWrap gap={8}>
                    {SRT_ORDER.map(k => (
                      <span key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:B.s }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:SRT[k].color, display:'inline-block' }} />
                        {SRT[k].label}
                      </span>
                    ))}
                  </FlowWrap>
                </div>
              </Sec>
            </div>
          )}

          {/* ── Movers ── */}
          {tab === 'movers' && (() => {
            const risers = [...items].filter(it => it.rankQoQ > 0).sort((a,b) => b.rankQoQ - a.rankQoQ).slice(0,8);
            const decliners = [...items].filter(it => it.rankQoQ < 0).sort((a,b) => a.rankQoQ - b.rankQoQ).slice(0,8);
            const watch = items.filter(it => it.srtSignalRaw !== 'none').sort((a,b) => b.gist - a.gist);
            function MoverRow({ it }: { it: Institution }) {
              return (
                <div onClick={() => setSelected(it)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                  borderBottom:`1px solid ${B.bd}99`, cursor:'pointer' }}>
                  <div style={{ width:44 }}><RankDelta d={it.rankQoQ} /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:B.p }}>{it.name}</div>
                    <div style={{ fontSize:10, color:B.s }}>{it.ticker??it.id} · {it.peerGroup}</div>
                  </div>
                  <ScoreChip s={it.gist} />
                  {it.srtSignalRaw !== 'none' && <Bdg label={SRT[it.srtSignalRaw].label} color={SRT[it.srtSignalRaw].color} icon={SRT[it.srtSignalRaw].icon} />}
                  <span style={{ fontSize:10, fontWeight:500, fontFamily:ff('mono'), color:B.s }}>rank {it.rank}</span>
                </div>
              );
            }
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <Sec title="Biggest quarterly risers" icon="↗"><div>{risers.map(it => <MoverRow key={it.id} it={it} />)}</div></Sec>
                <Sec title="Biggest quarterly decliners" icon="↘"><div>{decliners.map(it => <MoverRow key={it.id} it={it} />)}</div></Sec>
                <Sec title="SRT watchlist" icon="◉">
                  <div style={{ fontSize:12, color:B.s, marginBottom:12 }}>{watch.length} institutions where current public data shows an SRT signal worth a closer look.</div>
                  <FlowWrap gap={10}>{watch.map(it => <WatchChip key={it.id} it={it} />)}</FlowWrap>
                </Sec>
              </div>
            );
          })()}

          {/* ── SRT signal ── */}
          {tab === 'srt' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:`${B.bl}0F`, border:`1px solid ${B.bl}40`, borderRadius:10, padding:16, display:'flex', gap:14, alignItems:'flex-start' }}>
                <span style={{ fontSize:26, color:B.bl }}>⚡</span>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:B.p, marginBottom:4 }}>
                    {flagged.length} of {items.length} scored institutions show an SRT signal this quarter
                  </div>
                  <div style={{ fontSize:12, color:B.s, lineHeight:1.6 }}>
                    Signals are read from public data only. They flag where a synthetic risk transfer use case may exist, not a recommendation. Capital-efficiency and concentration are the two most common reads in the current universe.
                  </div>
                </div>
              </div>
              {SRT_ORDER.map(k => {
                const members = items.filter(it => it.srtSignalRaw === k).sort((a,b) => b.gist - a.gist);
                if (!members.length) return null;
                const s = SRT[k];
                return (
                  <Sec key={k} title={s.label} icon={s.icon}>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <div style={{ fontSize:12, color:B.s }}>{s.sub}</div>
                      <FlowWrap gap={10}>{members.map(it => <WatchChip key={it.id} it={it} />)}</FlowWrap>
                    </div>
                  </Sec>
                );
              })}
            </div>
          )}

          {/* ── Archetypes ── */}
          {tab === 'archetype' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:`${B.bl}0F`, border:`1px solid ${B.bl}40`, borderRadius:10, padding:16, display:'flex', gap:14, alignItems:'flex-start' }}>
                <span style={{ fontSize:24, color:B.bl }}>⊞</span>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:B.p, marginBottom:4 }}>Every institution sorted by the capital problem in front of management</div>
                  <div style={{ fontSize:12, color:B.s, lineHeight:1.6 }}>
                    Archetypes are an instrument-neutral read derived from public data. Each carries a realistic action set, where synthetic risk transfer is one option among loan sales, runoff, capital retention, repricing, and discipline.
                  </div>
                </div>
              </div>
              {ARC_ORDER.map(k => {
                const members = items.filter(it => archetypeOf(it) === k).sort((a,b) => b.gist - a.gist);
                if (!members.length) return null;
                const a = ARC[k];
                return (
                  <Sec key={k} title={`${a.label} · ${members.length}`} icon={a.icon}>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      <div style={{ fontSize:12, color:B.s }}>{a.blurb}</div>
                      <div>
                        <Eyebrow label="Indicated capital actions" />
                        <FlowWrap gap={6}>
                          {a.actions.map(act => (
                            <span key={act} style={{ fontSize:10, fontWeight:600, color:a.color,
                              background:`${a.color}1A`, border:`1px solid ${a.color}40`,
                              padding:'4px 8px', borderRadius:5 }}>{act}</span>
                          ))}
                        </FlowWrap>
                      </div>
                      <div style={{ height:1, background:B.bd }} />
                      <FlowWrap gap={10}>
                        {members.map(it => (
                          <div key={it.id} onClick={() => setSelected(it)} style={{ width:300, padding:12,
                            background:B.card, borderRadius:9, border:`1px solid ${B.bd}`, cursor:'pointer' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                              <span style={{ fontSize:13, fontWeight:600, color:B.p, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it.name}</span>
                              <ScoreChip s={it.gist} />
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:10, color:B.s, flex:1 }}>{it.ticker??it.id} · {it.peerGroup} · {fmtAssets(it.assets)}</span>
                              {it.srtSignalRaw !== 'none' && <span style={{ color:SRT[it.srtSignalRaw].color, fontSize:11 }}>{SRT[it.srtSignalRaw].icon}</span>}
                            </div>
                          </div>
                        ))}
                      </FlowWrap>
                    </div>
                  </Sec>
                );
              })}
            </div>
          )}

          {/* ── Method ── */}
          {tab === 'method' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <Sec title="Three pillars" icon="⊟">
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <PillarCard tag="01" weight="35%" color={B.gr} title="Capital stewardship"
                    body="Is the institution using capital wisely, building buffers, generating internally, and deploying with discipline?"
                    bullets={['Capital ratio level + trend','Internal capital generation','RWA growth vs. capital growth','Distribution discipline','Buffer relative to growth + risk profile']} />
                  <PillarCard tag="02" weight="30%" color={B.am} title="Balance-sheet decision quality"
                    body="Are asset, funding, liquidity, and growth decisions adding optionality, or eroding it?"
                    bullets={['Loan growth vs. deposit growth','Asset and funding mix','Concentration risk (CRE / C&I / specialty)','Liquidity + securities pressure','Credit quality trend + coverage']} />
                  <PillarCard tag="03" weight="35%" color={B.bl} title="Risk-adjusted ROE creation"
                    body="Are returns coming from durable economics, or temporary gains, hidden leverage, or under-provisioning?"
                    bullets={['ROE / ROA / return on RWA','Pre-provision net revenue strength','Credit-cost-adjusted profitability','Earnings volatility + sustainability','Capital consumed per dollar of earnings']} />
                  <div style={{ background:`${B.p}08`, borderRadius:10, padding:16, fontSize:15, fontFamily:ff('mono'), lineHeight:1.8 }}>
                    <strong style={{ color:B.p }}>GIST</strong>
                    <span style={{ color:B.s }}> = </span>
                    <strong style={{ color:B.gr }}>0.35 · Capital</strong>
                    <span style={{ color:B.s }}> + </span>
                    <strong style={{ color:B.am }}>0.30 · Balance sheet</strong>
                    <span style={{ color:B.s }}> + </span>
                    <strong style={{ color:B.bl }}>0.35 · Risk-adj. ROE</strong>
                  </div>
                </div>
              </Sec>
              <Sec title="Instrument neutrality" icon="⚖">
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ fontSize:14, color:B.p, lineHeight:1.7, fontFamily:ff('geist') }}>GIST does not reward the use of any particular tool. Synthetic risk transfer, CRT, securitisation, loan sales, runoff, buybacks, capital retention, deposit repricing, and origination discipline are all instruments. The index rewards the right action for the franchise, the constraints, and management's stated objectives, and sometimes the right action is no action at all.</div>
                  <div style={{ fontSize:14, color:B.s, lineHeight:1.7, fontFamily:ff('geist') }}>A bank can score highly by growing, by slowing, by selling, by transferring risk, by returning capital, or by holding steady, provided the decision was the best available path for its situation.</div>
                </div>
              </Sec>
              <Sec title="Rating tiers & archetypes" icon="≡">
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <Eyebrow label="Rating tiers" />
                    <FlowWrap gap={8}>
                      {[88,80,68,52,40].map(s => {
                        const rb = ratingBand(s);
                        return (
                          <span key={s} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:600,
                            background:B.bg, border:`1px solid ${B.bd}`, padding:'7px 13px', borderRadius:8, fontFamily:ff('geist') }}>
                            <span style={{ width:9, height:9, borderRadius:'50%', background:rb.color, display:'inline-block', flexShrink:0 }} />
                            <span style={{ color:B.p }}>{rb.label}</span>
                          </span>
                        );
                      })}
                    </FlowWrap>
                  </div>
                  <div>
                    <Eyebrow label="Capital archetypes" />
                    <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:4 }}>
                      {ARC_ORDER.map(k => {
                        const a = ARC[k];
                        return (
                          <div key={k} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                            <span style={{ color:a.color, width:20, flexShrink:0, fontSize:16, marginTop:1 }}>{a.icon}</span>
                            <div>
                              <div style={{ fontSize:14, fontWeight:600, color:B.p, fontFamily:ff('geist'), marginBottom:2 }}>{a.label}</div>
                              <div style={{ fontSize:13, color:B.s, lineHeight:1.55, fontFamily:ff('geist') }}>{a.blurb}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Sec>
              <Sec title="Sources tracked" icon="⊡">
                <FlowWrap gap={8}>
                  {GISTData.sources.map(s => (
                    <span key={s} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:500,
                      background:B.bg, border:`1px solid ${B.bd}`, padding:'7px 13px', borderRadius:8, fontFamily:ff('geist') }}>
                      <span style={{ color:B.gr, fontWeight:700 }}>✓</span> {s}
                    </span>
                  ))}
                </FlowWrap>
              </Sec>
            </div>
          )}

        </div>

        {/* Disclaimer */}
        <div style={{ marginTop:32, padding:18, background:`${B.p}08`, borderRadius:10, border:`1px solid ${B.bd}`,
          fontSize:13, color:B.s, lineHeight:1.7, fontFamily:ff('geist') }}>
          {GISTData.caveat}
        </div>

        <div style={{ marginTop: isCompact ? 56 : 96 }}>
          <PageFooter isCompact={isCompact} />
        </div>

      </div>
    </div>
  );

  return (
    <div style={{ position:'relative', width:'100%', height:'100vh', overflow:'hidden' }}>
      {/* Scroll container */}
      <div ref={scrollRef} style={{ width:'100%', height:'100%', overflowY:'scroll',
        scrollSnapType:'y mandatory', scrollBehavior:'smooth' }}>
        {heroSection}
        {dataSection}
      </div>

      {/* Fixed header */}
      <HeaderNav isCompact={isCompact} scrollRef={scrollRef} onSelectItem={onSelectItem} />

      {/* Section indicator */}
      <div style={{ position:'fixed', left:isCompact?0:5, top:'50%', transform:'translateY(-50%)', zIndex:99, padding:8 }}>
        <SectionIndicator count={2} active={activeIndex} onSelect={scrollTo} />
      </div>

      {/* Institution detail overlay */}
      {selected && <InstitutionDetail item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
