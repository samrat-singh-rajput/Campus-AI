import React from 'react';
import { Star, Quote, Award, Building2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Alex Rivera (Demo Persona)',
      university: 'Computer Science Graduate',
      degree: 'B.S. Software Engineering',
      company: 'Goal: Backend Development',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      comment: 'CampusMate AI raised my sample resume ATS keyword score from 62% to 94%. The AI mock interview coach provided instant feedback on my technical answer structure.',
      rating: 5
    },
    {
      name: 'Sophia Chen (Demo Persona)',
      university: 'AI & Data Science Student',
      degree: 'M.S. Artificial Intelligence',
      company: 'Goal: Machine Learning Engineer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      comment: 'The Random Forest job matcher highlighted exact missing technical skills for AI roles, and the LangGraph agent assisted with tailoring project descriptions.',
      rating: 5
    },
    {
      name: 'Jordan Lee (Demo Persona)',
      university: 'Information Systems Senior',
      degree: 'B.S. Information Systems',
      company: 'Goal: Full Stack Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      comment: 'The visual Kanban Application Tracker organized all my job applications into clean drag-and-drop columns. The fast backend and clear dashboard make career prep seamless.',
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-24 relative bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Interactive Demo Scenarios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Designed for <span className="gradient-text">Student Career Growth</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Sample user feedback scenarios illustrating how CampusMate AI assists job seekers in placement drives (Demo Examples).
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="glass-card rounded-3xl p-8 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 relative group glow-border flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-slate-800 group-hover:text-indigo-500/30 transition-colors" />
                </div>

                {/* Comment Text */}
                <p className="text-sm text-slate-300 leading-relaxed italic mb-8 font-normal">
                  "{review.comment}"
                </p>
              </div>

              {/* Student Bio */}
              <div className="pt-6 border-t border-slate-800/80 flex items-center space-x-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                />
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {review.name}
                  </h4>
                  <p className="text-xs text-slate-400">{review.university} • {review.degree}</p>
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{review.company}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
