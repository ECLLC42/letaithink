import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lottie from 'lottie-react';

gsap.registerPlugin(ScrollTrigger);

interface DemoProps {
  onStartBuilding: () => void;
}

// Simple Lottie animation data (you can replace with actual animation files)
const createLottieData = (type: string) => ({
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: type,
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Shape Layer",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
});

const Demo: React.FC<DemoProps> = ({ onStartBuilding }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const demoCardRef = useRef<HTMLDivElement>(null);
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    {
      title: "AI Agent Coordination",
      description: "Watch our 7 specialized agents work together to build your MVP",
      icon: "🤖",
      animation: createLottieData("agent-coordination")
    },
    {
      title: "Real-time Progress",
      description: "Track your project's progress with live updates and metrics",
      icon: "📊",
      animation: createLottieData("progress-tracking")
    },
    {
      title: "Auto-Deployment",
      description: "See automatic deployment with health checks and rollbacks",
      icon: "🚀",
      animation: createLottieData("deployment")
    }
  ];

  useEffect(() => {
    // Animate demo card entrance
    gsap.fromTo(demoCardRef.current,
      { 
        y: 100, 
        opacity: 0,
        scale: 0.8
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
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

  const handleDemoChange = (index: number) => {
    setActiveDemo(index);
    
    // Animate the change
    gsap.to(demoCardRef.current, {
      scale: 0.95,
      duration: 0.2,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See <span className="gradient-text">LetAIThink</span> in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of development with our AI-powered platform. 
            Watch ideas transform into deployed applications in real-time.
          </p>
        </div>

        {/* Demo Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            {demos.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoChange(index)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeDemo === index
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {demo.icon} {demo.title}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Card */}
        <div 
          ref={demoCardRef}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Demo Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-2">
              {demos[activeDemo].title}
            </h3>
            <p className="text-primary-100 text-lg">
              {demos[activeDemo].description}
            </p>
          </div>

          {/* Demo Content */}
          <div className="p-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <span className="text-6xl">{demos[activeDemo].icon}</span>
              </div>
            </div>

            {/* Lottie Animation */}
            <div className="flex justify-center mb-8">
              <div className="w-64 h-64 bg-gray-50 rounded-2xl flex items-center justify-center">
                <Lottie 
                  animationData={demos[activeDemo].animation}
                  loop={true}
                  autoplay={true}
                  style={{ width: 200, height: 200 }}
                />
              </div>
            </div>

            {/* Demo Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                "Real-time Updates",
                "Interactive Controls",
                "Performance Metrics"
              ].map((feature, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full" />
                  </div>
                  <p className="font-medium text-gray-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button 
            onClick={onStartBuilding}
            className="btn-primary text-lg px-8 py-4 mr-4"
          >
            Try It Now
          </button>
          <button className="btn-secondary text-lg px-8 py-4">
            Schedule Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Demo;
