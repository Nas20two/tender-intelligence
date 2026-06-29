import Link from 'next/link';
import { categories, allTenders } from '@/data/tenders';

export const metadata = {
  title: 'Australian Government Tenders & Procurement Opportunities | Tender Intelligence',
  description: 'Search and discover Australian government tender opportunities across all categories. ICT, construction, healthcare, defence, education and more. Free tender search with AI-powered analysis.',
  keywords: 'Australian tenders, government procurement, AusTender, RFT, RFP, tender opportunities, government contracts, procurement Australia',
  openGraph: {
    title: 'Australian Government Tenders & Procurement Opportunities',
    description: 'Search and discover Australian government tender opportunities across all categories. ICT, construction, healthcare, defence and more.',
    type: 'website'
  }
};

export default function TendersLanding() {
  const totalValue = allTenders.reduce((sum, t) => {
    const num = parseInt(t.value.replace(/[$,]/g, ''));
    return sum + num;
  }, 0);

  return (
    <div className="min-h-screen">
      {/* SEO Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Australian Government Tenders & Procurement Opportunities
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl leading-relaxed">
            Discover live Australian government tender opportunities across all categories. 
            From ICT and construction to healthcare and defence, find contracts that match your business. 
            AI-powered search, analysis and compliance tools included.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link 
              href="/ti"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Search All Tenders
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
            >
              About Tender Intelligence
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{allTenders.length}</p>
            <p className="text-sm text-slate-500">Active Tenders</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
            <p className="text-sm text-slate-500">Categories</p>
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

      {/* Category Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Browse Tenders by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/tenders/${cat.slug}`}
              className="block p-6 bg-white rounded-xl border hover:shadow-lg transition-shadow hover:border-blue-200"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {cat.count} tenders
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">{cat.name}</h3>
              <p className="text-sm text-slate-500 mb-3">{cat.description}</p>
              <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                View tenders →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Tenders */}
      <section className="bg-slate-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recent High-Value Tenders</h2>
          <div className="space-y-4">
            {allTenders.filter(t => parseInt(t.value.replace(/[$,]/g, '')) > 10_000_000).slice(0, 5).map(tender => (
              <div key={tender.id} className="bg-white rounded-xl p-5 border hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/tenders/${tender.category}`} className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                      {categories.find(c => c.slug === tender.category)?.name || tender.category}
                    </Link>
                    <h3 className="font-semibold text-slate-800 mt-1">{tender.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{tender.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                      <span>{tender.agency}</span>
                      <span>{tender.location}</span>
                      <span>Closes: {tender.closes}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-slate-800">{tender.value}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                      tender.status === 'closing-soon' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {tender.status === 'closing-soon' ? 'Closing Soon' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/ti" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
              View all tenders with AI analysis →
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="prose prose-slate max-w-none">
          <h2>About Australian Government Tenders</h2>
          <p>
            The Australian government spends over $70 billion annually on procurement across federal, state and local levels. 
            Tender Intelligence helps businesses discover, analyse and respond to these opportunities efficiently.
          </p>
          <h3>What is AusTender?</h3>
          <p>
            AusTender is the Australian Government's procurement information system. It publishes all open tender opportunities 
            from federal government agencies. State governments maintain their own procurement portals including:
          </p>
          <ul>
            <li><strong>NSW:</strong> eTendering / buy.nsw</li>
            <li><strong>Victoria:</strong> Buying for Victoria</li>
            <li><strong>Queensland:</strong> QTenders</li>
            <li><strong>Western Australia:</strong> Tenders WA</li>
            <li><strong>South Australia:</strong> SA Tenders</li>
          </ul>
          <h3>Why Use Tender Intelligence?</h3>
          <p>
            Most tender search tools are basic keyword matchers. Tender Intelligence uses AI to understand your business 
            and surface opportunities you would miss with traditional search. Try it free — no credit card required.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Start Finding Tenders Today</h2>
        <p className="text-blue-100 mb-6 max-w-lg mx-auto">Free to search. Premium features from $19/month. No commitment.</p>
        <Link 
          href="/ti"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 rounded-lg font-bold text-lg hover:bg-blue-50 transition"
        >
          Try Tender Search
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>
    </div>
  );
}