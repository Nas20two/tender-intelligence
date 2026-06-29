import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categories, seedTenders, categoryKeywords } from '@/data/tenders';

export async function generateStaticParams() {
  return categories.map(cat => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = categories.find(c => c.slug === category);
  
  if (!cat) return { title: 'Category Not Found' };

  const tenders = seedTenders[category] || [];
  const keywords = categoryKeywords[category] || [];
  const latestCloses = [...tenders].sort((a, b) => a.closes.localeCompare(b.closes));
  const closingSoon = latestCloses.filter(t => t.status === 'closing-soon');

  return {
    title: `${cat.name} Tenders & Contracts | Australian Government Procurement`,
    description: closingSoon.length > 0 
      ? `Browse ${tenders.length} active ${cat.name.toLocaleLowerCase()} tenders in Australia. ${closingSoon[0].title} — $${closingSoon[0].value}. AI-powered tender search and analysis.`
      : cat.seoDescription,
    keywords: ['Australian tenders', 'government procurement', ...keywords, ...keywords.map(k => k + ' tender')].join(', '),
    openGraph: {
      title: `${cat.name} Tenders | Tender Intelligence`,
      description: `Browse ${tenders.length} active ${cat.name.toLocaleLowerCase()} tenders. ${cat.description}`,
      type: 'website'
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = categories.find(c => c.slug === category);
  
  if (!cat) notFound();

  const tenders = seedTenders[category] || [];
  const keywords = categoryKeywords[category] || [];
  
  const activeTenders = tenders.filter(t => t.status === 'active');
  const closingSoon = tenders.filter(t => t.status === 'closing-soon');
  const sorted = [...closingSoon, ...activeTenders];
  
  const totalValue = sorted.reduce((sum, t) => {
    const num = parseInt(t.value.replace(/[$,]/g, ''));
    return sum + num;
  }, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/tenders" className="text-blue-200 hover:text-white text-sm flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Categories
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{cat.name} Tenders</h1>
          <p className="text-lg text-blue-100 max-w-3xl">{cat.seoDescription}</p>
          <div className="flex flex-wrap gap-4 mt-6">
            <Link 
              href={`/ti?category=${cat.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Search {cat.name} Tenders with AI
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{sorted.length}</p>
            <p className="text-sm text-slate-500">Active Tenders</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{closingSoon.length}</p>
            <p className="text-sm text-slate-500">Closing Soon</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">${(totalValue / 1_000_000).toFixed(0)}M+</p>
            <p className="text-sm text-slate-500">Total Value</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">AI</p>
            <p className="text-sm text-slate-500">Powered Analysis</p>
          </div>
        </div>
      </section>

      {/* Tender List */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        {closingSoon.length > 0 && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="font-semibold text-amber-800 mb-1">
              ⏰ {closingSoon.length} tender{closingSoon.length > 1 ? 's' : ''} closing soon
            </p>
            <p className="text-sm text-amber-700">
              Don't miss the deadline. Premium members get email alerts and AI-powered bid recommendations.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {sorted.map(tender => (
            <div key={tender.id} className="bg-white rounded-xl p-5 border hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-slate-800">{tender.title}</h2>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{tender.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {tender.agency}
                    </span>
                    <span>{tender.location}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Closes: {tender.closes}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tender.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 w-24">
                  <p className="text-xl font-bold text-slate-800">{tender.value}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                    tender.status === 'closing-soon' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {tender.status === 'closing-soon' ? 'Closing Soon' : 'Active'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{tender.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Upsell */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
          <h3 className="font-bold text-lg text-slate-800 mb-2">
            Need deeper analysis?
          </h3>
          <p className="text-slate-600 mb-4">
            Tender Intelligence Premium ($19/month) gives you AI-powered bid analysis, win probability scoring, 
            compliance checking, and email alerts for new tenders matching your business.
          </p>
          <div className="flex gap-3">
            <Link 
              href={`/ti?category=${cat.slug}`}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Search with AI
            </Link>
            <Link 
              href="/premium"
              className="px-5 py-2.5 bg-white border border-blue-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="bg-slate-50 py-12 px-4">
        <div className="max-w-5xl mx-auto prose prose-slate max-w-none">
          <h2>{cat.name} Tenders — Complete Guide</h2>
          <p>
            This page lists active {cat.name.toLocaleLowerCase()} tender opportunities from Australian government agencies 
            at federal, state and local levels. Use keyword search to find opportunities relevant to your business.
          </p>
          <p>
            Popular search terms in this category: {keywords.slice(0, 6).join(', ')}.
          </p>
          <h3>Need Help Responding?</h3>
          <p>
            Tender Intelligence Premium helps you analyse opportunities, assess win probability, and generate 
            compliance-ready responses. Start with a free search — no credit card required.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-400">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tenders" className="hover:text-blue-600">Tenders</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600">{cat.name}</span>
      </section>
    </div>
  );
}