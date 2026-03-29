

import { Navbar } from '@/components/landing';
import FeatureDetailView from '@/components/pages/feature-detail-view';

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-20">
              <Navbar />
        
      <div className="max-w-7xl mx-auto px-4">
        {/* Simple Header */}
        <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-white mb-4">Product Roadmap & Detail</h1>
            <p className="text-slate-400">Deep dive into The Clouds Academy system architecture and feature presence.</p>
        </div>
        
        {/* Full Detail Component */}
        <FeatureDetailView />
        
        {/* Footer Note */}
        <div className="mt-12 text-center text-slate-500 text-sm">
            Analysis based on Frontend/src/app structure. Last audit: March 2026.
        </div>
      </div>
    </main>
  );
}