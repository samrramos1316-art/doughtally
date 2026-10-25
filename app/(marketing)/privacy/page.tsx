import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { COMPANY, CONTACT_EMAIL, PRIVACY_UPDATED, SITE } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy · DoughTally Software" };
export const viewport: Viewport = { themeColor: "#0c0b09" };

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const sections: LegalSection[] = [
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p><strong>Account details.</strong> Your email address, a password (stored only as a salted hash by our authentication provider), your business name and type, and your name if you give it.</p>
        <p><strong>What you put into the app.</strong> Photos and PDFs of supplier invoices, menus and recipes; the details read from them (vendors, invoice numbers and dates, line items, quantities, prices); your ingredient list and costs; recipes, menu items and selling prices; your settings, such as target margin and alert threshold; and the decisions you make while reviewing, such as confirming that a supplier&apos;s wording means a particular ingredient.</p>
        <p><strong>Technical data.</strong> When you use the site, our hosting and database providers record standard request logs (IP address, browser type, pages requested, time, errors). We use these to keep the service running and secure. We also count page visits with Vercel Web Analytics, which sets no cookies and records only the kind of page visited, the referring site and general device details (browser, operating system, country) — not who you are or what&apos;s in your account.</p>
        <p><strong>Records we keep about your account.</strong> Which version of our Terms and this policy you agreed to, and when; when you signed up and last signed in; and a daily count of how many documents you had read by AI (to apply the daily limit).</p>
        <p><strong>Other people in your documents.</strong> Supplier invoices can name a supplier&apos;s staff or show their business address. We use that only as part of your invoice; we don&apos;t build records about those people or use it for anything else.</p>
        <p>We don&apos;t ask for payment card details, and we don&apos;t collect information about your customers.</p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <>
        <p>Only to run DoughTally for you:</p>
        <ul>
          <li>to read your documents and turn them into costs, recipes and menu items;</li>
          <li>to match invoice lines to your ingredients, and remember how each supplier words things so it can match them automatically next time;</li>
          <li>to calculate costs and margins, raise price alerts and suggest options;</li>
          <li>to sign you in, keep your account secure, and send the emails the service needs (such as confirming your address or resetting a password);</li>
          <li>to find and fix problems, and to answer you when you contact us.</li>
        </ul>
        <p><strong>We don&apos;t sell your data, share it with advertisers, or use it to advertise to you.</strong> We don&apos;t combine your business&apos;s numbers with anyone else&apos;s, and we don&apos;t show them to other users.</p>
      </>
    ),
  },
  {
    id: "ai",
    title: "Automated reading and AI",
    body: (
      <>
        <p>To read your documents, DoughTally sends them to AI models run by our service providers:</p>
        <ul>
          <li><strong>Anthropic (Claude)</strong> receives the images and PDFs you upload and the text read from them, invoice lines you type in by hand, and your ingredient, recipe and menu names and figures — to extract line items, menu items and recipes, to match and convert recipe amounts, to link menu items to recipes, and to write the short plain-English summaries on price alerts.</li>
          <li><strong>Voyage AI</strong> receives ingredient names and invoice item descriptions (text only, not your documents) to produce the numerical representations used for matching.</li>
        </ul>
        <p>Both process this data to provide their service to us under their commercial API terms, which do not permit them to train their models on it; they may keep it for a limited time under those terms (for example, to detect abuse). Nothing that AI reads changes your costs on its own when it isn&apos;t sure: uncertain matches wait for you to confirm, and you can correct anything.</p>
      </>
    ),
  },
  {
    id: "share",
    title: "Who else handles your data",
    body: (
      <>
        <p>We use a small number of providers to run the service. Each only gets what it needs to do its job:</p>
        <ul>
          <li><strong>Supabase</strong>: database, sign-in, and storage for your uploaded files.</li>
          <li><strong>Vercel</strong>: hosting of the website and app, and anonymous, cookie-free visit counts.</li>
          <li><strong>Anthropic</strong> and <strong>Voyage AI</strong>: as described above.</li>
          <li>An email delivery provider, for account emails.</li>
        </ul>
        <p>Market prices come from public sources (the USDA Agricultural Marketing Service, the UN Food and Agriculture Organization and the US Bureau of Labor Statistics). We only download from them; none of your information is sent to them.</p>
        <p>We may disclose information if the law requires it, to protect the rights and safety of our users or the service, or as part of a sale or merger of the business, in which case this policy would continue to apply to your data.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <>
        <p>We use only the cookies needed to keep you signed in. There are no advertising or cross-site tracking cookies, and our visit counting uses no cookies at all.</p>
        <p>The app also stores a small note in your browser if you dismiss the &ldquo;install the app&rdquo; card, so it stops asking. If you install DoughTally to your home screen, your device keeps a copy of the offline page and app files; it never stores your business data offline.</p>
        <p>Every item, what it&apos;s for and how long it lasts is listed in our <Link href="/cookies">Cookie Policy</Link>.</p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <>
        <p>Your data is encrypted in transit (HTTPS) and at rest with our providers. Every row in the database belongs to one business, and the database itself refuses to show it to anyone outside that business. Uploaded files are kept in private storage that only your account can read. Server-side secrets are never sent to your browser.</p>
        <p>No system is perfectly secure. If we learn of a breach that affects your data, we&apos;ll tell you without undue delay.</p>
      </>
    ),
  },
  {
    id: "keep",
    title: "How long we keep it, and your choices",
    body: (
      <>
        <p>How long we keep each kind of information:</p>
        <ul>
          <li><strong>Account details, your business&apos;s records and your invoice files:</strong> while you have an account. You can edit or delete individual ingredients, recipes, menu items and invoice lines at any time.</li>
          <li><strong>Menu and recipe photos you import:</strong> deleted as soon as you save the import, and within about a day if you don&apos;t finish it.</li>
          <li><strong>Request and error logs:</strong> kept by our hosting and database providers for their standard periods (typically days to a few weeks), then deleted.</li>
          <li><strong>After you delete your account:</strong> removed from the live service straight away; copies in our providers&apos; backups age out on their normal schedules (typically within 30 days).</li>
        </ul>
        <p><strong>Settings → Download my data</strong> gives you a copy of everything we hold for your account and business, as one file. <strong>Settings → Delete account</strong> deletes your account and all of its data. You can also email {mail} from the address on the account for either, or to correct anything you can&apos;t edit yourself.</p>
        <p>Depending on where you live, you may have further rights under laws such as the GDPR; email us and we&apos;ll respond within the time the law requires. California residents, see below.</p>
        <p><strong>Do Not Track and Global Privacy Control.</strong> We don&apos;t track you across other websites or let anyone else do so on ours, and we don&apos;t sell or share personal information for advertising, so there is nothing for these browser signals to switch off. The site works the same whether or not your browser sends them.</p>
      </>
    ),
  },
  {
    id: "california",
    title: "Your California privacy rights",
    body: (
      <>
        <p>This section is for California residents and follows the California Consumer Privacy Act, as amended by the California Privacy Rights Act (CCPA). In the last 12 months we have collected these categories of personal information, all from you, your uploads and your device, and only for the purposes in &ldquo;How we use it&rdquo;:</p>
        <ul>
          <li><strong>Identifiers:</strong> email address, name if you give it, account ID, IP address.</li>
          <li><strong>Account login details:</strong> your email and password (stored only as a salted hash). This is &ldquo;sensitive personal information&rdquo;; we use it only to sign you in and keep your account secure.</li>
          <li><strong>Commercial information:</strong> your business&apos;s purchases from suppliers, as read from your invoices, and its recipes, menu and prices.</li>
          <li><strong>Internet or network activity:</strong> request logs and anonymous page-visit counts, as described above.</li>
        </ul>
        <p>We disclose these categories only to the service providers listed in &ldquo;Who else handles your data&rdquo;, for the business purpose of running DoughTally. <strong>We do not sell or share personal information</strong> (including for cross-context behavioral advertising), and have not in the last 12 months; we don&apos;t sell or share the information of anyone under 16. We don&apos;t use sensitive personal information to infer anything about you, and we don&apos;t make automated decisions that have legal or similarly significant effects on you: DoughTally&apos;s suggestions are options for you to choose from.</p>
        <p>You have the right to <strong>know</strong> what personal information we hold and how we use it, to get a <strong>copy</strong> of it in a portable format, to have it <strong>corrected</strong> or <strong>deleted</strong>, to <strong>opt out</strong> of its sale or sharing (we do neither), and to <strong>limit</strong> the use of sensitive personal information (we already use it only to provide the service). We won&apos;t treat you differently for using any of these rights.</p>
        <p>To use them: Settings → Download my data and Settings → Delete account work straight away. Or email {mail} from the address on your account; we verify a request by confirming it with that address, and answer within 45 days (we&apos;ll tell you if we need up to 45 more). You can have an authorized agent make a request for you; we&apos;ll ask for your signed permission and confirm the request with you directly. We don&apos;t disclose personal information to third parties for their own direct marketing.</p>
      </>
    ),
  },
  {
    id: "other",
    title: "Children, international use and changes",
    body: (
      <>
        <p>DoughTally is a business tool for adults (our Terms require users to be 18 or older). It isn&apos;t directed at children, and we don&apos;t knowingly collect information from anyone under 18; if we learn we have, we delete it.</p>
        <p>Our providers may store and process data in the United States and other countries. Where the law requires it, transfers are covered by the providers&apos; standard contractual protections.</p>
        <p>If we change this policy in a way that matters, we&apos;ll update the date above and tell signed-up users by email or in the app before the change takes effect.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions or requests: {mail}. This policy covers {SITE} and the DoughTally app, operated by {COMPANY}. See also our <Link href="/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy"
      title="Privacy Policy"
      intro={
        <p>
          DoughTally Software (&ldquo;DoughTally&rdquo;, &ldquo;we&rdquo;) helps small businesses that buy supplies on invoices track what they pay and the margins on what they sell. That means you trust us with your invoices and your numbers. This page explains, plainly, what we collect, what we do with it, and who else touches it.
        </p>
      }
      sections={sections}
      updated={PRIVACY_UPDATED}
    />
  );
}
