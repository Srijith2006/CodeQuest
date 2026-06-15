import { useAuth } from "@/lib/AuthContext";
import { Menu, Search, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";



// ── Simple nav links — each navigates to a real page ─────────────────────────
const NAV_LINKS = [
  { label: "About",     href: "/about" },
  { label: "Products",  href: "/products" },
  { label: "For Teams", href: "/for-teams" },
];

// ── CodeQuest SVG logo (no external file dependency) ─────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 px-1 group">
      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors">
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 bg-orange-500 rounded-sm" />
        </div>
      </div>
      <span className="text-lg font-bold text-gray-800 hidden sm:block">
        Code<span className="font-normal">Quest</span>
      </span>
    </Link>
  );
}

// ── Active-link helper ────────────────────────────────────────────────────────
function NavLink({ label, href }: { label: string; href: string }) {
  const router = useRouter();
  const isActive = router.pathname === href;
  return (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "text-orange-600 bg-orange-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = ({ handleslidein }: any) => {
  const { user, Logout } = useAuth() as any;
  const [hasMounted, setHasMounted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  useEffect(() => setHasMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  }, [router.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchText.trim())}`);
      setSearchText("");
      setShowMobileSearch(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-white border-t-[3px] border-orange-500 shadow-[0_1px_5px_rgba(0,0,0,0.15)]">
        <div className="max-w-[1440px] mx-auto px-3 flex items-center gap-2 h-[53px]">

          {/* Mobile sidebar toggle */}
          <button
            aria-label="Toggle sidebar"
            className="md:hidden p-2 rounded hover:bg-gray-100 transition flex-shrink-0"
            onClick={handleslidein}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logo */}
          <Logo />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0.5 ml-1">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} label={link.label} href={link.href} />
            ))}
          </nav>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 relative max-w-xl mx-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search questions, tags, users…"
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 bg-gray-50 transition"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Spacer on tablet */}
          <div className="flex-1 lg:hidden" />

          {/* Mobile: search icon */}
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100 transition"
            onClick={() => setShowMobileSearch((v) => !v)}
          >
            <Search className="w-4 h-4 text-gray-600" />
          </button>

          {/* Mobile: hamburger for nav links */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100 transition"
            onClick={() => setShowMobileMenu((v) => !v)}
          >
            <ChevronDown
              className={`w-4 h-4 text-gray-600 transition-transform ${showMobileMenu ? "rotate-180" : ""}`}
            />
          </button>

          {/* Auth area */}
          {hasMounted && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {!user ? (
                <>
                  <Link
                    href="/auth"
                    className="hidden sm:block text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-300 px-3 py-1.5 rounded-lg transition"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="hidden sm:block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
                  >
                    Sign up
                  </Link>
                  {/* Mobile: compact */}
                  <Link href="/auth" className="sm:hidden text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 px-2.5 py-1.5 rounded-lg">
                    Login
                  </Link>
                </>
              ) : (
                <>
                  {/* User avatar */}
                  <Link
                    href={`/users/${(user as any)._id}`}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {(user as any).name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                      {(user as any).name?.split(" ")[0]}
                    </span>
                  </Link>

                  <button
                    onClick={() => { Logout(); router.push("/auth"); }}
                    className="text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <span className="hidden sm:inline">Log out</span>
                    <span className="sm:hidden text-xs">Out</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile search bar */}
        {showMobileSearch && (
          <div className="lg:hidden px-3 pb-2.5 bg-white border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </form>
          </div>
        )}

        {/* Mobile nav menu */}
        {showMobileMenu && (
          <div className="md:hidden px-3 pb-3 bg-white border-b border-gray-100">
            <nav className="flex flex-col gap-1 pt-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Mobile auth links if not logged in */}
              {hasMounted && !user && (
                <>
                  <div className="border-t border-gray-100 mt-1 pt-2" />
                  <Link href="/auth" className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors text-center">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;