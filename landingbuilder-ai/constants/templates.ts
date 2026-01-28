
import { Template } from '../types';

export const TEMPLATES: Template[] = [
  {
    id: 'saas-modern',
    name: 'Modern SaaS',
    category: 'Sales',
    thumbnailColor: 'bg-blue-600',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        content: `
          <section class="py-20 px-6 bg-white">
            <div class="max-w-6xl mx-auto text-center">
              <h1 class="text-5xl font-extrabold text-slate-900 mb-6">Scale your business faster than ever</h1>
              <p class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">The all-in-one platform to manage your projects, team, and clients without the headache.</p>
              <div class="flex justify-center gap-4">
                <button class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Get Started Free</button>
                <button class="px-8 py-3 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors">Watch Demo</button>
              </div>
            </div>
          </section>
        `
      },
      {
        id: 'features-1',
        type: 'features',
        content: `
          <section class="py-20 px-6 bg-slate-50">
            <div class="max-w-6xl mx-auto">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 class="text-xl font-bold mb-2">Lightning Fast</h3>
                  <p class="text-slate-600">Built for speed and performance, ensuring your team stays productive throughout the day.</p>
                </div>
                <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h3 class="text-xl font-bold mb-2">Secure by Default</h3>
                  <p class="text-slate-600">Enterprise-grade security features included in every plan to keep your data safe.</p>
                </div>
                <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h3 class="text-xl font-bold mb-2">Real-time Analytics</h3>
                  <p class="text-slate-600">Monitor your growth with powerful insights and customizable dashboards.</p>
                </div>
              </div>
            </div>
          </section>
        `
      },
      {
        id: 'cta-1',
        type: 'cta',
        content: `
          <section class="py-20 px-6 bg-blue-600 text-white text-center">
            <h2 class="text-3xl font-bold mb-4">Ready to transform your workflow?</h2>
            <p class="text-blue-100 mb-8 text-lg">Join 10,000+ teams who trust our platform.</p>
            <button class="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-colors">Start Your Trial</button>
          </section>
        `
      }
    ]
  },
  {
    id: 'agency-creative',
    name: 'Creative Agency',
    category: 'Institutional',
    thumbnailColor: 'bg-black',
    sections: [
      {
        id: 'hero-2',
        type: 'hero',
        content: `
          <section class="py-32 px-6 bg-slate-900 text-white">
            <div class="max-w-6xl mx-auto">
              <span class="text-blue-400 font-semibold tracking-widest uppercase text-sm mb-4 block">Crafting Digital Excellence</span>
              <h1 class="text-6xl font-bold leading-tight mb-8">We build brands that people love.</h1>
              <p class="text-xl text-slate-400 max-w-2xl mb-10">Independent creative studio focused on design, strategy and technology for the next generation of business.</p>
              <a href="#work" class="inline-flex items-center gap-2 text-white border-b-2 border-white pb-1 font-semibold hover:text-blue-400 hover:border-blue-400 transition-all">View our work</a>
            </div>
          </section>
        `
      },
      {
        id: 'portfolio-1',
        type: 'portfolio',
        content: `
          <section id="work" class="py-20 px-6 bg-white">
            <div class="max-w-6xl mx-auto">
              <h2 class="text-3xl font-bold mb-12">Selected Projects</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="group cursor-pointer">
                  <div class="aspect-video bg-slate-200 rounded-lg mb-4 overflow-hidden">
                    <img src="https://picsum.photos/seed/agency1/800/450" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h4 class="text-lg font-bold">Lumina E-commerce</h4>
                  <p class="text-slate-500">Brand Identity & Platform Design</p>
                </div>
                <div class="group cursor-pointer">
                  <div class="aspect-video bg-slate-200 rounded-lg mb-4 overflow-hidden">
                    <img src="https://picsum.photos/seed/agency2/800/450" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h4 class="text-lg font-bold">Aero Dashboard</h4>
                  <p class="text-slate-500">User Experience & SaaS Interface</p>
                </div>
              </div>
            </div>
          </section>
        `
      }
    ]
  }
];
