import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui/Logo';
import { env } from '@/config/env';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all border ${
    isActive
      ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
      : 'bg-transparent border-transparent text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border)]'
  }`;

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-[52px] bg-[var(--surface)] border-b border-[var(--border)] px-5 flex items-center justify-between flex-shrink-0 select-none">
      <div className="flex items-center gap-6">
        <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-90">
          <Logo size={26} />
          <div>
            <div className="font-mono text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
              {env.appName.toUpperCase()}
            </div>
            <div className="font-mono text-[9px] tracking-[0.07em] text-[var(--muted)] hidden sm:block">
              independent dual-model analysis
            </div>
          </div>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Analyze
          </NavLink>
          <NavLink to="/reports" className={navLinkClass}>
            Reports
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2.5">
          <span className="font-mono text-[9px] tracking-[0.09em] px-[7px] py-[3px] rounded border border-[var(--accent)] text-[var(--accent)]">
            PathNet · XGBoost
          </span>
          <span className="font-mono text-[9px] tracking-[0.09em] px-[7px] py-[3px] rounded border border-[var(--accent2)] text-[var(--accent2)]">
            DrugNet · CatBoost
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[var(--text)] text-xs font-mono font-semibold">
                {user.username}
              </span>
              <span className="text-[9px] text-[var(--muted)] font-mono uppercase tracking-widest">
                Lab Researcher
              </span>
            </div>

            <nav className="flex md:hidden items-center gap-1">
              <NavLink to="/reports" className={navLinkClass}>
                Reports
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
            </nav>

            <button
              type="button"
              onClick={logout}
              className="bg-transparent border border-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[rgba(255,91,91,0.3)] px-3 py-1.5 rounded text-[10px] font-mono tracking-wider transition-colors cursor-pointer uppercase"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
