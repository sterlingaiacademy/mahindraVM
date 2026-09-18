"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PhoneCall, Bot, BarChart3, Globe, Database, CalendarCheck, FileAudio, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";

const liveCallVariants = [
  '"I would like to book a test drive."',
  '"What are the EMI options for Scorpio-N?"',
  '"Is my XUV700 ready for service pickup?"',
  '"Can I reschedule my appointment to Friday?"'
];

const crmVariants = [
  { lead: "Rahul Menon", status: "Test Drive Booked" },
  { lead: "Anjali Nair", status: "Finance Enquiry Logged" },
  { lead: "Priya Sharma", status: "Service Confirmed" },
  { lead: "Vikram Reddy", status: "Rescheduled (Fri)" }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVariantIndex((prev) => (prev + 1) % liveCallVariants.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yHero = useTransform(scrollYProgress, [0, 0.2], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-mahindra-red selection:text-white transition-colors duration-300" ref={containerRef}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 transition-all duration-300 pointer-events-none ${
        scrolled ? 'py-4 bg-white/95 dark:bg-mahindra-black/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-white/10' : 'py-6 bg-transparent'
      }`}>
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Always white when at top. When scrolled, hide in light mode, show in dark mode */}
          <img src="/logo_dark.png" alt="Mahindra Logo" className={`h-[60px] md:h-[70px] w-auto object-contain transition-all drop-shadow-md ${scrolled ? 'hidden dark:block' : 'block'}`} />
          {/* Only show when scrolled AND in light mode */}
          <img src="/logo_transparent.png" alt="Mahindra Logo" className={`h-[60px] md:h-[70px] w-auto object-contain transition-all ${scrolled ? 'block dark:hidden' : 'hidden'}`} />
        </div>
        <div className={`flex gap-6 items-center pointer-events-auto transition-colors ${
          scrolled ? 'text-gray-900 dark:text-white' : 'text-white drop-shadow-md'
        }`}>
          <Link href="#features" className={`text-sm font-bold transition-colors uppercase tracking-widest hidden md:block ${
            scrolled ? 'hover:text-mahindra-red' : 'hover:text-gray-300'
          }`}>Features</Link>
          <Link href="#call-flow" className={`text-sm font-bold transition-colors uppercase tracking-widest hidden md:block ${
            scrolled ? 'hover:text-mahindra-red' : 'hover:text-gray-300'
          }`}>Call Flow</Link>
          
          <ThemeToggle />
          
          <Link href="/login" className="px-6 py-2 bg-mahindra-red text-white font-bold text-sm uppercase tracking-widest hover:bg-mahindra-red-dark transition-colors skew-x-[-10deg] shadow-lg border border-transparent">
            <span className="block skew-x-[10deg]">Admin Login</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="absolute inset-0 z-0 bg-black"
        >
          <VideoBackground videoId="erhORDnwJeQ" opacity="opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-mahindra-dark/80 z-10" />
        </motion.div>

        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6 text-white drop-shadow-lg">
              24/7 Intelligent <br/>
              <span className="text-mahindra-red">Voice Receptionist</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light drop-shadow-md">
              Never miss a customer call, never lose a potential lead, and provide consistent customer service around the clock for your dealership.
            </p>
            <Link 
              href="#features" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-mahindra-black font-bold uppercase tracking-widest hover:bg-mahindra-red hover:text-white transition-colors skew-x-[-10deg] shadow-2xl group"
            >
              <span className="block skew-x-[10deg]">Explore Capabilities</span>
              <ArrowRight className="w-5 h-5 skew-x-[10deg] group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center opacity-70">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white mb-4">Scroll to explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-white to-mahindra-red" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-mahindra-dark relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<PhoneCall className="w-8 h-8 text-mahindra-red" />}
              title="24/7 Inbound Reception"
              description="Welcome customers professionally, answer FAQs, handle appointments, and transfer complex queries 24/7."
            />
            <FeatureCard 
              icon={<Bot className="w-8 h-8 text-mahindra-red" />}
              title="Outbound AI Calling"
              description="Automate lead follow-ups, appointment reminders, promotional campaigns, and customer feedback calls."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-mahindra-red" />}
              title="Multilingual Support"
              description="Communicate naturally in Malayalam, English, Hindi, Tamil, and other regional languages."
            />
            <FeatureCard 
              icon={<Database className="w-8 h-8 text-mahindra-red" />}
              title="CRM Integration"
              description="Automatically capture leads, update customer details, and record call outcomes directly to your database."
            />
            <FeatureCard 
              icon={<CalendarCheck className="w-8 h-8 text-mahindra-red" />}
              title="Booking Management"
              description="Assist customers with new service appointments, test drive bookings, rescheduling, and cancellations."
            />
            <FeatureCard 
              icon={<FileAudio className="w-8 h-8 text-mahindra-red" />}
              title="Call Summaries & Storage"
              description="Generate automated call summaries for rapid review and store audio recordings for quality assurance."
            />
          </div>
        </div>
      </section>

      {/* Deep Dive Section - With Second YouTube Video */}
      <section className="py-24 bg-white dark:bg-mahindra-black relative z-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-6">Never Miss A <span className="text-mahindra-red">Lead</span></h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
              Unlike a traditional reception desk, the AI Voice Agent remains available beyond normal working hours. A customer calling at 10:30 PM doesn't hear a closed message—they continue the conversation, get answers, and their enquiry is captured for your sales team.
            </p>
            <ul className="space-y-4 mb-10">
              {["Immediate Response to Every Call", "Reduced Repetitive Workload", "Consistent Information Delivery", "Seamless Human Escalation"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-mahindra-red" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[550px] w-full"
          >
             {/* The Video Card */}
             <div className="absolute inset-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
               <VideoBackground videoId="HvZHXclEj-Q" opacity="opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-tr from-mahindra-red/30 via-black/40 to-transparent z-10" />
             </div>
             
             {/* Floating UI Element 1 */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute -left-6 md:-left-10 top-1/4 bg-white dark:bg-mahindra-dark border border-gray-100 dark:border-white/10 p-5 rounded-xl shadow-xl z-20 w-64 md:w-72"
             >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs uppercase font-bold text-gray-400">Live Call</span>
                </div>
                <div className="h-10 flex items-center">
                  <motion.p 
                    key={`live-${variantIndex}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed"
                  >
                    {liveCallVariants[variantIndex]}
                  </motion.p>
                </div>
             </motion.div>

             {/* Floating UI Element 2 */}
             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
               className="absolute -right-6 md:-right-10 bottom-1/4 bg-mahindra-red p-5 rounded-xl shadow-xl z-20 w-56 text-white"
             >
                <div className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-80">CRM Updated</div>
                <motion.div
                  key={`crm-${variantIndex}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="font-bold text-lg line-clamp-1">Lead: {crmVariants[variantIndex].lead}</div>
                  <div className="text-xs mt-1 opacity-90 line-clamp-1">Status: {crmVariants[variantIndex].status}</div>
                </motion.div>
             </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Proposed Call Flow */}
      <section id="call-flow" className="py-32 bg-gray-50 dark:bg-mahindra-dark relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">Proposed <span className="text-mahindra-red">Call Flow</span></h2>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/5 p-8 relative shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mahindra-red to-transparent" />
            <h3 className="text-2xl font-bold uppercase tracking-widest mb-10 text-center text-mahindra-red">Inbound</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-mahindra-red before:via-mahindra-red/50 before:to-transparent">
              <FlowStep title="Customer Calls" />
              <FlowStep title="AI Answers Immediately" />
              <FlowStep title="Understands Requirement" />
              <FlowStep title="Answers FAQ / Info" />
              <FlowStep title="Captures Details" />
              <FlowStep title="CRM Updated" />
              <FlowStep title="Call Summary & Recording" isLast />
            </div>
          </div>
          
          <div className="bg-white dark:bg-mahindra-black border border-gray-200 dark:border-white/5 p-8 relative shadow-sm">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mahindra-red to-transparent" />
             <h3 className="text-2xl font-bold uppercase tracking-widest mb-10 text-center text-mahindra-red">Outbound</h3>
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-mahindra-red before:via-mahindra-red/50 before:to-transparent">
               <FlowStep title="Lead Database / CRM" />
               <FlowStep title="AI Initiates Call" />
               <FlowStep title="Conversational Interaction" />
               <FlowStep title="Lead Qualification / Reminder" />
               <FlowStep title="Customer Response Captured" />
               <FlowStep title="CRM Updated" />
               <FlowStep title="Follow-up Scheduled" isLast />
             </div>
          </div>
        </div>
      </section>

      {/* CTA Footer - With Third YouTube Video */}
      <footer className="py-32 bg-black border-t border-white/10 text-center relative overflow-hidden">
        <VideoBackground videoId="Kne9fiwdxpk" opacity="opacity-40" />
        <div className="absolute inset-0 bg-mahindra-black/60 z-10" />
        <div className="relative z-20 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-6 text-white drop-shadow-md">Experience the AI Voice Agent</h2>
          <p className="text-gray-300 text-lg mb-10 drop-shadow-md">Access the admin dashboard to monitor live calls, view analytics, and trigger outbound interactions.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-10 py-5 bg-mahindra-red text-white font-bold text-lg uppercase tracking-widest hover:bg-mahindra-red-dark transition-colors skew-x-[-10deg] shadow-2xl">
            <span className="block skew-x-[10deg]">Enter Dashboard</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white dark:bg-mahindra-black p-8 border border-gray-200 dark:border-white/5 hover:border-mahindra-red/30 transition-colors group relative overflow-hidden"
    >
      <div className="mb-6 bg-gray-100 dark:bg-white/5 w-16 h-16 flex items-center justify-center group-hover:bg-mahindra-red/10 transition-colors relative z-10">
        {icon}
      </div>
      <h4 className="text-xl font-bold uppercase tracking-wide mb-3 relative z-10">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm relative z-10">{description}</p>
    </motion.div>
  );
}

function FlowStep({ title, isLast = false }: { title: string, isLast?: boolean }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active z-10">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-100 dark:border-mahindra-black bg-mahindra-red text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-20" />
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-mahindra-dark p-4 border border-gray-200 dark:border-white/5 group-hover:border-mahindra-red/50 transition-colors">
        <h4 className="font-bold text-sm uppercase tracking-wide text-gray-800 dark:text-gray-200">{title}</h4>
      </div>
    </div>
  );
}

function VideoBackground({ videoId, opacity = "opacity-60", scale = "scale-[1.35]" }: { videoId: string, opacity?: string, scale?: string }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover ${opacity} ${scale}`}
      >
        <source src={`/videos/${videoId}.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}
