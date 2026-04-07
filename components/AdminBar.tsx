import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import CreateCardButton from '@/components/CreateCardButton';

interface AdminBarProps {
  loggedIn: boolean;
}

export default function AdminBar({ loggedIn }: AdminBarProps) {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
      {/* Brand mark (left) */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-900/30 flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 7v5l3 3" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-white hidden sm:block tracking-tight">
          Sarab Sanjha Darbar
        </span>
      </div>

      {/* Right-side nav */}
      <nav className="flex items-center gap-3">
        {loggedIn ? (
          <>
            <CreateCardButton />
            <SignOutButton />
          </>
        ) : (
          <Link
            href="/login"
            id="nav-login-link"
            className="text-sm font-medium text-zinc-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 rounded-lg px-4 py-2 transition-all duration-150"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
