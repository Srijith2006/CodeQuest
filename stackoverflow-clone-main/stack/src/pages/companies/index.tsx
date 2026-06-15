import Mainlayout from "@/layout/Mainlayout";
import { Building, Search, MapPin, Users, ExternalLink, Briefcase } from "lucide-react";
import { useState } from "react";

const COMPANIES = [
  {
    id: 1, name: "Google", logo: "G", color: "bg-red-500",
    industry: "Technology", size: "100,000+", location: "Mountain View, CA",
    description: "A global technology leader specializing in search, cloud computing, and AI-powered products.",
    openRoles: 342, tags: ["AI/ML", "Cloud", "Search", "Mobile"],
    website: "https://google.com", founded: 1998,
  },
  {
    id: 2, name: "Microsoft", logo: "M", color: "bg-blue-600",
    industry: "Technology", size: "100,000+", location: "Redmond, WA",
    description: "A multinational technology corporation producing software, electronics, and cloud services.",
    openRoles: 287, tags: ["Cloud", ".NET", "Azure", "Gaming"],
    website: "https://microsoft.com", founded: 1975,
  },
  {
    id: 3, name: "Meta", logo: "F", color: "bg-blue-500",
    industry: "Social Media", size: "50,000+", location: "Menlo Park, CA",
    description: "Building the future of connection through social media, VR, AR, and the metaverse.",
    openRoles: 198, tags: ["React", "VR", "AI", "Mobile"],
    website: "https://meta.com", founded: 2004,
  },
  {
    id: 4, name: "Amazon", logo: "A", color: "bg-orange-500",
    industry: "E-Commerce / Cloud", size: "100,000+", location: "Seattle, WA",
    description: "Global e-commerce and cloud computing giant, home to AWS, the world's leading cloud platform.",
    openRoles: 521, tags: ["AWS", "Cloud", "Logistics", "AI"],
    website: "https://amazon.com", founded: 1994,
  },
  {
    id: 5, name: "Stripe", logo: "S", color: "bg-purple-600",
    industry: "FinTech", size: "5,000–10,000", location: "San Francisco, CA",
    description: "A financial infrastructure platform for internet businesses, powering online payments worldwide.",
    openRoles: 87, tags: ["Payments", "API", "FinTech", "Ruby"],
    website: "https://stripe.com", founded: 2010,
  },
  {
    id: 6, name: "Anthropic", logo: "AI", color: "bg-gray-800",
    industry: "AI Research", size: "500–1,000", location: "San Francisco, CA",
    description: "An AI safety company building reliable, interpretable, and steerable AI systems.",
    openRoles: 43, tags: ["AI Safety", "LLMs", "Python", "Research"],
    website: "https://anthropic.com", founded: 2021,
  },
  {
    id: 7, name: "Vercel", logo: "V", color: "bg-black",
    industry: "Developer Tools", size: "500–1,000", location: "San Francisco, CA",
    description: "The platform for frontend developers, providing tooling for Next.js and edge deployments.",
    openRoles: 34, tags: ["Next.js", "Edge", "DevTools", "TypeScript"],
    website: "https://vercel.com", founded: 2015,
  },
  {
    id: 8, name: "Atlassian", logo: "AT", color: "bg-blue-700",
    industry: "Productivity Software", size: "10,000+", location: "Sydney, Australia",
    description: "Developer and publisher of Jira, Confluence, Trello and other team collaboration software.",
    openRoles: 115, tags: ["Jira", "SaaS", "Java", "Productivity"],
    website: "https://atlassian.com", founded: 2002,
  },
];

const INDUSTRIES = ["All", "Technology", "Social Media", "E-Commerce / Cloud", "FinTech", "AI Research", "Developer Tools", "Productivity Software"];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");

  const filtered = COMPANIES.filter((c) => {
    const matchInd = industry === "All" || c.industry === industry;
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    return matchInd && matchSearch;
  });

  return (
    <Mainlayout>
      <main className="p-4 lg:p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-semibold">Companies</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Explore tech companies and find your next opportunity
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies, roles, technologies…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Industry filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                industry === ind
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{COMPANIES.length}</p>
            <p className="text-xs text-blue-600">Companies Listed</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">
              {COMPANIES.reduce((a, c) => a + c.openRoles, 0).toLocaleString()}
            </p>
            <p className="text-xs text-green-600">Open Roles</p>
          </div>
          <div className="hidden sm:block bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{INDUSTRIES.length - 1}</p>
            <p className="text-xs text-purple-600">Industries</p>
          </div>
        </div>

        {/* Companies grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <Building className="w-12 h-12 text-gray-200" />
            <p className="text-gray-500">No companies found.</p>
            <button
              onClick={() => { setSearch(""); setIndustry("All"); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-all hover:border-blue-200 group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {c.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </h3>
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-500">{c.industry} · Est. {c.founded}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">{c.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {c.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {c.size}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {c.tags.map((t) => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <Briefcase className="w-3 h-3" />
                    {c.openRoles} open roles
                  </div>
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    View company →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Mainlayout>
  );
}
