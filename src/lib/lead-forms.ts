// Meta Instant Form map: which question key holds which answer, and what each
// multiple-choice option key means.
//
// Fill an entry from a real test lead, never by guessing: create one with Meta's
// Lead Ads Testing Tool, then read its keys through Zernio's
// `GET /v1/ads/leads?formId=...` (it returns `fields` and `fieldData`). Spec: "Build
// Brief — Lead Source, Article Audit CTA and Meta Form Leads (October 2026)" in
// Notion, Part C step 6.
//
// A lead from a form that is not listed here (or listed with an empty formId) is
// still handled: Meta's standard keys give the name, email and phone, and the
// notification lists every raw answer, so no lead is ever dropped.

export type ServiceInterest = 'SEO' | 'Website' | 'Digital cards' | 'Custom plugins';

export interface LeadFormMap {
  /** Meta form ID. Empty until the test lead confirms it. */
  formId: string;
  /** Form name in Meta, for the notification. */
  name: string;
  /** Question key for each answer. Omit a key until it is confirmed. */
  keys: {
    name?: string;
    email?: string;
    phone?: string;
    business?: string;
    website?: string;
    interest?: string;
  };
  /** Option key (k1, k2, ...) to the label the visitor saw. */
  options: Record<string, string>;
}

export const LEAD_FORMS: LeadFormMap[] = [
  {
    // TODO after the first test lead: set formId, the business, website and
    // interest keys, and the interest option keys.
    formId: '',
    name: 'ILD — Free Website Audit (Oct 2026)',
    keys: {},
    options: {},
  },
];

/**
 * "What are you most interested in?" label to the Leads database Service Interest,
 * as set in the Quick Wins plan. "Not sure yet" counts as SEO.
 */
export const INTEREST_TO_SERVICE: Record<string, ServiceInterest> = {
  'More enquiries': 'SEO',
  'A new website': 'Website',
  'A digital member or loyalty card': 'Digital cards',
  'A custom plugin': 'Custom plugins',
  'Not sure yet': 'SEO',
};

export interface NormalisedLead {
  /** True when the form is in LEAD_FORMS. */
  known: boolean;
  formName: string;
  name: string;
  email: string;
  phone: string;
  business: string;
  website: string;
  /** The interest label, after the option key is mapped. */
  interest: string;
  service: ServiceInterest | '';
}

// Meta's standard keys for prefilled questions.
const STD = { name: 'full_name', first: 'first_name', last: 'last_name', email: 'email', phone: 'phone_number' };

export function normaliseLead(formId: string, fields: Record<string, string>): NormalisedLead {
  const form = formId ? LEAD_FORMS.find((f) => f.formId === formId) : undefined;
  const k = form?.keys ?? {};
  const get = (key?: string) => (key ? fields[key]?.trim() ?? '' : '');

  const name =
    get(k.name) || get(STD.name) || [get(STD.first), get(STD.last)].filter(Boolean).join(' ');
  const rawInterest = get(k.interest);
  const interest = (form?.options[rawInterest] ?? rawInterest).trim();

  return {
    known: Boolean(form),
    formName: form?.name ?? `Unmapped form ${formId || '(no form ID)'}`,
    name,
    email: (get(k.email) || get(STD.email)).toLowerCase(),
    phone: get(k.phone) || get(STD.phone),
    business: get(k.business),
    website: get(k.website),
    interest,
    service: INTEREST_TO_SERVICE[interest] ?? '',
  };
}
