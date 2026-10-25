// How long a read may sit in 'pending'/'processing' before it's treated as
// dead: the scan route's own limit (maxDuration 300s) plus room to spare.
export const STALE_READ_MS = 10 * 60_000;
