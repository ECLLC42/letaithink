import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  RocketLaunchIcon, 
  CpuChipIcon, 
  CloudArrowUpIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: RocketLaunchIcon,
    title: "Lightning Fast",
    description: "Go from idea to deployed MVP in minutes, not months. Our AI agents work at superhuman speed.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: CpuChipIcon,
    title: "AI-Powered",
    description: "7 specialized AI agents coordinate to handle every aspect of your project automatically.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: CloudArrowUpIcon,
    title: "Auto-Deploy",
    description: "Automatic deployment to staging and production with health checks and rollbacks.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: ShieldCheckIcon,
    title: "Enterprise Ready",
    description: "Built-in security, cost controls, and compliance features for production use.",
    color: "from-red-500 to-orange-500"
  },
  {
    icon: ChartBarIcon,
    title: "Smart Analytics",
    description: "Real-time cost tracking, performance metrics, and optimization insights.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: CogIcon,
    title: "Seamless Integration",
    description: "Works with your existing tools: GitHub, Vercel, Render, and more.",
    color: "from-yellow-500 to-orange-500"
  }
];

const Features: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Stagger animation for features
    gsap.fromTo(featureRefs.current,
      { 
        y: 50, 
        opacity: 0,
        scale: 0.9
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const setFeatureRef = (index: number) => (el: HTMLDivElement | null) => {
    featureRefs.current[index] = el;
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="gradient-text">LetAIThink</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform combines cutting-edge technology with enterprise-grade reliability 
            to deliver results that were previously impossible.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={setFeatureRef(index)}
              className="card group hover:scale-105 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl -z-10" />
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { number: "7", label: "AI Agents" },
            { number: "10x", label: "Faster Development" },
            { number: "99.9%", label: "Uptime" },
            { number: "24/7", label: "AI Support" }
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
