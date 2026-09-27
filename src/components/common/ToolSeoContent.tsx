import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Lock, ChevronDown, ArrowRight } from 'lucide-react';

export interface StepItem {
  title: string;
  description: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedTool {
  title: string;
  description: string;
  path: string;
  icon?: React.ReactNode;
}

interface ToolSeoContentProps {
  toolName: string;
  howToSteps: StepItem[];
  features: FeatureItem[];
  faqs: FaqItem[];
  relatedTools: RelatedTool[];
  privacyNotes?: string;
}

export const ToolSeoContent: React.FC<ToolSeoContentProps> = ({
  toolName,
  howToSteps,
  features,
  faqs,
  relatedTools,
  privacyNotes = 'All file processing runs locally inside your web browser using WebAssembly and JavaScript. Your documents never touch an external server or cloud storage bucket.',
}) => {
  return (
    <section className="mt-14 sm:mt-20 border-t border-slate-200/80 pt-12 space-y-14 text-left">
      {/* 1. How It Works */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Quick Guide
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How to Use {toolName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Three simple steps to process your documents securely in your web browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {howToSteps.map((step, idx) => (
            <div
              key={step.title}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow relative"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                {idx + 1}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Key Features */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Why Use PrivyPDF for {toolName}?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed for privacy, speed, and ease of use on any modern device.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2"
            >
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                {feature.icon || <Zap className="w-4 h-4 text-indigo-600" />}
                <h3 className="text-slate-900 font-bold">{feature.title}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Privacy Architecture Commitment */}
      <div className="p-6 sm:p-8 rounded-3xl bg-indigo-50/50 border border-indigo-100/90 flex flex-col md:flex-row items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 shadow-sm border border-indigo-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7 text-indigo-600" />
        </div>
        <div className="space-y-1.5 text-center md:text-left flex-1">
          <h3 className="text-base font-bold text-slate-900">
            Client-Side Privacy Guarantee
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {privacyNotes}
          </p>
        </div>
        <Link
          to="/privacy"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors min-h-[40px] inline-flex items-center"
        >
          Read Privacy Policy
        </Link>
      </div>

      {/* 4. Frequently Asked Questions */}
      {faqs && faqs.length > 0 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Common questions about using {toolName} on PrivyPDF.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs open:border-indigo-300 transition-colors cursor-pointer"
              >
                <summary className="font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-between list-none">
                  <span>{faq.question}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                </summary>
                <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* 5. Related Tools */}
      {relatedTools && relatedTools.length > 0 && (
        <div className="space-y-6 border-t border-slate-200/80 pt-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Related Private PDF Tools
            </h2>
            <p className="text-xs text-slate-500">
              Discover other tools in the PrivyPDF private workspace suite.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedTools.map((tool) => (
              <Link
                key={tool.title}
                to={tool.path}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {tool.icon}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Try Tool</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
