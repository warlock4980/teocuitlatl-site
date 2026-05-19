# Project Mexica Ambassador Bot Plan

## Positioning

The bot should be a compliant referral and campaign assistant, not a spam engine and not an investment promoter.

Working name:

```text
Teo Scout Bot
```

Purpose:

- Track qualified partner introductions.
- Send approved campaign materials to opt-in contacts.
- Log who referred whom.
- Help route sponsors request a pilot.
- Reward ambassadors for useful, legitimate introductions.

## Hard Rules

The bot must not:

- Spam cold contacts.
- Scrape emails or phone numbers.
- Pretend to be a human.
- Promise token price movement, investment returns, or passive income.
- Pay people to endorse the project without disclosure.
- Refer to TOM, TEO, MIC, or CEN as investment products.
- Contact minors or sensitive audiences.

The bot must:

- Use opt-in contact lists only.
- Include clear identity and contact info.
- Include unsubscribe/stop instructions for commercial messages.
- Log referral source and consent.
- Require disclosure for rewarded social posts or introductions.
- Route legal/compliance questions to `legal@teocuitlatl.com`.

## Reward Model

Keep rewards operational and modest.

Recommended early-stage rewards:

- Testnet TOM/TEO for demo participation.
- Non-transferable proof badges for ambassador milestones.
- Manual cash/gift-card referral rewards only after a verified partner meeting.
- Sponsor credits or merch later.

Avoid:

- Rewarding "angel investor" referrals with tokens.
- Paying commissions on token purchases.
- Promising a share of future upside.

## Pilot/Sponsor Packages

Use clean commercial pricing:

```text
$444 Waypoint Sponsor
$555 Route Discovery Package
Custom Founding Pilot
```

These are service/sponsorship packages, not token purchases.

## Qualification Criteria

A qualified lead is:

- A real business, creator, guide, destination, or organization.
- Contact opted in or was personally introduced.
- Has a clear route, venue, audience, or pilot use case.
- Has a valid email/phone/contact page.
- Is not asking to buy tokens as an investment.

## Suggested Bot Commands

```text
/lead
/status
/materials
/disclosure
/tiers
/legal
```

## Approved Disclosure Copy

For rewarded ambassadors:

```text
I may receive a referral reward if this introduction leads to a Project Mexica pilot conversation. Project Mexica is a prototype/testnet route-reward project, not an investment offer.
```

Short social version:

```text
Paid/referral partnership. Prototype only. Not investment advice.
```

## First Backend Tables

```text
ambassadors
partner_leads
lead_events
referral_rewards
message_templates
unsubscribe_requests
compliance_flags
```

## MVP Flow

1. Ambassador submits a lead.
2. Bot checks required fields.
3. Bot sends approved intro email only if the lead opted in or was personally introduced.
4. Lead can request a pilot page or reply by email.
5. Admin marks lead as qualified, meeting scheduled, or rejected.
6. Reward is issued manually after review.

## Why This Makes Money Safely

The business is not "sell the coin."

The business is:

- sponsored routes
- tourism campaigns
- merchant pilots
- payment-flow pilots
- partner dashboards
- route analytics
- creator campaigns

The coin/reward layer makes the experience more engaging, but the revenue comes from commercial partners and pilots.
