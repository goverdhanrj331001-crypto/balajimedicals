import Link from 'next/link';
import { Icon } from '@/components/ui/icon';

export default function NotFound() {
  return (
    <div className="app-root flex min-h-screen flex-col items-center justify-center text-center">
      <Icon name="error_outline" className="text-[80px] text-[#bdc9ca]" />
      <h1 className="mt-3 text-[40px] font-extrabold">404</h1>
      <p className="text-[14px] text-[#3e494a]">The page you are looking for doesn't exist.</p>
      <Link
        href="/"
        className="mt-5 rounded-lg bg-[#006872] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#00535b]"
      >
        Back to Home
      </Link>
    </div>
  );
}
