import { isAuthenticated } from '@/lib/auth';
import HeroSection from '@/components/HeroSection';
import AdminBar from '@/components/AdminBar';
import CardList from '@/components/CardList';

export default async function Home() {
  const loggedIn = await isAuthenticated();

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero — full viewport */}
      <HeroSection loggedIn={loggedIn} />

      {/* Admin-only section below hero */}
      {loggedIn && (
        <section className="flex-1 bg-[#0D0D0D] px-4 py-10 sm:px-6 lg:px-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-semibold text-white">Your Cards</h2>
                <p className="text-sm text-zinc-500 mt-0.5">
                  All shareable links you've created
                </p>
              </div>
            </div>
            <CardList />
          </div>
        </section>
      )}
    </main>
  );
}
