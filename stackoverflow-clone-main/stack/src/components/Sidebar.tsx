import { cn } from "@/lib/utils";
import { useTranslation } from "@/context/TranslationContext";
import {
  Bookmark,
  Bot,
  Building,
  FileText,
  Globe,
  Home,
  MessageSquare,
  MessageSquareIcon,
  Star,
  Tag,
  Trophy,
  Users,
  CreditCard,
  History,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Badge } from "./ui/badge";

const NavLink = ({
  href,
  icon: Icon,
  label,
  badge,
  badgeClass,
}: {
  href: string;
  icon: any;
  label: string;
  badge?: string;
  badgeClass?: string;
}) => {
  const router = useRouter();
  const isActive =
    href === "/"
      ? router.pathname === "/"
      : router.pathname.startsWith(href);

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center px-2 py-2 rounded text-sm transition-colors",
          isActive
            ? "bg-orange-50 text-orange-700 font-medium border-r-2 border-orange-500"
            : "text-gray-700 hover:bg-gray-100"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 mr-2 lg:mr-3 flex-shrink-0",
            isActive ? "text-orange-500" : "text-gray-500"
          )}
        />
        <span className="truncate">{label}</span>
        {badge && (
          <Badge
            variant="secondary"
            className={cn("ml-auto text-xs flex-shrink-0", badgeClass)}
          >
            {badge}
          </Badge>
        )}
      </Link>
    </li>
  );
};

const SectionLabel = ({ label }: { label: string }) => (
  <li className="pt-3">
    <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {label}
    </p>
  </li>
);

const Sidebar = ({ isopen }: any) => {
  const { t } = useTranslation();

  return (
    <div>
      <aside
        className={cn(
          "top-[53px] w-48 lg:w-56 min-h-screen bg-white shadow-sm border-r transition-transform duration-200 ease-in-out md:translate-x-0",
          isopen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-2 lg:p-3">
          <ul className="space-y-0.5">
            {/* Main */}
            <NavLink href="/" icon={Home} label={t("nav.home")} />
            <NavLink href="/questions" icon={MessageSquareIcon} label={t("nav.questions")} />
            <NavLink
              href="/ai-assist"
              icon={Bot}
              label={t("nav.aiAssist")}
              badge="Labs"
              badgeClass="bg-purple-100 text-purple-700"
            />
            <NavLink href="/tags" icon={Tag} label={t("nav.tags")} />
            <NavLink href="/users" icon={Users} label={t("nav.users")} />

            {/* Community */}
            <SectionLabel label={t("nav.socialSpace") === "nav.socialSpace" ? "Community" : "Community"} />
            <NavLink href="/social" icon={Globe} label={t("nav.socialSpace")} />
            <NavLink href="/friends" icon={Users} label={t("nav.friends")} />

            {/* My Account */}
            <SectionLabel label="My Account" />
            <NavLink
              href="/subscription"
              icon={CreditCard}
              label={t("nav.subscription")}
              badge="Plans"
              badgeClass="bg-blue-100 text-blue-700"
            />
            <NavLink href="/rewards" icon={Star} label={t("nav.rewards")} />
            <NavLink href="/language" icon={Globe} label={t("nav.language")} />
            <NavLink href="/login-history" icon={History} label={t("nav.loginHistory")} />

            {/* More */}
            <SectionLabel label="More" />
            <NavLink href="/saves" icon={Bookmark} label={t("nav.saves")} />
            <NavLink
              href="/challenges"
              icon={Trophy}
              label={t("nav.challenges")}
              badge="NEW"
              badgeClass="bg-orange-100 text-orange-800"
            />
            <NavLink href="/chat" icon={MessageSquare} label={t("nav.chat")} />
            <NavLink href="/articles" icon={FileText} label={t("nav.articles")} />
            <NavLink href="/companies" icon={Building} label={t("nav.companies")} />
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;