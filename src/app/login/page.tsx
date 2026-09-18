"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const videos = [
  "/videos/erhORDnwJeQ.mp4",
  "/videos/HvZHXclEj-Q.mp4",
  "/videos/Kne9fiwdxpk.mp4"
];

export default function LoginPage() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleVideoEnded = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
  }, [currentVideo]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validUser = process.env.NEXT_PUBLIC_ADMIN_USER || "admin";
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "mahindra";

    if (username === validUser && password === validPass) {
      document.cookie = "is_admin=true; path=/";
      router.push("/dashboard");
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black font-sans">
      {/* Background Video Playlist */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src={videos[currentVideo]}
          onEnded={handleVideoEnded}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-[1.35] opacity-40 transition-opacity duration-1000"
        />
        {/* Dark vignette gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/80" />
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="text-white/60 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
          ← Back to Site
        </Link>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md p-10 backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl rounded-sm">
        <div className="flex justify-center mb-10">
          <img src="/logo_dark.png" alt="Mahindra Logo" className="h-[60px] w-auto object-contain drop-shadow-xl" />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center uppercase tracking-widest mb-8">
          Admin Portal
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-mahindra-red/20 border border-mahindra-red text-white text-sm text-center py-3 px-4 rounded-sm animate-pulse">
              Invalid credentials.
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              className="w-full bg-white/5 border border-white/20 text-white rounded-sm px-4 py-3 focus:outline-none focus:border-mahindra-red focus:bg-white/10 transition-all placeholder:text-gray-500 font-mono"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full bg-white/5 border border-white/20 text-white rounded-sm px-4 py-3 focus:outline-none focus:border-mahindra-red focus:bg-white/10 transition-all placeholder:text-gray-500 font-mono"
              placeholder="Enter password"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full px-6 py-4 bg-mahindra-red text-white font-bold text-sm uppercase tracking-widest hover:bg-[#cc0000] transition-colors skew-x-[-10deg] shadow-lg flex justify-center group"
            >
              <span className="block skew-x-[10deg] group-hover:scale-105 transition-transform">
                Secure Login
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
