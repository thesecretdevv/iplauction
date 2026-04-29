import Link from 'next/link';

export default function BrandLink({ href = '/', className = '', compact = false }) {
  const classes = ['site-brand', compact ? 'site-brand-compact' : '', className].filter(Boolean).join(' ');

  return (
    <Link href={href} className={classes} aria-label="Go to iplauction.fun homepage">
      <span className="site-brand-domain">iplauction.fun</span>
    </Link>
  );
}
