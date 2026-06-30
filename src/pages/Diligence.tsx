// src/pages/Diligence.tsx
// SRT Source Pack Generator — converted from SourcePackGenerator.swift
// Active sections: hero + evidence base (Briefing, Definitions, Lifecycle, Structure, Questions)
// Builder section excluded (disabled in Swift source).

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CTAButton, HeroEyebrow, HeaderNav } from '../components/HeaderNav';
import { PageFooter } from '../components/PageFooter';

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  bg:       '#FBFBF8',
  ink:      '#0E1410',
  ink2:     '#2A312D',
  mute:     '#6B7368',
  mute2:    '#9AA29A',
  line:     '#E6E8E2',
  card:     '#F4F5F0',
  cyan:     '#74E0FF',
  cyanInk:  '#0B1D27',
  green:    '#2F9E69',
  navy:     '#0B1320',
  mint1:    '#E7F6EC',
  mint2:    '#F1FBF3',
  // Wong colorblind-safe
  bl:   'rgb(0,114,178)',
  am:   'rgb(230,159,0)',
  rd:   'rgb(213,94,0)',
  pu:   'rgb(120,92,196)',
} as const;

const geist = '"Geist", system-ui, sans-serif';
const mono  = '"JetBrains Mono", "Courier New", monospace';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Opt { id: string; label: string; sub?: string; }

interface GlossaryTerm {
  term: string; short: string; technical: string;
  why: string; example: string; confusion: string;
}

interface LifecycleStage {
  id: number; title: string; short: string;
  detail: string; who: string; watch?: string;
}

interface FlowArrow { from: string; to: string; label: string; kind: 'cash' | 'risk'; }

interface TrancheLayer {
  label: string; attach: number; detach: number;
  holder: string; color: string;
}

interface Structure {
  id: string; label: string; explainer: string; flows: FlowArrow[];
  achieves: string; transfers: string; keeps: string;
  investorsGet: string; ifLosses: string;
  watchOut: string[]; reporterQuestions: string[]; tranche: string;
}

interface SourceObject {
  name: string; use: string; freshness: string;
  status: 'approved' | 'review' | 'watch';
}

// ─── SP content ───────────────────────────────────────────────────────────────

const SP = {
  audiences: [
    { id: 'beginner',  label: 'Beginner',          sub: 'Never seen a balance sheet' },
    { id: 'student',   label: 'Student',            sub: 'Finance student, foundational concepts' },
    { id: 'reporter',  label: 'Reporter',           sub: 'Covers finance but new to SRT' },
    { id: 'literate',  label: 'Market-literate',    sub: 'Knows banking, new to SRT' },
    { id: 'technical', label: 'Technical / advanced', sub: 'Already works with structured credit' },
  ] as Opt[],

  personas: [
    { id: 'bank-exec',    label: 'Bank executive' },
    { id: 'bank-capital', label: 'Bank capital manager' },
    { id: 'investor',     label: 'Investor / credit fund' },
    { id: 'lawyer',       label: 'Lawyer' },
    { id: 'accountant',   label: 'Accountant' },
    { id: 'regulator',    label: 'Regulator / former supervisor' },
    { id: 'rating',       label: 'Rating agency analyst' },
    { id: 'academic',     label: 'Academic expert' },
  ] as Opt[],

  questionCategories: [
    'Motivation', 'Structure', 'Economics', 'Regulation', 'Accounting',
    'Risk transfer', 'Investor appetite', 'Market growth', 'Controversies',
    'What could go wrong', 'Reader misconceptions',
  ],

  questions: {
    'bank-capital': {
      'Motivation': [
        'What problem were you trying to solve with this SRT transaction?',
        'Why SRT instead of selling loans, raising equity, or shrinking the book?',
        'Was this a one-off transaction or part of a programmatic strategy?',
        'Why would a bank pay to give away risk it could simply keep?',
        'In plain terms, what does an SRT transaction actually do?',
      ],
      'Structure': [
        'How did you decide which portfolio to reference?',
        'Where did you set the attachment and detachment points, and why?',
        'Did you retain the first-loss piece or place it externally?',
        'Did you use funded or unfunded protection, and why?',
        'How is this different from selling the loans or from a traditional securitisation?',
      ],
      'Economics': [
        'What was the all-in cost of the protection?',
        'How much CET1 capital did the deal release?',
        'How do you measure the net economic benefit of the transaction?',
        'How sensitive is the benefit to changes in the output floor?',
      ],
      'Regulation': [
        'How long was the supervisory engagement process?',
        'Did the supervisor require any structural changes?',
        'Did anything in the EBA or PRA guidelines force a redesign?',
      ],
      'Risk transfer': [
        'What risks remain with the bank after the transaction?',
        'How do you monitor the residual senior exposure?',
        'What would cause the capital benefit to change over time?',
      ],
      'What could go wrong': [
        'What replenishment risks worry you most?',
        'What happens if defaults concentrate in a sector you cannot exit?',
        'What is your contingency if the protection seller deteriorates?',
      ],
      'Reader misconceptions': [
        'What do journalists most often get wrong about these transactions?',
        'Does doing an SRT mean the bank is in trouble?',
        'Is SRT just the CDO problem from 2008 in a new form?',
        'What happens to a borrower whose loan is in the reference pool?',
      ],
    },
    'investor': {
      'Motivation': [
        'Why is SRT an attractive asset class for your fund right now?',
        'How does it compare with direct lending or CLO equity in your portfolio?',
      ],
      'Structure': [
        'What structural features do you require before you will look at a deal?',
        'Where do you typically attach in the capital structure?',
      ],
      'Economics': [
        'What is your target return on SRT exposures?',
        'How do you think about premium relative to expected loss?',
      ],
      'Risk transfer': [
        'What do you do when a credit event is declared?',
        'How do you monitor the reference portfolio between reports?',
        'What is a credit event and how is the loss actually measured?',
      ],
      'Investor appetite': [
        'Has the universe of protection sellers grown or narrowed in the last 12 months?',
        'How crowded is the market in your view?',
        'Who else is on the other side buying this risk?',
      ],
      'Market growth': [
        'Where do you see the next 12 months of issuance coming from?',
        'Which jurisdictions are you seeing the most activity in?',
      ],
      'What could go wrong': [
        'What is the most underappreciated risk in SRT today?',
        'What concerns you about how supervisors might react in a downturn?',
      ],
    },
    'lawyer': {
      'Structure': [
        'What documentation choices most often drive deal timing?',
        'How does your drafting differ between funded and unfunded structures?',
        'What clauses do supervisors focus on most?',
      ],
      'Regulation': [
        'How have the EBA guidelines changed your drafting practice?',
        'What is the trickiest area of cross-border enforceability?',
      ],
      'Risk transfer': ['How do you draft credit-event verification to be robust under stress?'],
      'Controversies': ['Where do you see the biggest legal risk in these structures today?'],
    },
    'regulator': {
      'Motivation': [
        'How do you think about the systemic role of SRT in bank balance sheets?',
        'What distinguishes a healthy SRT market from regulatory arbitrage in your view?',
      ],
      'Regulation': [
        'How do you weigh capital relief against potential second-order incentives?',
        'What features make you more confident in a transaction?',
        'Is SRT legal, and what makes the capital relief valid?',
      ],
      'Risk transfer': ['How do you assess whether risk has actually moved off the bank?'],
      'Controversies': [
        'How concerned are you about insurance-led unfunded structures?',
        'What is your view on excess-spread mechanics?',
      ],
      'What could go wrong': ['What would a stressed SRT market look like and how would supervisors respond?'],
    },
    'bank-exec': {
      'Motivation': [
        'Where does SRT sit in your capital strategy?',
        'How do you decide whether to do SRT or shrink the balance sheet?',
      ],
      'Economics': ['How do you communicate SRT economics to your board and to investors?'],
      'Market growth': [
        'What is your forward issuance plan and what would change it?',
        'How large is the SRT market, and how fast is it growing?',
      ],
    },
    'accountant': {
      'Accounting': [
        'How is the accounting treatment determined for a synthetic structure?',
        'Where do the lines between guarantee, derivative, and structured note get tested?',
        'How does the protection leg interact with CECL or IFRS 9 expected losses?',
      ],
      'Controversies': ['Where do auditors and management most often disagree on synthetic deals?'],
    },
    'rating': {
      'Structure': [
        'How do you rate the protected mezzanine tranche?',
        'What scenarios drive your subordination requirements?',
      ],
      'Risk transfer': ['How do you think about replenishment risk in your modelling?'],
    },
    'academic': {
      'Motivation': ['Is SRT a productive use of regulatory capital or a form of regulatory arbitrage?'],
      'Market growth': ['How does the SRT market\'s growth compare with prior credit-derivative cycles?'],
      'Controversies': ['What lessons from past structured-credit episodes are most relevant?'],
    },
  } as Record<string, Record<string, string[]>>,

  answers: {
    'What problem were you trying to solve with this SRT transaction?':
      'Typically a binding capital constraint. The bank is holding more regulatory capital against a portfolio than it would like, and SRT reduces that requirement on a defined slice without selling the loans. Other common drivers are cutting a single-sector concentration or freeing capacity to write new business.',
    'Why SRT instead of selling loans, raising equity, or shrinking the book?':
      'Each alternative has a worse side effect. Selling loans surrenders the client and the future income, raising equity dilutes shareholders and is slow, and shrinking the book means turning away profitable lending. SRT keeps the loans, the clients, and the income while still delivering the capital relief, which is why banks reach for it.',
    'Was this a one-off transaction or part of a programmatic strategy?':
      'Most sophisticated issuers run SRT as a programme rather than a one-off. A repeatable programme builds investor relationships, drives down execution cost over time, and lets the bank manage capital dynamically across the cycle. True one-offs tend to be tied to a specific event such as an acquisition or a single concentrated exposure.',
    'Why would a bank pay to give away risk it could simply keep?':
      'Because regulators force banks to hold expensive capital against the chance that loans go bad. By moving a slice of that risk to an investor, the bank is permitted to hold less capital, which it can redeploy into new lending or return to shareholders. The premium it pays is usually cheaper than raising the same amount of fresh equity.',
    'In plain terms, what does an SRT transaction actually do?':
      'It lets the bank buy protection against losses on a pool of its loans without selling those loans. The bank pays an investor a regular premium, and in return the investor agrees to cover a defined slice of any losses on that pool. The loans and the customer relationships stay with the bank throughout.',
    'How did you decide which portfolio to reference?':
      'The bank looks for portfolios where capital is most constrained relative to their economic risk, usually large, granular, well-performing corporate or SME books. Data quality and diversification matter, because investors must analyse the pool and will price uncertainty into the premium. Counter-intuitively, the best-quality books are often referenced, not the worst.',
    'Where did you set the attachment and detachment points, and why?':
      'The protected slice usually sits above a thin first-loss piece and below the senior portion, capturing the band of stressed-but-not-catastrophic losses. Where it attaches and detaches is a trade-off: a wider slice frees more capital but costs more premium, a narrower one is cheaper but does less. The points are calibrated so the capital released exceeds the cost.',
    'Did you retain the first-loss piece or place it externally?':
      'Banks very often keep the first-loss piece. Retaining it signals alignment with investors, reassures supervisors that the bank still has skin in the game, and is frequently the most efficient outcome because first-loss is the most expensive risk to place. Some deals do place it externally when an investor specifically wants that high-return exposure.',
    'Did you use funded or unfunded protection, and why?':
      'Funded protection, usually credit-linked notes, has the investor post cash up front into a collateral account, removing any counterparty risk for the bank. Unfunded protection, a guarantee or swap from a highly rated insurer, is cheaper but leaves the bank relying on that counterparty to pay when called. The choice trades cost against counterparty risk and depends on the seller\'s strength.',
    'How is this different from selling the loans or from a traditional securitisation?':
      'In a loan sale the bank gives up the asset, the income, and the client. In SRT it keeps all three and transfers only the credit risk on a slice. Unlike a traditional cash securitisation, no notes are issued against the loans themselves and the loans never leave the balance sheet, which is why it is called synthetic.',
    'What was the all-in cost of the protection?':
      'The headline cost is the premium paid to investors, but the all-in figure also includes legal, structuring, and ongoing administration. The premium typically exceeds the expected loss on the slice, because investors are paid for taking risk and tying up capital, not just for insurance. The deal works only when the capital freed is worth more than this total cost.',
    'How much CET1 capital did the deal release?':
      'Capital relief is expressed as a reduction in risk-weighted assets, which flows through to a CET1 ratio improvement, often quoted in basis points. The exact amount depends on the size and risk weight of the protected slice and the bank\'s capital approach. A meaningful deal might free tens to a few hundred million of capital on a multi-billion pool.',
    'How do you measure the net economic benefit of the transaction?':
      'The bank compares the capital it frees, valued at its cost of capital or the return it can earn redeploying it, against the all-in premium and costs. If freed capital can be put to work above the cost of the protection, the deal creates value. Banks also weigh softer benefits like concentration relief and balance-sheet flexibility.',
    'How sensitive is the benefit to changes in the output floor?':
      'Quite sensitive for banks using internal models. The Basel output floor caps how low internal-model capital can fall relative to the standardised approach, which can shrink the relief an SRT delivers as the floor phases in. Banks now stress-test deals against the floor to confirm the benefit survives, and some structure specifically to stay efficient under it.',
    'How long was the supervisory engagement process?':
      'It ranges from a few weeks for a familiar, well-trodden structure to several months for anything novel. Supervisors review whether the structure genuinely transfers risk before allowing the capital benefit. Programmatic issuers tend to move faster because the supervisor already understands their template.',
    'Did the supervisor require any structural changes?':
      'Often, yes. Supervisors commonly push back on excess-spread mechanics, replenishment criteria, and the size of the retained first-loss, all of which can quietly leave risk with the bank. Required changes usually aim to ensure the transfer is real and durable rather than cosmetic.',
    'Did anything in the EBA or PRA guidelines force a redesign?':
      'The EBA\'s significant-risk-transfer guidelines and equivalent supervisory expectations set out structural features deals must respect, particularly around commensurate risk transfer and excess spread. Where an early design fell foul of these, it would be reworked before submission. The guidelines have steadily standardised what the market treats as acceptable.',
    'What risks remain with the bank after the transaction?':
      'The bank keeps the thin first-loss piece it usually retains, the large senior portion above the protected slice, and, in unfunded deals, the counterparty risk on the protection seller. It also keeps all operational and servicing responsibilities. SRT moves a defined band of credit risk, not all of it.',
    'How do you monitor the residual senior exposure?':
      'Through ongoing portfolio reporting, because the senior piece still carries tail risk and continues to consume capital. The bank tracks delinquency and loss trends to see whether losses are approaching the protected band, and watches for anything that would change the deal\'s capital treatment. The residual is managed like any retained credit position.',
    'What would cause the capital benefit to change over time?':
      'Several things: the pool amortising so the protected notional shrinks, replenishment bringing in weaker loans, a downgrade of an unfunded protection seller, or a rule change such as the output floor. Banks model these so the relief is never assumed to be static. A benefit that erodes quietly after close is a genuine risk.',
    'What replenishment risks worry you most?':
      'The main worry is eligibility criteria loose enough to let credit quality drift as new loans replace repaid ones during the revolving period. If the pool slowly fills with weaker exposures, the investor is taking more risk than priced and the transfer weakens. Tight, well-monitored eligibility rules are what keep a replenishing deal honest.',
    'What happens if defaults concentrate in a sector you cannot exit?':
      'Because the reference pool is fixed, the bank cannot trade out of a deteriorating sector mid-deal. If losses concentrate there, they flow up through the first-loss into the protected slice, which is exactly what the investor is paid to absorb up to the detachment point. The protection is sized and diversified so a plausible downturn stays within the slice.',
    'What is your contingency if the protection seller deteriorates?':
      'For funded deals there is little to worry about, because the cash is already posted as collateral. For unfunded deals the bank relies on collateral-posting triggers, rights to replace the counterparty, or the seller being remote from failure. If those protections are weak, a deteriorating seller can hollow out the capital benefit just when it is needed.',
    'What do journalists most often get wrong about these transactions?':
      'Three things. They describe SRT as the bank selling its loans, when the loans never move. They confuse the product, synthetic risk transfer, with the regulatory test, significant risk transfer, even though both shorten to SRT. And they treat capital relief as free money, when the bank pays a real premium that usually exceeds the expected loss.',
    'Does doing an SRT mean the bank is in trouble?':
      'Usually the opposite. Most SRT is done by healthy banks managing capital efficiently so they can keep lending, not by distressed banks offloading bad loans. The reference pools are often the bank\'s best-performing books, because investors will only price risk they can analyse and trust.',
    'Is SRT just the CDO problem from 2008 in a new form?':
      'No, though both use tranching. The pre-crisis problem was opaque pools of subprime mortgages, repackaged repeatedly and sold to investors who could not see the underlying risk. SRT references a specific, identified pool, usually a bank\'s own corporate or SME loans, is heavily supervised, and the bank typically keeps the first-loss piece so its interests stay aligned with investors.',
    'What happens to a borrower whose loan is in the reference pool?':
      'Nothing changes for the borrower. The loan stays with the bank, the borrower keeps paying the bank, and the terms are unaffected. The transaction happens entirely between the bank and its investors and is invisible to the customer.',
    'Why is SRT an attractive asset class for your fund right now?':
      'SRT offers exposure to high-quality bank-originated credit, often investment-grade corporate or SME loans, at spreads that compensate well for the defined risk taken. The risk is ring-fenced to a specific tranche with clear attachment and detachment points, which makes it analysable. With banks under sustained capital pressure, supply is steady and growing.',
    'How does it compare with direct lending or CLO equity in your portfolio?':
      'SRT gives access to the same kind of borrowers as direct lending but through the bank\'s underwriting and servicing, rather than originating yourself. Against CLO equity it is usually a more defined, less leveraged position tied to a known pool. Many funds hold all three and treat SRT as the more diversified, bank-partnered sleeve of their credit book.',
    'What structural features do you require before you will look at a deal?':
      'Clear credit-event and loss-verification mechanics, sensible eligibility and replenishment criteria, alignment through a retained bank first-loss, and transparent, regular pool reporting. Investors also want comfort on documentation and, where relevant, the strength of any counterparty. Deals that are vague on how losses are measured and paid get passed over.',
    'Where do you typically attach in the capital structure?':
      'Most institutional investors target the mezzanine tranche, above the bank\'s retained first-loss and below the senior piece. It offers a strong risk-adjusted return without the extreme volatility of pure first-loss. Some specialist funds take first-loss for a higher premium, and a few take more senior positions for lower, steadier returns.',
    'What is your target return on SRT exposures?':
      'Returns vary with where you attach and the credit quality of the pool, but mezzanine SRT has historically offered high-single-digit to low-double-digit returns. First-loss commands more, senior positions less. The appeal is earning private-credit-like returns on transparent, bank-underwritten risk.',
    'How do you think about premium relative to expected loss?':
      'The premium has to compensate for expected loss, the capital and liquidity tied up, and the uncertainty around how the pool behaves in stress. A healthy deal pays a premium comfortably above modelled expected loss, with the excess being the genuine return for risk. If the premium barely covers expected loss, the deal is not worth doing.',
    'What do you do when a credit event is declared?':
      'The loss is verified through the agreed process, recoveries are determined, and the net loss is allocated against the tranche per the waterfall. In a funded deal it is drawn from the posted collateral, reducing the investor\'s principal. The investor follows the workout closely, because final recoveries drive the actual loss.',
    'How do you monitor the reference portfolio between reports?':
      'Between formal reports investors rely on the agreed transparency templates, covenant and trigger notifications, and any replenishment notices. Many also track macro and sector signals relevant to the pool\'s concentrations. Good managers build their own surveillance rather than waiting passively for the next report.',
    'What is a credit event and how is the loss actually measured?':
      'A credit event is the contract\'s definition of a borrower going bad, usually a missed payment, a bankruptcy, or a distressed restructuring. Once verified, the loss is calculated after recoveries and allocated against the protected slice per the waterfall. The recovery process, not the default alone, determines the final loss the investor bears.',
    'Has the universe of protection sellers grown or narrowed in the last 12 months?':
      'It has broadly grown. As SRT has become an established asset class, more credit funds, pensions, and insurers have built dedicated capacity, and new entrants keep appearing. That said, the deepest expertise still sits with a relatively concentrated group of specialists. Confirm the current picture against recent market commentary.',
    'How crowded is the market in your view?':
      'Demand has risen sharply, compressing spreads on the most sought-after deals and giving banks more pricing leverage. Experienced investors argue the discipline is holding, with diligence standards intact, but warn that crowding can tempt weaker structures through. The honest answer is that it is busier and finer-priced than a few years ago.',
    'Who else is on the other side buying this risk?':
      'Specialist credit funds, pension allocators, insurers, and reinsurers. They are paid an attractive premium for taking a defined, well-understood slice of credit risk, and many run SRT as a core private-credit strategy. The pool of these investors has grown substantially as the market has matured.',
    'Where do you see the next 12 months of issuance coming from?':
      'Continued European issuance from established programmes, rapid growth from US banks adapting to the finalised capital framework, and early activity from markets including Canada. New asset classes beyond corporate loans, such as consumer, auto, and specialised lending, are widening the supply. Confirm before relying on it.',
    'Which jurisdictions are you seeing the most activity in?':
      'Europe remains the deepest and most mature market, with the US growing fastest as its framework beds in. The UK is active, and markets like Canada are at an earlier stage. Activity tracks where capital rules bind hardest and supervisors are most engaged. Confirm against current data.',
    'What is the most underappreciated risk in SRT today?':
      'Arguably the build-up of correlation and leverage on the investor side, where the same pools of risk may be financed through layers of fund leverage that are hard to see from the bank\'s vantage point. Replenishment quality and excess-spread mechanics that quietly weaken transfer are close behind.',
    'What concerns you about how supervisors might react in a downturn?':
      'The worry is that in a real stress, supervisors reassess whether risk transfer was ever genuine and tighten recognition, or that capital relief proves less durable than banks assumed. A wave of credit events would also test loss-verification and counterparty arrangements that have not been stressed at scale.',
    'What documentation choices most often drive deal timing?':
      'The biggest time sinks are negotiating the credit-event and loss-verification definitions, the eligibility and replenishment schedules, and any excess-spread or termination provisions. Cross-border deals add enforceability and recognition questions. Repeat issuers on a settled template close far faster than first-time or bespoke structures.',
    'How does your drafting differ between funded and unfunded structures?':
      'Funded structures centre on the note terms, the collateral account, and how principal absorbs losses, closer to a securities exercise. Unfunded structures centre on the guarantee or swap, the eligibility of the protection provider, and what happens if that counterparty deteriorates. The legal risk shifts from securities mechanics to counterparty and enforceability questions.',
    'What clauses do supervisors focus on most?':
      'Supervisors scrutinise credit-event definitions, the treatment of excess spread, replenishment eligibility, time calls, and any feature that could quietly return risk to the bank. They want to see that the documented transfer is real and commensurate with the capital relief claimed.',
    'How have the EBA guidelines changed your drafting practice?':
      'They have standardised expectations around commensurate risk transfer, excess spread, and structural features, so much that was once negotiated case by case is now settled market practice. Drafting has converged toward forms supervisors are known to accept. This has shortened timelines but narrowed the room for aggressive structuring.',
    'What is the trickiest area of cross-border enforceability?':
      'Ensuring the protection is recognised and enforceable across the jurisdictions of the bank, the counterparty, and any vehicle, particularly on insolvency. Differences in how guarantees, derivatives, and set-off are treated can undermine a structure that works cleanly in one country.',
    'How do you draft credit-event verification to be robust under stress?':
      'The aim is objective, independently verifiable triggers and a clear, timely process for measuring loss after recoveries, so neither side can dispute a payout when many credit events hit at once. Ambiguity that survives a benign market becomes litigation in a stressed one.',
    'Where do you see the biggest legal risk in these structures today?':
      'The combination of largely untested documentation at scale and a market that has grown faster than its stress history. If a serious downturn produces many simultaneous credit events, weaknesses in verification, replenishment, or counterparty terms could surface together.',
    'How do you think about the systemic role of SRT in bank balance sheets?':
      'Used well, SRT is a legitimate tool that lets banks manage capital and keep lending by sharing risk with investors who want it. The supervisory concern is whether risk genuinely leaves the banking system or simply moves to lightly-regulated, leveraged holders in ways that could feed back to banks in stress.',
    'What distinguishes a healthy SRT market from regulatory arbitrage in your view?':
      'A healthy market transfers real economic risk, is well documented, monitored, and priced, and improves the resilience of the banks using it. Arbitrage is when structures are engineered to capture capital relief while quietly retaining most of the risk, often through excess spread or loose replenishment.',
    'How do you weigh capital relief against potential second-order incentives?':
      'Capital relief that supports prudent lending is welcome, but supervisors watch for incentives to originate riskier loans because the risk can be passed on, or to treat SRT as a substitute for adequate capital. The framework grants relief only where significant risk transfer is demonstrated, precisely to keep those incentives in check.',
    'What features make you more confident in a transaction?':
      'A retained first-loss that keeps the bank aligned, conservative and well-monitored eligibility and replenishment terms, restrained or trapped excess spread, robust credit-event verification, and a strong, eligible protection provider in unfunded deals.',
    'Is SRT legal, and what makes the capital relief valid?':
      'Yes, it is an established, explicitly regulated tool under the Basel framework and its regional versions. The capital relief is valid only where the supervisor agrees that a meaningful and commensurate share of the risk has genuinely been transferred, the significant-risk-transfer test.',
    'How do you assess whether risk has actually moved off the bank?':
      'Through the significant-risk-transfer assessment, which tests whether a meaningful and commensurate share of the loss risk has genuinely passed to third parties, both at inception and over time. Supervisors look past the legal form to the economics, examining excess spread, replenishment, and retained positions.',
    'How concerned are you about insurance-led unfunded structures?':
      'There is real focus here. Unfunded protection from insurers and reinsurers concentrates reliance on those counterparties performing when called, sometimes through chains the banking supervisor sees only partially. The concern is correlated stress, where the same downturn that triggers losses also weakens the protection sellers.',
    'What is your view on excess-spread mechanics?':
      'Excess spread is one of the most scrutinised features, because trapping surplus interest to absorb early losses can leave more risk with the bank than the headline structure implies. Whether and how it is recognised can make the difference between genuine and cosmetic transfer.',
    'What would a stressed SRT market look like and how would supervisors respond?':
      'In a serious downturn, credit events would cluster, loss-verification and counterparty arrangements would be tested at scale, and questions would arise about whether claimed relief was ever durable. Supervisors would likely scrutinise recognition more tightly, watch for distressed unwinds, and monitor whether risk genuinely sits with investors or feeds back to banks.',
    'Where does SRT sit in your capital strategy?':
      'For many banks it has become standing balance-sheet infrastructure, one of several levers, alongside retained earnings, equity, and asset sales, for managing capital efficiently. It is valued because it frees capital while preserving client relationships and income.',
    'How do you decide whether to do SRT or shrink the balance sheet?':
      'Shrinking means turning away profitable lending and damaging client relationships, which most banks resist unless the business is genuinely unattractive. SRT lets the bank keep the lending and the income while still relieving the capital constraint, so it is usually preferred where the underlying business is sound.',
    'How do you communicate SRT economics to your board and to investors?':
      'The clearest framing is capital freed and where it is redeployed, set against the all-in cost, so the value creation is explicit rather than buried in structure. Boards want to understand what risk is transferred, what is retained, and how the deal is monitored.',
    'What is your forward issuance plan and what would change it?':
      'Programmatic issuers plan a pipeline tied to where capital is most constrained and where investor appetite is strongest. Plans shift with changes in capital rules such as the output floor, the bank\'s growth and acquisition activity, and the pricing investors offer.',
    'How large is the SRT market, and how fast is it growing?':
      'It has grown into a substantial global market, with annual issuance now measured in the tens of billions of dollars of protected notional and still rising. Long established in Europe, it is expanding quickly in the US and starting in Canada. Confirm current figures against a dated source before publishing.',
    'How is the accounting treatment determined for a synthetic structure?':
      'It hinges on how the protection is characterised, as a financial guarantee, a derivative, or an embedded feature of a note, which is not always obvious from the legal form. That characterisation drives recognition, measurement, and disclosure, and can differ between IFRS and US GAAP.',
    'Where do the lines between guarantee, derivative, and structured note get tested?':
      'The tests turn on the contract\'s terms: whether payouts depend on a counterparty\'s loss (more guarantee-like) or on a reference value or index (more derivative-like), and whether funding and principal absorption make it note-like. Borderline structures can fall either side, with materially different accounting.',
    'How does the protection leg interact with CECL or IFRS 9 expected losses?':
      'The reference loans still sit on the balance sheet and carry expected-loss provisions under CECL or IFRS 9, while the protection is accounted for separately by its characterisation. The interaction must be worked through so losses and the protection that covers them are not mismatched.',
    'Where do auditors and management most often disagree on synthetic deals?':
      'Most often on the characterisation of the protection and therefore its measurement, and on how its benefit interacts with expected-loss provisioning. Disagreements also arise over disclosure and over whether the structure truly achieves the accounting and capital outcome management is claiming.',
    'How do you rate the protected mezzanine tranche?':
      'Agencies model the pool\'s loss distribution, considering the credit quality, granularity, and concentrations of the reference loans, then assess where the tranche sits relative to expected and stressed losses. The rating reflects the probability that losses breach the attachment point and erode the tranche.',
    'What scenarios drive your subordination requirements?':
      'Stress scenarios that push default rates and loss-given-default well above expected levels, often calibrated to severe but plausible recessions and to the pool\'s specific sector and name concentrations. The more correlated or concentrated the pool, the more subordination a given rating demands.',
    'How do you think about replenishment risk in your modelling?':
      'Replenishment is treated as a source of potential migration in pool quality, so the analysis assumes the pool can drift toward the edges of its eligibility criteria rather than stay at its initial quality. Tighter, well-monitored criteria reduce the haircut; loose ones increase required subordination.',
    'Is SRT a productive use of regulatory capital or a form of regulatory arbitrage?':
      'It can be either, and the answer depends on the deal. Where it transfers genuine risk and lets well-run banks lend more efficiently, it is productive and improves the allocation of capital. Where structures capture relief while retaining most of the risk, it is arbitrage that weakens the link between capital and risk.',
    'How does the SRT market\'s growth compare with prior credit-derivative cycles?':
      'It echoes earlier credit-derivative booms in its rapid growth and the migration of risk from banks to other holders, which invites comparison with the pre-2008 period. The important differences are that SRT references identified pools rather than opaque repackaged ones, is explicitly supervised, and usually keeps the bank aligned through retained first-loss.',
    'What lessons from past structured-credit episodes are most relevant?':
      'The clearest lessons are that opacity and misaligned incentives, not tranching itself, caused past failures, and that risk which appears to leave the banking system can return through counterparties and leverage. Transparency, genuine alignment, and supervisory engagement are what separate durable structures from fragile ones.',
  } as Record<string, string>,

  briefing: {
    short: 'A synthetic risk transfer is a way for a bank to get rid of the credit risk on a pool of loans without selling the loans. The bank pays an investor a premium; the investor agrees to absorb the losses on a defined slice of that portfolio. If the regulator agrees that meaningful risk has actually moved, the bank holds less regulatory capital against the protected slice and can use that capacity for new lending.',
    whyMatters: [
      'SRT has become one of the main tools large banks use to manage capital under the post-2008 regime.',
      'Volumes have grown materially as banks have faced higher capital requirements and a binding output floor.',
      'The market sits at the intersection of bank capital policy, supervisory practice, structured credit, and private credit fundraising.',
      'Reporters covering bank capital, private credit, or insurance increasingly need to understand the mechanism.',
    ],
    howWorks: [
      'The bank identifies a portfolio of loans where capital is constrained, typically corporate or SME lending.',
      'It designs a transaction: how big the protected slice will be, where it attaches and detaches, who counts as a credit event.',
      'It approaches a small group of specialist investors, credit funds, pensions, insurers, to sell that protection.',
      'The investor either posts cash up front (funded) or commits to pay on losses as they occur (unfunded).',
      'The bank pays an ongoing premium and, if losses occur, claims them under the protection contract.',
      'The supervisor reviews and, if it agrees real risk has been transferred, allows the bank to hold less capital.',
    ],
    who: [
      'Bank / protection buyer — the originator of the loans.',
      'Investors / protection sellers — credit funds, pension allocators, regulated insurers and reinsurers.',
      'Arranger — sometimes the bank, sometimes a third party, structuring and marketing the deal.',
      'Lawyers — drafting documentation and confirming enforceability.',
      'Auditors — checking accounting treatment.',
      'Supervisors — assessing whether risk has actually moved.',
    ],
    whoBenefits: [
      'The bank, which frees regulatory capital and can keep lending without raising fresh equity.',
      'The investor / protection seller, which earns a premium for taking defined credit risk.',
      'The bank\'s borrowers, whose relationships and loans stay with the bank rather than being sold.',
    ],
    whoBearsRisk: [
      'The investor bears first the protected slice of losses, up to the agreed detachment point.',
      'The bank retains the first-loss sliver it usually keeps, plus all losses above the protected slice.',
      'If an unfunded protection seller fails, the bank is left holding the risk it thought it had moved.',
    ],
    canGoWrong: [
      'The supervisor disagrees that significant risk has been transferred — capital relief does not arrive.',
      'Excess-spread mechanics or replenishment language fails the commensurate-risk-transfer test.',
      'A counterparty providing unfunded protection deteriorates and the protection weakens.',
      'A wave of defaults concentrates in a sector the bank cannot replenish out of.',
      'Reputational risk: deals are perceived as regulatory arbitrage rather than risk management.',
    ],
    questionsToAsk: [
      'Why this portfolio, and why now?',
      'Where do attachment and detachment sit?',
      'Funded or unfunded, and what was the alternative?',
      'How much capital was actually freed, after costs?',
      'How long did the supervisory review take?',
      'What happens in a stress scenario?',
    ],
    misconceptions: [
      'The loans are NOT sold. The bank still holds them and still owns the customer relationship.',
      'SRT is not the same as a CDO. It references a specific identified pool, often a bank\'s own corporate book.',
      'Capital relief is not free money — the bank pays a premium that often exceeds the expected loss.',
      'It is not exclusively a European phenomenon. The US market is growing under the new framework.',
      'SRT can mean either the product (synthetic risk transfer) or the regulatory test (significant risk transfer). Watch the context.',
    ],
    known: [
      'Whether a deal is funded or unfunded is usually disclosable and shapes counterparty risk.',
      'Headline reference-pool size is often public; the protected slice and pricing usually are not.',
      'Capital relief depends on a supervisory significant-risk-transfer assessment in the jurisdiction.',
    ],
    unknown: [
      'Exact attachment and detachment points, premium, and the identity of the protection sellers.',
      'How much capital was actually freed after costs, and the bank\'s internal hurdle.',
      'Whether the supervisor has signed off, and on what conditions.',
    ],
    storyAngles: [
      'Is capital relief funding productive lending, or financing buybacks and dividends?',
      'Who is on the other side: which credit funds, pensions, and insurers are selling protection, and at what leverage?',
      'Is the growth of bank-to-private-credit risk transfer concentrating risk in lightly-regulated hands?',
      'How real is the risk transfer once excess spread and replenishment are taken into account?',
    ],
    keyTerms: [
      'Synthetic risk transfer (SRT)', 'Significant risk transfer', 'Reference portfolio',
      'Attachment / detachment', 'First-loss / mezzanine / senior', 'Funded / unfunded protection',
      'Credit event', 'Replenishment', 'Risk-weighted assets', 'CET1 / regulatory capital',
    ],
  },

  structures: [
    {
      id: 'funded', label: 'Funded SRT (credit-linked notes)',
      explainer: 'The investor pays cash up front for credit-linked notes. The cash sits in a collateral account, available to repay the bank if losses occur. The bank pays a coupon. At maturity, whatever cash is left (after losses) goes back to the investor.',
      flows: [
        { from: 'Investor', to: 'Collateral', label: 'Cash up-front', kind: 'cash' },
        { from: 'Collateral', to: 'Bank', label: 'Loss payments', kind: 'risk' },
        { from: 'Bank', to: 'Investor', label: 'Premium / coupon', kind: 'cash' },
        { from: 'Collateral', to: 'Investor', label: 'Residual at maturity', kind: 'cash' },
      ],
      achieves: 'Capital relief on a defined slice of a loan pool while keeping the loans and the customer relationships on the bank\'s books.',
      transfers: 'The credit risk on the protected mezzanine slice, the losses between the attachment and detachment points.',
      keeps: 'The first-loss sliver it retains for alignment, and all losses above the detachment point (the senior piece).',
      investorsGet: 'A coupon paid on the notes, and their cash back at maturity to the extent it has not been used to cover losses.',
      ifLosses: 'Verified losses are drawn from the collateral account, so the investor is repaid less. There is no counterparty risk because the cash is already posted.',
      watchOut: ['Excess spread or replenishment language that quietly returns risk to the bank', 'Supervisor disagreeing that significant risk has moved', 'Cost of the coupon exceeding the expected loss by a wide margin'],
      reporterQuestions: ['Where do the attachment and detachment points sit?', 'How much capital was freed after the coupon cost?', 'Did the supervisor confirm significant risk transfer?'],
      tranche: 'three',
    },
    {
      id: 'unfunded', label: 'Unfunded SRT (guarantee or insurance)',
      explainer: 'The investor — usually a highly-rated insurer, reinsurer, or guarantor — promises to pay losses when they occur, with no cash posted up front. The bank pays a premium. Supervisors place strict conditions on who can write this.',
      flows: [
        { from: 'Bank', to: 'Investor', label: 'Premium', kind: 'cash' },
        { from: 'Investor', to: 'Bank', label: 'Loss payments (if any)', kind: 'risk' },
      ],
      achieves: 'Capital relief without tying up investor cash, often at a lower premium because the protection seller is highly rated.',
      transfers: 'The credit risk on the protected slice, contingent on the protection seller actually paying when called.',
      keeps: 'The first-loss piece, the senior piece, and crucially the counterparty risk on the protection seller.',
      investorsGet: 'A premium for standing behind the losses, with no cash outlay unless and until a loss is verified.',
      ifLosses: 'The bank claims under the guarantee or insurance contract and the seller pays. If the seller is weak, the protection may not arrive when it is needed most.',
      watchOut: ['Counterparty deterioration that hollows out the protection', 'Contingent termination rights linked to claims behaviour', 'Maturity mismatch between the protection and the loans'],
      reporterQuestions: ['Who is the protection seller and how strong are they?', 'What happens to capital relief if the seller is downgraded?', 'Does the protection match the maturity of the loans?'],
      tranche: 'three',
    },
    {
      id: 'guarantee', label: 'Financial guarantee structure',
      explainer: 'A simple financial guarantee from a regulated counterparty covers a defined tranche of the portfolio. Closer in legal form to insurance than to a derivative.',
      flows: [
        { from: 'Bank', to: 'Investor', label: 'Premium', kind: 'cash' },
        { from: 'Investor', to: 'Bank', label: 'Guarantee payouts', kind: 'risk' },
      ],
      achieves: 'A legally clean transfer of a defined tranche of credit risk to a regulated guarantor, often simpler to document than a derivative.',
      transfers: 'The losses on the guaranteed tranche, as a contractual indemnity rather than a market derivative.',
      keeps: 'Everything outside the guaranteed tranche, plus reliance on the guarantor\'s ability to perform.',
      investorsGet: 'A premium for providing the guarantee, with payouts only on verified losses in the covered tranche.',
      ifLosses: 'The guarantor pays the bank under the indemnity. Enforceability and the guarantor\'s regulatory standing are what matter.',
      watchOut: ['Whether the guarantee is recognised as eligible protection by the supervisor', 'Documentation that is closer to insurance than the capital rules assume', 'Single-name reliance on one guarantor'],
      reporterQuestions: ['Is the guarantor an eligible protection provider under the rules?', 'How is the covered tranche defined?', 'What is the recourse if the guarantor cannot pay?'],
      tranche: 'two',
    },
    {
      id: 'cln', label: 'SPV-issued CLN (through an SPE)',
      explainer: 'A special-purpose vehicle issues notes to investors. The vehicle holds the cash and enters a credit derivative with the bank. Used for placement flexibility and investor base reach.',
      flows: [
        { from: 'Investor', to: 'SPV', label: 'Note proceeds', kind: 'cash' },
        { from: 'SPV', to: 'Bank', label: 'Credit protection', kind: 'risk' },
        { from: 'Bank', to: 'SPV', label: 'Premium', kind: 'cash' },
        { from: 'SPV', to: 'Investor', label: 'Coupon / repayment', kind: 'cash' },
      ],
      achieves: 'Funded protection with wider investor reach, because notes issued by an SPE can be placed with investors who cannot face the bank directly.',
      transfers: 'The credit risk on the protected slice, passed from the bank to the SPV via a derivative and on to noteholders.',
      keeps: 'The first-loss and senior pieces, plus operational reliance on the SPV structure performing as documented.',
      investorsGet: 'Notes issued by the SPV paying a coupon, collateralised by the cash they posted.',
      ifLosses: 'The SPV uses the posted collateral to make the bank whole under the derivative, and noteholders are repaid less.',
      watchOut: ['Added legal and operational complexity of the SPE', 'Whether the derivative and the notes are perfectly back-to-back', 'Investor understanding of the SPV\'s role'],
      reporterQuestions: ['Why use an SPV rather than issue notes directly?', 'Is the collateral fully funding the protection?', 'Where is the SPV established and why?'],
      tranche: 'three',
    },
    {
      id: 'bank-cln', label: 'Bank-issued CLN (direct)',
      explainer: 'The bank issues the credit-linked notes itself, with no special-purpose vehicle in between. Simpler to set up, but the investor takes credit risk on the issuing bank as well as on the reference pool.',
      flows: [
        { from: 'Investor', to: 'Bank', label: 'Note proceeds', kind: 'cash' },
        { from: 'Bank', to: 'Investor', label: 'Coupon', kind: 'cash' },
        { from: 'Investor', to: 'Bank', label: 'Loss absorption', kind: 'risk' },
        { from: 'Bank', to: 'Investor', label: 'Residual at maturity', kind: 'cash' },
      ],
      achieves: 'Funded protection with the least structural overhead, issued straight off the bank\'s own balance sheet.',
      transfers: 'The credit risk on the protected slice, with loss absorption written directly into the note terms.',
      keeps: 'The first-loss and senior pieces. The bank also now owes the noteholder, so investors take dual risk.',
      investorsGet: 'Notes paying a coupon, repaid at maturity to the extent reference-pool losses have not consumed the principal.',
      ifLosses: 'The principal owed to the investor is written down by verified losses on the reference pool.',
      watchOut: ['Investor exposure to the issuing bank as well as the loan pool', 'Supervisory limits on direct issuance in some jurisdictions', 'Whether the notes count as eligible funded protection'],
      reporterQuestions: ['Why issue directly rather than through an SPV?', 'Are investors comfortable taking the bank\'s own credit risk?', 'Does the supervisor recognise direct bank-issued CLNs here?'],
      tranche: 'three',
    },
    {
      id: 'cds', label: 'CDS-based structure (unfunded derivative)',
      explainer: 'The protection is a portfolio credit default swap rather than a note or guarantee. The bank buys protection on a reference pool and pays a running spread; the seller pays on credit events. Unfunded, so counterparty risk is central.',
      flows: [
        { from: 'Bank', to: 'Investor', label: 'Running spread', kind: 'cash' },
        { from: 'Investor', to: 'Bank', label: 'Credit-event payments', kind: 'risk' },
      ],
      achieves: 'Capital relief through a market-standard derivative, often with flexible terms and an established documentation base.',
      transfers: 'The credit risk on the protected slice via the swap, settled on defined credit events.',
      keeps: 'The first-loss and senior pieces, and the counterparty risk on the swap seller, often mitigated with collateral posting.',
      investorsGet: 'A running spread for selling protection, with payments out only on verified credit events.',
      ifLosses: 'On a credit event the seller pays the loss under the swap. Collateral arrangements and credit-event definitions decide how clean that is.',
      watchOut: ['Counterparty risk if the swap is uncollateralised', 'Credit-event definitions that do not match real-world defaults', 'Basis between the swap pool and the actual loans'],
      reporterQuestions: ['Is the swap collateralised, and how often is margin posted?', 'How are credit events defined and verified?', 'Does the swap reference the exact loans or a proxy?'],
      tranche: 'mezz',
    },
    {
      id: 'replenish', label: 'Synthetic securitisation with replenishment',
      explainer: 'A funded or unfunded structure where the reference pool is allowed to refresh during a replenishment period: as loans repay, new eligible loans take their place. Keeps the deal at scale, but the eligibility rules and excess-spread mechanics are where risk can quietly return to the bank.',
      flows: [
        { from: 'Bank', to: 'Investor', label: 'Premium', kind: 'cash' },
        { from: 'Investor', to: 'Bank', label: 'Loss protection', kind: 'risk' },
        { from: 'Bank', to: 'Pool', label: 'Replenish eligible loans', kind: 'cash' },
      ],
      achieves: 'A longer, larger-scale protection that does not amortise away as the underlying loans repay during the revolving period.',
      transfers: 'The credit risk on the protected slice of a pool that is kept topped up with eligible new loans.',
      keeps: 'The first-loss and senior pieces, plus the risk that replenishment or excess spread weakens the actual transfer.',
      investorsGet: 'A premium across a longer horizon, in exchange for accepting a pool whose contents change within agreed limits.',
      ifLosses: 'Losses are allocated up the stack as normal, but the analysis is harder because the pool composition shifts over time.',
      watchOut: ['Eligibility criteria loose enough to let credit quality drift', 'Trapped excess spread that fails the commensurate-risk-transfer test', 'Replenishment that outlasts the supervisor\'s comfort'],
      reporterQuestions: ['How long is the replenishment period and how tight are the eligibility rules?', 'How is excess spread treated?', 'Did the supervisor scrutinise the revolving feature?'],
      tranche: 'three',
    },
  ] as Structure[],

  lifecycle: [
    { id: 1, title: 'Identify the objective', short: 'The bank decides why it wants to do an SRT.', detail: 'Usually capital relief on a constrained portfolio, but can also be concentration management, single-name exposure reduction, or freeing capacity for new lending.', who: 'Treasury, Capital Management, CFO', watch: 'Listen for the stated objective on the earnings call. Capital relief, concentration, and growth capacity lead to very different deals.' },
    { id: 2, title: 'Select the reference portfolio', short: 'The bank picks which loans the deal will reference.', detail: 'Driven by capital density, vintage, sector concentration, data quality, and the bank\'s strategic constraints. Often hundreds to thousands of names.', who: 'Risk, Lending units, Portfolio Management', watch: 'Which book is referenced tells you the real story. A core corporate book signals capital efficiency; a stressed sector signals derisking.' },
    { id: 3, title: 'Design the structure and tranches', short: 'Where the tranches attach, how big they are, what counts as a loss.', detail: 'Attachment and detachment, replenishment period, eligibility criteria, time call, loss verification process, all tuned to capital relief vs. investor pricing.', who: 'Structuring, Treasury, Counsel', watch: 'Attachment and detachment points and the size of the protected slice. This, not the headline pool size, is the amount of risk actually sold.' },
    { id: 4, title: 'Approach investors', short: 'The bank or its arranger markets the deal to protection sellers.', detail: 'A small universe of specialist credit funds, insurers, reinsurers, and pension allocators. Pricing is bilateral and confidential.', who: 'Arranger, Treasury, IR', watch: 'Who is on the other side, and whether they use leverage. Investor identity and leverage are where the systemic-risk story lives.' },
    { id: 5, title: 'Internal and supervisory review', short: 'The bank\'s committees and the supervisor sign off on capital treatment.', detail: 'Risk committee, ALCO, board sub-committees on the bank side. SRT recognition decision and notification on the supervisor side.', who: 'Risk, Regulatory, Supervisor', watch: 'Whether the supervisor confirmed significant risk transfer, and on what conditions. No recognition means no capital relief.' },
    { id: 6, title: 'Documentation', short: 'Lawyers finalise the contracts and disclosures.', detail: 'Protection agreement (CLN, financial guarantee, or derivative), reference register, eligibility schedule, investor presentation, transparency reports.', who: 'Counsel (both sides), Documentation', watch: 'Credit-event definitions, replenishment and excess-spread terms, and termination rights. The fine print decides how real the transfer is.' },
    { id: 7, title: 'Closing and settlement', short: 'Money moves, protection becomes effective, the deal goes live.', detail: 'Funded structures: investor cash enters collateral account. Unfunded: protection becomes effective on signing.', who: 'Operations, Treasury', watch: 'The close date and deal size if disclosed. This is usually the point a transaction becomes public and quotable.' },
    { id: 8, title: 'Bank receives credit protection', short: 'The bank books the capital benefit subject to ongoing conditions.', detail: 'RWA reduction reflected in capital reporting. CET1 ratio improves. New lending capacity is unlocked.', who: 'Treasury, Capital, Finance', watch: 'How much CET1 or RWA actually moved, and what the bank says it will do with the freed capacity.' },
    { id: 9, title: 'Ongoing monitoring and reporting', short: 'The portfolio is monitored and reported to investors and supervisors.', detail: 'Investor reports, transparency templates, supervisor reporting, ongoing eligibility checks, replenishment notices.', who: 'Portfolio Management, Reporting', watch: 'Performance disclosures over the life of the deal. Rising losses or replenishment of weaker loans is a follow-up story.' },
    { id: 10, title: 'Credit events', short: 'Defaults happen, losses get allocated up the stack.', detail: 'A credit event triggers loss verification, recovery process, and allocation. Losses fill the first-loss piece, then the protected mezzanine, then potentially senior.', who: 'Workout, Counsel, Independent verification', watch: 'Whether losses are reaching the protected slice, and whether the protection seller is paying as expected.' },
    { id: 11, title: 'Amortise, replenish, mature or unwind', short: 'The deal winds down, by schedule, call, or unwind.', detail: 'Some deals replenish for a period and then amortise. Others mature on a fixed date. Some are called early, refinanced, or unwound for capital or strategic reasons.', who: 'Treasury, Counsel', watch: 'An early call or unwind is newsworthy: it usually signals a change in capital strategy, pricing, or the regulatory backdrop.' },
  ] as LifecycleStage[],

  glossary: [
    { term: 'Synthetic risk transfer (SRT)', short: 'Selling the risk of a loan portfolio without selling the loans.', technical: 'A securitisation in which a bank transfers credit risk on a reference pool of assets to a third party via credit protection, without legal sale of the assets, to obtain regulatory capital relief or risk-management benefits.', why: 'It lets a bank free up capital, keep the customer relationship, and continue lending, without moving the loans off its books.', example: 'The bank used a synthetic risk transfer to free capital against a EUR 4 billion corporate loan portfolio.', confusion: 'It is not a true sale. The bank still holds the loans, services the borrowers, and keeps the senior risk.' },
    { term: 'Significant risk transfer (SRT recognition)', short: 'The regulatory test that decides whether a bank actually gets the capital benefit.', technical: 'The formal supervisory assessment under CRR/Basel that a meaningful portion of the credit risk has been transferred to third parties so that capital relief is permitted.', why: 'Without it, the transaction may be perfectly legal, but the bank does not get the regulatory capital benefit it expected.', example: 'The transaction passed significant risk transfer review with the ECB earlier this month.', confusion: 'The acronym SRT is used for both the product (synthetic risk transfer) and the test (significant risk transfer). They are related but not identical.' },
    { term: 'Capital relief', short: 'The reduction in the regulatory capital a bank must hold after the transaction.', technical: 'A reduction in risk-weighted assets and/or a CET1 ratio improvement attributable to the recognised transfer of credit risk on a reference portfolio.', why: 'Capital is the scarcest resource on a bank balance sheet. Freeing it is what makes the transaction worth doing.', example: 'The deal delivered roughly 80 basis points of CET1 capital relief.', confusion: 'Capital relief is not free money. The bank pays a premium to the protection seller, the deal makes sense only if relief exceeds the cost.' },
    { term: 'Protection buyer', short: 'The bank that wants to offload the credit risk.', technical: 'The originator of the reference portfolio that purchases credit protection on a tranche of that portfolio.', why: 'The protection buyer drives the transaction, its capital, risk, or lending capacity problem is what the deal solves.', example: 'The protection buyer was a top-five European bank seeking CET1 capacity for new lending.', confusion: 'The protection buyer keeps owning the loans. It only buys protection on losses.' },
    { term: 'Protection seller', short: 'The investor that takes the credit risk in exchange for a premium.', technical: 'A counterparty that sells credit protection on a tranche of the reference portfolio in return for an ongoing premium.', why: 'These are the investors. Without them, the transaction does not exist.', example: 'A specialist credit fund acted as protection seller on the mezzanine tranche.', confusion: 'Protection sellers do not buy the underlying loans. They sit in a derivative-like or note-like contract on top of them.' },
    { term: 'Reference portfolio', short: 'The pool of loans whose performance the transaction is based on.', technical: 'The identified group of credit exposures to which the credit protection contract refers and against which losses are measured.', why: 'Everything about the deal — pricing, structure, risk — flows from what is in this pool.', example: 'The reference portfolio comprised 1,400 senior corporate loans across eight sectors.', confusion: 'The loans do not leave the bank. The portfolio is just a contractually-defined list of names.' },
    { term: 'Tranche', short: 'A slice of the capital structure with a defined risk position.', technical: 'A contractually-defined segment of credit exposure with specified attachment and detachment points, ranking and loss-allocation order.', why: 'Tranches let the deal sell exactly the risk investors want, and let the bank keep what it wants.', example: 'The protected mezzanine tranche covered losses from 0.5% to 8% of the portfolio.', confusion: 'A tranche is not a separate company or pool. It is a risk position on the same pool.' },
    { term: 'Attachment point', short: 'The loss level at which a tranche starts taking losses.', technical: 'The cumulative loss percentage of the reference portfolio above which losses begin to be allocated to a given tranche.', why: 'It defines how much protection sits below the investor. The lower the attachment point, the riskier the position.', example: 'The mezzanine tranche has an attachment point of 0.5%.', confusion: 'Attachment is a portfolio-level loss percentage, not a dollar number on its own.' },
    { term: 'Detachment point', short: 'The loss level at which a tranche stops taking losses.', technical: 'The cumulative loss percentage above which a given tranche has been fully written down and the next tranche above starts absorbing losses.', why: 'It caps the investor\'s downside and defines where senior risk begins again.', example: 'The tranche detaches at 8%, after which any further losses fall to the senior retained piece.', confusion: 'Detachment is not the maximum loss in dollars, it is a percentage of the portfolio.' },
    { term: 'First-loss tranche', short: 'The very bottom slice, the first to absorb losses.', technical: 'The most subordinated tranche, attaching at 0% portfolio loss, designed to absorb the first cumulative losses on the reference portfolio.', why: 'Whoever holds it carries the highest credit risk and earns the highest spread.', example: 'The bank retained the 0–0.5% first-loss tranche to align interests with investors.', confusion: 'In many SRT deals the bank itself keeps the first-loss piece — it is not always the riskiest investor that holds it.' },
    { term: 'Mezzanine tranche', short: 'The middle slice, usually the one investors buy in SRT.', technical: 'A tranche between the first-loss and senior tranches, with defined attachment and detachment points capturing the bulk of stressed-but-not-catastrophic losses.', why: 'It is typically the part the bank wants protection on, large enough to free meaningful capital, narrow enough to price.', example: 'Mezzanine pricing settled in the high-single-digit spread range.', confusion: 'Mezzanine is not a defined band, its size varies deal by deal.' },
    { term: 'Senior tranche', short: 'The top slice, generally retained by the bank.', technical: 'The most senior tranche of the reference portfolio, attaching above the detachment point of the protected tranche.', why: 'It receives the lowest spread because it bears risk only in severe-loss scenarios.', example: 'The bank retained the senior tranche on its balance sheet.', confusion: 'The senior tranche is not risk-free. It carries tail risk and counts in the bank\'s capital calculation.' },
    { term: 'Credit event', short: 'A defined bad outcome, typically default, that triggers a loss calculation.', technical: 'A contractually-defined trigger such as failure to pay, bankruptcy, or restructuring that, when verified, causes loss allocation to the protected tranche.', why: 'Without a credit event mechanism, the protection contract has no way to actually pay out.', example: 'A credit event was declared on a single name in the reference portfolio in Q1.', confusion: 'A credit event does not automatically equal a full loss. The recovery process determines the final loss amount.' },
    { term: 'Funded protection', short: 'Investor cash is posted up front into a collateral account.', technical: 'A credit protection arrangement in which the protection seller pre-funds the maximum potential payout, typically via a credit-linked note or cash-collateralised structure.', why: 'Funded structures eliminate investor counterparty risk for the bank, useful for regulatory recognition.', example: 'The funded credit-linked notes were placed with a single investor.', confusion: 'Funded does not mean the investor owns the loans. The cash collateralises a derivative-like contract.' },
    { term: 'Unfunded protection', short: 'A pure promise to pay, like a guarantee, with no cash posted up front.', technical: 'A credit protection arrangement in which the protection seller commits to pay future losses on the protected tranche without pre-funding, subject to ongoing counterparty creditworthiness.', why: 'Cheaper for investors, but supervisors require the seller to be highly creditworthy, typically a regulated insurer or top-rated counterparty.', example: 'Unfunded protection was provided by a regulated reinsurer.', confusion: 'Unfunded is not uncollateralised forever — supervisors place strict conditions on who can write it.' },
    { term: 'Replenishment', short: 'Adding new loans into the reference pool as old ones repay or roll off.', technical: 'A contractual mechanism allowing the originator to substitute newly-originated exposures meeting eligibility criteria into the reference portfolio over a defined period.', why: 'It keeps the transaction effective over a long period; without it, the protected balance would melt away.', example: 'The transaction has a 24-month replenishment period.', confusion: 'Replenishment is bounded by eligibility criteria — the bank cannot just dump anything in.' },
    { term: 'Excess spread', short: 'The cushion of surplus interest a deal generates before losses hit investors.', technical: 'The margin between the income on the reference pool and the costs of the structure, which can be trapped to absorb early losses ahead of the protected tranche.', why: 'How excess spread is treated is a recurring test of whether real risk has moved, and a frequent supervisory flashpoint.', example: 'Trapped excess spread absorbed the first losses before the investor tranche was touched.', confusion: 'Generous excess spread can quietly leave more risk with the bank than the headline structure suggests.' },
    { term: 'Risk-weighted assets (RWA)', short: 'A scaled measure of a bank\'s assets, with riskier loans counted more heavily.', technical: 'The denominator of regulatory capital ratios, the bank\'s assets adjusted by regulator-defined risk weights reflecting credit, market, and operational risk.', why: 'Lower RWA means less capital required to hold the same business. SRT reduces RWA on the protected portion.', example: 'The deal reduced RWA on the corporate book by EUR 280 million.', confusion: 'RWA is not the dollar exposure of the bank; it is exposure times risk weight, which can be very different.' },
    { term: 'Credit-linked note (CLN)', short: 'A note whose repayment is linked to losses on a reference pool.', technical: 'A funded instrument under which the investor\'s principal absorbs credit losses on a defined reference portfolio, issued either directly by the bank or through a special-purpose vehicle.', why: 'CLNs are the workhorse funded SRT instrument, so the term appears in most deal coverage.', example: 'Investors bought credit-linked notes covering the mezzanine slice of the portfolio.', confusion: 'A CLN is funded (cash up front); a guarantee or swap on the same risk is usually unfunded.' },
    { term: 'Credit default swap (CDS)', short: 'A derivative contract that pays out if defined credit events occur.', technical: 'A bilateral derivative under which the protection buyer pays a running spread and the protection seller pays on credit events affecting the reference entity or portfolio.', why: 'Portfolio CDS is one way to execute unfunded SRT, so the mechanics matter for counterparty-risk stories.', example: 'The protection was written as a portfolio credit default swap rather than a note.', confusion: 'A CDS is unfunded, so unlike a CLN it carries counterparty risk on the protection seller.' },
    { term: 'Amortisation', short: 'The protected tranche shrinks over time as the portfolio is repaid.', technical: 'The contractual unwind of protection notional in line with reductions in the reference portfolio balance or a defined schedule.', why: 'Amortisation profiles drive how long the bank retains the capital benefit and how investors get repaid.', example: 'The deal amortises pro-rata to portfolio repayment after the replenishment period ends.', confusion: 'Amortisation is not the same as default — it is the planned repayment of healthy loans.' },
    { term: 'Regulatory capital', short: 'The minimum equity capital regulators require a bank to hold.', technical: 'The level of qualifying capital (CET1, AT1, Tier 2) that supervisory frameworks require banks to maintain against risk-weighted assets.', why: 'It is the binding constraint that makes SRT economically interesting in the first place.', example: 'The transaction was structured to maximise CET1 regulatory capital benefit.', confusion: 'Regulatory capital is not the same as accounting equity — the two follow different rules.' },
    { term: 'Credit risk transfer (CRT)', short: 'The broad family of tools for moving credit risk off a bank\'s balance sheet.', technical: 'An umbrella term covering synthetic and traditional techniques, from guarantees and credit derivatives to securitisation and outright loan sales, used to shift credit risk to third parties.', why: 'SRT is one member of the CRT family. Reporters often see the two used loosely, so it helps to be precise.', example: 'The bank\'s credit risk transfer programme spans both loan sales and synthetic deals.', confusion: 'CRT is the wider category; SRT specifically means the synthetic, derivative-based form.' },
    { term: 'Financial guarantee', short: 'A contractual promise by a regulated party to cover defined losses.', technical: 'An indemnity, closer in legal form to insurance than to a derivative, under which a regulated guarantor agrees to pay losses on a covered tranche.', why: 'Guarantees and insurance are a growing share of unfunded SRT, especially where insurers participate.', example: 'An insurer provided a financial guarantee on the senior-mezzanine tranche.', confusion: 'A guarantee is not the same as a derivative, and supervisors apply specific eligibility tests to it.' },
    { term: 'W parameter', short: 'A securitisation-framework factor that can penalise the capital treatment of a position.', technical: 'In the Basel securitisation framework, a supervisory input (the W term) that increases the risk weight of certain positions, notably where delinquent exposures are present in the pool.', why: 'It can materially affect how much capital relief a deal actually delivers, so it surfaces in technical disputes.', example: 'The presence of delinquent loans raised the W parameter and trimmed the capital benefit.', confusion: 'W is not the risk weight itself; it is one input that feeds the formula determining it.' },
    { term: 'Pro rata amortisation', short: 'Paying down all tranches together as the pool repays.', technical: 'An amortisation method under which principal is allocated across tranches in proportion to their size as the reference pool reduces.', why: 'The amortisation method changes how long the bank keeps its capital benefit and how investors are repaid.', example: 'The deal amortised pro rata, so the protected slice shrank alongside the pool.', confusion: 'Pro rata keeps the structure proportional; sequential repays the senior piece first.' },
    { term: 'Sequential amortisation', short: 'Repaying the most senior tranche first, then working down the stack.', technical: 'An amortisation method under which principal repays tranches in order of seniority, typically senior before mezzanine before first-loss.', why: 'Sequential pay tends to keep the protected slice in place longer, which affects pricing and capital benefit.', example: 'Under sequential amortisation the senior piece repaid before the mezzanine began to amortise.', confusion: 'Sequential is not pro rata; it changes which party is repaid first and how risk evolves over time.' },
    { term: 'Call feature', short: 'The bank\'s right to terminate the deal early on defined dates.', technical: 'A contractual option, often a time call or a clean-up call, allowing the protection buyer to unwind the transaction after a set period or once the pool falls below a threshold.', why: 'An exercised call is newsworthy and can signal a shift in capital strategy, pricing, or the regulatory backdrop.', example: 'The bank exercised the time call after three years and refinanced the protection.', confusion: 'A call is an option, not an obligation; supervisors scrutinise calls that look designed to game capital relief.' },
  ] as GlossaryTerm[],

  sourceObjects: [
    { name: 'Approved SRT definition', use: 'Core explainer and glossary', freshness: 'Stable, review annually', status: 'approved' },
    { name: 'Regulatory guidance tracker', use: 'OSFI, Fed, FDIC, PRA, Basel, EU context', freshness: 'Live, review monthly', status: 'review' },
    { name: 'Market statistics', use: 'Market size, issuance, investor demand', freshness: 'Live, review quarterly', status: 'review' },
    { name: 'Gensaki product facts', use: 'Boilerplate, platform modules, lifecycle', freshness: 'Stable, update on release', status: 'approved' },
    { name: 'Legal / accounting / tax interpretations', use: 'Validation flags only', freshness: 'Live, counsel owned', status: 'watch' },
  ] as SourceObject[],

  caveat: 'This source pack is an educational explainer built from public frameworks and Gensaki\'s own materials. It is not legal, accounting, investment, or regulatory advice, and it does not describe any specific transaction. Definitions are simplified for clarity; the controlling detail is always the deal documentation and the applicable rules in the relevant jurisdiction.',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctPt(v: number) {
  return Number.isInteger(v) ? `${v}%` : `${v.toFixed(1)}%`;
}

function trancheLayout(key: string): TrancheLayer[] {
  if (key === 'two') return [
    { label: 'Protected tranche', attach: 0, detach: 8, holder: 'sold to investors', color: C.bl },
    { label: 'Senior retained', attach: 8, detach: 100, holder: 'retained by bank', color: C.mute },
  ];
  return [
    { label: 'First-loss', attach: 0, detach: 0.5, holder: 'retained by bank', color: C.am },
    { label: 'Mezzanine', attach: 0.5, detach: 8, holder: 'sold to investors', color: C.bl },
    { label: 'Senior', attach: 8, detach: 100, holder: 'retained by bank', color: C.mute },
  ];
}

// ─── Small shared components ──────────────────────────────────────────────────

function SectionEyebrow({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: C.cyan, flexShrink: 0 }} />
      <span style={{ fontFamily: mono, fontSize: 11.5, letterSpacing: '0.8px', color: C.mute, textTransform: 'uppercase' }}>{text}</span>
    </div>
  );
}

function DashedLine({ color = C.line }: { color?: string }) {
  return (
    <div style={{
      height: 1, width: '100%',
      backgroundImage: `repeating-linear-gradient(to right, ${color} 0, ${color} 3px, transparent 3px, transparent 7px)`,
    }} />
  );
}

function MSec({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: 24, borderRadius: 16, background: '#fff',
      border: `1px solid ${C.line}`, width: '100%', boxSizing: 'border-box',
    }}>
      <SectionEyebrow text={eyebrow} />
      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  );
}

function Bullet({ text, dot = C.ink }: { text: string; dot?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 8 }} />
      <span style={{ fontFamily: geist, fontSize: 14, color: C.ink2, lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function NumBullet({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', background: C.cyan, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 500, color: C.cyanInk }}>{n}</span>
      </div>
      <span style={{ fontFamily: geist, fontSize: 14, color: C.ink2, lineHeight: 1.6, paddingTop: 3 }}>{text}</span>
    </div>
  );
}

function TermChip({ text }: { text: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: C.ink2,
      padding: '5px 9px', borderRadius: 6, background: C.card, border: `1px solid ${C.line}`,
      display: 'inline-block',
    }}>{text}</span>
  );
}

function MChips({ options, value, onChange }: { options: Opt[]; value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const sel = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              fontFamily: geist, fontSize: 13, fontWeight: 500,
              color: sel ? '#fff' : C.ink2,
              background: sel ? C.ink : '#fff',
              border: `1px solid ${sel ? 'transparent' : C.line}`,
              borderRadius: 9, padding: o.sub ? '8px 12px' : '8px 12px',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            {o.label}
            {o.sub && <div style={{ fontFamily: mono, fontSize: 9.5, color: sel ? 'rgba(255,255,255,0.7)' : C.mute2, marginTop: 2 }}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

function SegTabs({ tabs, value, onChange }: { tabs: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
      {tabs.map(t => {
        const sel = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              fontFamily: geist, fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap',
              color: sel ? '#fff' : C.ink2,
              background: sel ? C.ink : '#fff',
              border: `1px solid ${sel ? 'transparent' : C.line}`,
              borderRadius: 9, padding: '9px 14px', cursor: 'pointer',
            }}
          >{t.label}</button>
        );
      })}
    </div>
  );
}

function GlossaryRow({ t }: { t: GlossaryTerm }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 22, borderRadius: 14, background: '#fff', border: `1px solid ${C.line}` }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: geist, fontSize: 16, fontWeight: 500, color: C.ink, letterSpacing: '-0.2px' }}>{t.term}</div>
            <div style={{ fontFamily: geist, fontSize: 13.5, color: C.mute, marginTop: 4 }}>{t.short}</div>
          </div>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: C.card, border: `1px solid ${C.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: C.mute }}>{open ? '−' : '+'}</span>
          </div>
        </div>
      </button>
      {open && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {([['Technical', t.technical], ['Why it matters', t.why], ['Example', t.example], ['Common confusion', t.confusion]] as [string, string][]).map(([label, text]) => (
            <div key={label}>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.6px', color: C.mute, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: geist, fontSize: 13.5, color: C.ink2, lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => { if (a) setOpen(v => !v); }}
        style={{ background: 'none', border: 'none', cursor: a ? 'pointer' : 'default', width: '100%', textAlign: 'left', padding: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.ink, flexShrink: 0, marginTop: 8 }} />
          <div style={{ fontFamily: geist, fontSize: 14, color: C.ink2, lineHeight: 1.6, flex: 1 }}>{q}</div>
          {a && (
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: C.card, border: `1px solid ${C.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.mute }}>{open ? '−' : '+'}</span>
            </div>
          )}
        </div>
      </button>
      {open && a && (
        <div style={{
          marginTop: 10, marginLeft: 17, padding: 14,
          background: `${C.cyan}1A`, border: `1px solid ${C.cyan}4D`,
          borderRadius: 10,
        }}>
          <div style={{ fontFamily: geist, fontSize: 13.5, color: C.ink2, lineHeight: 1.7 }}>{a}</div>
        </div>
      )}
    </div>
  );
}

function LifecycleRow({ s, isLast }: { s: LifecycleStage; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: C.cyan,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 500, color: C.cyanInk }}>{s.id}</span>
        </div>
        {!isLast && <div style={{ width: 1, flex: 1, minHeight: 32, background: C.line }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 22 }}>
        <div style={{ fontFamily: geist, fontSize: 16, fontWeight: 500, color: C.ink, letterSpacing: '-0.2px' }}>{s.title}</div>
        <div style={{ fontFamily: geist, fontSize: 13.5, color: C.mute, marginTop: 4, lineHeight: 1.5 }}>{s.short}</div>
        {open && (
          <>
            <div style={{ fontFamily: geist, fontSize: 13.5, color: C.ink2, lineHeight: 1.6, marginTop: 8 }}>{s.detail}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: mono, fontSize: 9.5, color: C.mute2, letterSpacing: '0.5px' }}>WHO</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.mute }}>{s.who}</span>
            </div>
            {s.watch && (
              <div style={{ marginTop: 8, padding: 14, background: `${C.cyan}1A`, border: `1px solid ${C.cyan}4D`, borderRadius: 10 }}>
                <div style={{ fontFamily: mono, fontSize: 10.5, color: C.cyanInk, letterSpacing: '0.4px', marginBottom: 4 }}>// What to watch</div>
                <div style={{ fontFamily: geist, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>{s.watch}</div>
              </div>
            )}
          </>
        )}
        <button
          onClick={() => setOpen(v => !v)}
          style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: 11, color: C.ink, padding: 0 }}
        >{open ? 'Show less' : 'Show detail'}</button>
      </div>
    </div>
  );
}

function TrancheStack({ layers }: { layers: TrancheLayer[] }) {
  function barH(thickness: number) { return 34 + 64 * Math.sqrt(thickness / 100); }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[...layers].reverse().map(b => (
        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            flex: 1, height: barH(b.detach - b.attach),
            borderRadius: 8, background: `${b.color}24`, border: `1px solid ${b.color}8C`,
            display: 'flex', alignItems: 'center', padding: '0 14px', boxSizing: 'border-box',
          }}>
            <span style={{ fontFamily: geist, fontSize: 14, fontWeight: 500, color: b.color, flex: 1 }}>{b.label}</span>
            <span style={{ fontFamily: mono, fontSize: 11.5, color: C.ink }}>{pctPt(b.attach)} to {pctPt(b.detach)}</span>
          </div>
          <div style={{ width: 140, flexShrink: 0 }}>
            <div style={{ fontFamily: mono, fontSize: 10.5, color: C.mute }}>{b.holder}</div>
            <div style={{ fontFamily: mono, fontSize: 9.5, color: C.mute2 }}>thk {pctPt(b.detach - b.attach)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FlowRow({ f }: { f: FlowArrow }) {
  const col = f.kind === 'cash' ? C.bl : C.rd;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{ fontFamily: mono, fontSize: 11.5, color: C.ink, width: 86 }}>{f.from}</span>
      <span style={{ color: col, fontWeight: 700, fontSize: 12 }}>→</span>
      <span style={{ fontFamily: mono, fontSize: 11.5, color: C.ink, width: 86 }}>{f.to}</span>
      <div style={{ flex: 1 }} />
      <span style={{ fontFamily: mono, fontSize: 10.5, color: col, padding: '4px 9px', background: `${col}1A`, borderRadius: 999 }}>{f.label}</span>
    </div>
  );
}

function StructRow({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.4px', color, textTransform: 'uppercase', width: 132, flexShrink: 0, paddingTop: 2 }}>{label}</div>
      <div style={{ fontFamily: geist, fontSize: 13.5, color: C.ink2, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}


function SectionIndicator({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            width: 28, height: 16, display: 'flex', alignItems: 'center',
          }}
        >
          <div style={{
            height: 3, borderRadius: 999,
            background: i === active ? C.cyan : C.bl,
            width: i === active ? 22 : 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
            transition: 'width 0.25s ease-out, background 0.25s ease-out',
          }} />
        </button>
      ))}
    </div>
  );
}

// ─── Two-column layout helper ─────────────────────────────────────────────────

function TwoCol({ isCompact, a, b }: { isCompact: boolean; a: React.ReactNode; b: React.ReactNode }) {
  if (isCompact) return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{a}{b}</div>;
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ flex: 1 }}>{a}</div>
      <div style={{ flex: 1 }}>{b}</div>
    </div>
  );
}

// ─── Section head ─────────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, aside, isCompact }: {
  eyebrow: string;
  title: { text: string; em: boolean }[];
  aside: string;
  isCompact: boolean;
}) {
  const titleNode = (
    <div style={{
      fontFamily: geist, fontSize: isCompact ? 36 : 52, fontWeight: 500,
      letterSpacing: isCompact ? '-1.1px' : '-1.6px', lineHeight: 1.05, maxWidth: 760,
    }}>
      {title.map((s, i) => (
        <span key={i} style={{ color: s.em ? C.mute : C.ink, fontWeight: s.em ? 400 : 500 }}>{s.text}</span>
      ))}
    </div>
  );
  const asideNode = (
    <div style={{ fontFamily: geist, fontSize: isCompact ? 15 : 17, fontWeight: 400, color: C.mute, lineHeight: 1.6 }}>{aside}</div>
  );
  if (isCompact) return (
    <div style={{ paddingBottom: 40 }}>
      <SectionEyebrow text={eyebrow} />
      <div style={{ marginTop: 18 }}>{titleNode}</div>
      <div style={{ marginTop: 22 }}>{asideNode}</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 52 }}>
      <div style={{ flex: '0 1 auto' }}>
        <SectionEyebrow text={eyebrow} />
        <div style={{ marginTop: 18 }}>{titleNode}</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ width: 1, background: C.line, alignSelf: 'stretch' }} />
      <div style={{ maxWidth: 340 }}>{asideNode}</div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function DiligenceView({ onSelectItem }: { onSelectItem: (v: string | null) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact]     = useState(window.innerWidth < 1080);
  const [activeSection, setActive]    = useState(0);
  const [evTab, setEvTab]             = useState('briefing');
  const [persona, setPersona]         = useState('bank-capital');
  const [structureSel, setStructure]  = useState('funded');

  const sec0Ref = useRef<HTMLDivElement>(null);
  const sec1Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 1080);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const midY = el.scrollTop + el.clientHeight / 2;
      const s1top = sec1Ref.current?.offsetTop ?? Infinity;
      setActive(midY >= s1top ? 1 : 0);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const goSection = useCallback((i: number) => {
    const refs = [sec0Ref, sec1Ref];
    refs[i]?.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const hPad = isCompact ? 20 : 40;

  // ── Hero ────────────────────────────────────────────────────────────────────

  function heroSection() {
    return (
      <div
        ref={sec0Ref}
        style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          background: `linear-gradient(to bottom, #F2FBF4, ${C.bg} 55%), radial-gradient(ellipse at 50% -20%, ${C.mint1}, ${C.mint2}, transparent 60%)`,
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: `0 ${hPad}px` }}>
          <div style={{ maxWidth: 1180, width: '100%', margin: '0 auto' }}>
            <div style={{ maxWidth: 720 }}>
              <div style={{ marginBottom: 32 }}>
                <HeroEyebrow text="Source intelligence, educational explainer" />
              </div>
              <div style={{ marginBottom: 28 }}>
                <span style={{
                  fontFamily: geist, fontSize: isCompact ? 46 : 70, fontWeight: 500,
                  letterSpacing: isCompact ? '-1.6px' : '-3px', lineHeight: 1.05, color: C.ink,
                }}>
                  Learn synthetic risk transfer{' '}
                </span>
                <span style={{
                  fontFamily: geist, fontSize: isCompact ? 46 : 70, fontWeight: 400,
                  letterSpacing: isCompact ? '-1.6px' : '-3px', lineHeight: 1.05, color: C.mute,
                }}>
                  with guided source intelligence.
                </span>
              </div>
              <div style={{ marginBottom: 36 }}>
                {[
                  '// Study SRT through plain-English explainers and source-backed context.',
                  '// Explore the glossary, lifecycle, structures, and evidence base,',
                  '// with clear separation between confirmed facts and open questions.',
                ].map(l => (
                  <div key={l} style={{ fontFamily: mono, fontSize: isCompact ? 13 : 15, color: C.ink2, lineHeight: 1.8 }}>{l}</div>
                ))}
              </div>
              <CTAButton title="View evidence base" kind="ink" onClick={() => goSection(1)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Evidence base ───────────────────────────────────────────────────────────

  function briefingBody() {
    const b = SP.briefing;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MSec eyebrow="// In one paragraph">
          <div style={{ fontFamily: geist, fontSize: 15, color: C.ink2, lineHeight: 1.7 }}>{b.short}</div>
        </MSec>
        <MSec eyebrow="// Why it matters">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.whyMatters.map(t => <Bullet key={t} text={t} />)}</div>
        </MSec>
        <MSec eyebrow="// How it works">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{b.howWorks.map((t, i) => <NumBullet key={i} n={i + 1} text={t} />)}</div>
        </MSec>
        <MSec eyebrow="// Who is involved">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.who.map(t => <Bullet key={t} text={t} />)}</div>
        </MSec>
        <TwoCol isCompact={isCompact}
          a={<MSec eyebrow="// Who benefits"><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.whoBenefits.map(t => <Bullet key={t} text={t} dot={C.green} />)}</div></MSec>}
          b={<MSec eyebrow="// Who bears the risk"><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.whoBearsRisk.map(t => <Bullet key={t} text={t} dot={C.am} />)}</div></MSec>}
        />
        <MSec eyebrow="// What can go wrong">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.canGoWrong.map(t => <Bullet key={t} text={t} dot={C.am} />)}</div>
        </MSec>
        <TwoCol isCompact={isCompact}
          a={<MSec eyebrow="// What is known"><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.known.map(t => <Bullet key={t} text={t} dot={C.green} />)}</div></MSec>}
          b={<MSec eyebrow="// What is unknown"><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.unknown.map(t => <Bullet key={t} text={t} dot={C.am} />)}</div></MSec>}
        />
        <MSec eyebrow="// Questions to ask">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.questionsToAsk.map(t => <Bullet key={t} text={t} />)}</div>
        </MSec>
        <MSec eyebrow="// Common misconceptions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.misconceptions.map(t => <Bullet key={t} text={t} dot={C.rd} />)}</div>
        </MSec>
        <MSec eyebrow="// Suggested story angles">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{b.storyAngles.map(t => <Bullet key={t} text={t} dot={C.pu} />)}</div>
        </MSec>
        <MSec eyebrow="// Key terms">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{b.keyTerms.map(t => <TermChip key={t} text={t} />)}</div>
        </MSec>
      </div>
    );
  }

  function glossaryBody() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: geist, fontSize: 14, color: C.mute, lineHeight: 1.6, marginBottom: 4 }}>
          {SP.glossary.length} terms, plain meaning first. Tap any term for the technical definition, why it matters, an example, and the confusion it usually causes.
        </div>
        {SP.glossary.map(t => <GlossaryRow key={t.term} t={t} />)}
      </div>
    );
  }

  function lifecycleBody() {
    return (
      <MSec eyebrow="// From objective to unwind">
        <div>
          {SP.lifecycle.map((s, i) => (
            <LifecycleRow key={s.id} s={s} isLast={i === SP.lifecycle.length - 1} />
          ))}
        </div>
      </MSec>
    );
  }

  function structureBody() {
    const st = SP.structures.find(s => s.id === structureSel) ?? SP.structures[0];
    const layers = trancheLayout(st.tranche);
    const investorPct = layers.filter(l => l.holder.includes('investor')).reduce((a, l) => a + (l.detach - l.attach), 0);
    const bankPct = layers.filter(l => l.holder.includes('bank')).reduce((a, l) => a + (l.detach - l.attach), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MSec eyebrow="// Choose a structure">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MChips options={SP.structures.map(s => ({ id: s.id, label: s.label }))} value={structureSel} onChange={setStructure} />
            <div style={{ fontFamily: geist, fontSize: 14.5, color: C.ink2, lineHeight: 1.65 }}>{st.explainer}</div>
            <DashedLine />
            <div>
              <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.7px', color: C.mute, textTransform: 'uppercase', marginBottom: 8 }}>// How the money and risk move</div>
              {st.flows.map((f, i) => <FlowRow key={i} f={f} />)}
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                {[{ color: C.bl, label: 'Cash' }, { color: C.rd, label: 'Loss / risk' }].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: mono, fontSize: 10.5, color: C.mute }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MSec>
        {st.achieves && (
          <MSec eyebrow="// What this structure does">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StructRow label="Bank's goal" text={st.achieves} color={C.bl} />
              <StructRow label="Risk transferred" text={st.transfers} color={C.green} />
              <StructRow label="Risk the bank keeps" text={st.keeps} color={C.am} />
              <StructRow label="Investors receive" text={st.investorsGet} color={C.bl} />
              <StructRow label="If losses occur" text={st.ifLosses} color={C.rd} />
            </div>
          </MSec>
        )}
        {(st.watchOut.length > 0 || st.reporterQuestions.length > 0) && (
          <TwoCol isCompact={isCompact}
            a={<MSec eyebrow="// What could go wrong"><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{st.watchOut.map(t => <Bullet key={t} text={t} dot={C.rd} />)}</div></MSec>}
            b={<MSec eyebrow="// Questions to ask"><div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{st.reporterQuestions.map(t => <Bullet key={t} text={t} />)}</div></MSec>}
          />
        )}
        <MSec eyebrow="// Tranche visualiser">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontFamily: geist, fontSize: 13.5, color: C.mute, lineHeight: 1.6 }}>
              Losses are allocated from the bottom of the stack upward. The investor's protected slice sits above the first-loss piece the bank usually keeps, and below the wide senior piece the bank retains.
            </div>
            <TrancheStack layers={layers} />
            <div style={{ fontFamily: mono, fontSize: 11, color: C.ink2, lineHeight: 1.6, padding: 14, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10 }}>
              0% losses | {layers.map(l => `${l.label.toLowerCase()} ${l.holder}`).join(' | ')} | 100% losses
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, padding: 14, background: `${C.bl}14`, border: `1px solid ${C.bl}40`, borderRadius: 10 }}>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.4px', color: C.bl, textTransform: 'uppercase', marginBottom: 3 }}>Sold to investors</div>
                <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 500, color: C.ink }}>{pctPt(investorPct)}</div>
                <div style={{ fontFamily: mono, fontSize: 9.5, color: C.mute2, marginTop: 2 }}>of portfolio losses</div>
              </div>
              <div style={{ flex: 1, padding: 14, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10 }}>
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.4px', color: C.mute, textTransform: 'uppercase', marginBottom: 3 }}>Retained by bank</div>
                <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 500, color: C.ink }}>{pctPt(bankPct)}</div>
                <div style={{ fontFamily: mono, fontSize: 9.5, color: C.mute2, marginTop: 2 }}>first-loss + senior</div>
              </div>
            </div>
            <Bullet text="The headline reference-pool size is not the amount of risk sold to investors. The risk transferred is only the thickness of the protected slice." dot={C.am} />
            <div style={{ fontFamily: mono, fontSize: 10, color: C.mute2, lineHeight: 1.5 }}>
              Illustrative attachment and detachment points only. A simplified loss-stack diagram, not a legal, regulatory, or capital model.
            </div>
          </div>
        </MSec>
      </div>
    );
  }

  function questionsBody() {
    const qmap = SP.questions[persona] ?? {};
    const cats = SP.questionCategories.filter(c => qmap[c]);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MSec eyebrow="// Sort FAQs by interest to:">
          <MChips options={SP.personas} value={persona} onChange={setPersona} />
        </MSec>
        {cats.map(cat => (
          <MSec key={cat} eyebrow={`// ${cat}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(qmap[cat] ?? []).map(q => <QuestionRow key={q} q={q} a={SP.answers[q] ?? ''} />)}
            </div>
          </MSec>
        ))}
      </div>
    );
  }

  function evidenceSection() {
    return (
      <div
        ref={sec1Ref}
        style={{
          minHeight: '100vh', paddingTop: 96 + (isCompact ? 28 : 44),
          paddingBottom: isCompact ? 40 : 64,
          background: `linear-gradient(to bottom, ${C.bg} 50%, #F0F9F1)`,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: `0 ${hPad}px` }}>
          <SectionHead
            eyebrow="The evidence base"
            title={[
              { text: 'Briefing, definitions, lifecycle, ', em: false },
              { text: 'structure, and questions.', em: true },
            ]}
            aside="A guided SRT intelligence library for learning the concepts, structures, lifecycle, questions, and evidence that shape the market."
            isCompact={isCompact}
          />
          <div style={{ marginBottom: 20 }}>
            <SegTabs
              tabs={[
                { id: 'briefing',  label: 'Briefing' },
                { id: 'glossary',  label: 'Definitions' },
                { id: 'lifecycle', label: 'Lifecycle' },
                { id: 'structure', label: 'Structure' },
                { id: 'questions', label: 'Questions' },
              ]}
              value={evTab}
              onChange={setEvTab}
            />
          </div>
          {evTab === 'briefing'  && briefingBody()}
          {evTab === 'glossary'  && glossaryBody()}
          {evTab === 'lifecycle' && lifecycleBody()}
          {evTab === 'structure' && structureBody()}
          {evTab === 'questions' && questionsBody()}
          <div style={{ marginTop: isCompact ? 56 : 96 }}>
            <PageFooter isCompact={isCompact} />
          </div>
        </div>
      </div>
    );
  }

  // ── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div ref={scrollRef} style={{ height: '100vh', overflowY: 'auto', background: C.bg, position: 'relative' }}>
      <HeaderNav isCompact={isCompact} selectedItem="Diligence" onSelectItem={onSelectItem} scrollRef={scrollRef} />
      {heroSection()}
      {evidenceSection()}
      <div style={{
        position: 'fixed', left: isCompact ? 8 : 12, top: '50%',
        transform: 'translateY(-50%)', zIndex: 50,
      }}>
        <SectionIndicator count={2} active={activeSection} onSelect={goSection} />
      </div>
    </div>
  );
}
