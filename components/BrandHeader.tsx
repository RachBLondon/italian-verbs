import Link from 'next/link';

export default function BrandHeader({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link className={['brandBlock', className].filter(Boolean).join(' ')} href={href}>
      Verbissimo!
    </Link>
  );
}
