import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Flame,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { levelFromXp } from "@/lib/edunova";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/ask", label: "Ask a question", icon: Upload },
  { to: "/history", label: "History", icon: History },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const xp = data?.profile?.xp ?? 0;
  const { level } = levelFromXp(xp);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">Edunova</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
                  pathname.startsWith(item.to) && "bg-surface text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
            {data?.isStaff ? (
              <Link
                to="/teacher"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
                  pathname.startsWith("/teacher") && "bg-surface text-foreground",
                )}
              >
                <GraduationCap className="size-4" />
                Teacher
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden items-center gap-1.5 rounded-full bg-lime-soft px-3 py-1.5 text-xs font-semibold text-lime sm:flex">
              <Flame className="size-3.5" />
              {data?.profile?.streak_days ?? 0}d · Lv {level}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-xs text-muted-foreground",
                pathname.startsWith(item.to) && "bg-surface text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {data?.isStaff ? (
            <Link
              to="/teacher"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
            >
              Teacher
            </Link>
          ) : null}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
