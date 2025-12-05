'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cryptoService } from '@/lib/crypto';
import { Terminal, Users, Coins, Eye, Shield, Activity, Lock } from 'lucide-react';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [key, setKey] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<'USERS' | 'LOGS' | 'REVENUE'>('USERS');
  const [loading, setLoading] = useState(false);

  // Simple hardcoded auth for now (Replace with Env Var in production)
  const ADMIN_KEY = "GOD_MODE_ACTIVATE_999"; 

  const handleLogin = () => {
    if (key === ADMIN_KEY) {
      setAuthorized(true);
      fetchData();
    } else {
      alert("ACCESS DENIED");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
        // Fetch Users
        const { data: userList } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        setUsers(userList || []);

        // Fetch Recent Logs
        const { data: logList } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50);
        setLogs(logList || []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const decryptMessage = (content: string, userKey: string) => {
      try {
          return cryptoService.decrypt(content, userKey);
      } catch (e) {
          return "[ENCRYPTED DATA CORRUPTED]";
      }
  };

  if (!authorized) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center font-mono text-[#00FF41]">
              <div className="w-full max-w-sm p-8 border border-[#00FF41] rounded-xl text-center space-y-4">
                  <Shield className="w-12 h-12 mx-auto animate-pulse" />
                  <h1 className="text-xl font-bold">SYSTEM RESTRICTED</h1>
                  <input 
                    type="password" 
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    className="w-full bg-black border border-[#00FF41]/50 p-2 text-center outline-none focus:border-[#00FF41]"
                    placeholder="ENTER ADMIN KEY"
                  />
                  <button onClick={handleLogin} className="w-full bg-[#00FF41] text-black font-bold py-2 hover:bg-white">
                      AUTHENTICATE
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] font-mono p-6">
        <div className="max-w-7xl mx-auto space-y-8">
            
            {/* HEADER */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00FF41]/10 rounded flex items-center justify-center border border-[#00FF41]">
                        <Eye className="w-6 h-6 text-[#00FF41]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">GOD_MODE // DASHBOARD</h1>
                        <p className="text-xs text-[#86868B]">Omniscience Protocol Active</p>
                    </div>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#1C1C1E] rounded border border-white/5">
                        <Users className="w-3 h-3 text-[#00FF41]" />
                        <span>TOTAL USERS: {users.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#1C1C1E] rounded border border-white/5">
                        <Activity className="w-3 h-3 text-yellow-500" />
                        <span>SYSTEM: ONLINE</span>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-4">
                {['USERS', 'LOGS', 'REVENUE'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-6 py-2 text-sm font-bold border transition-all ${tab === t ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'bg-transparent text-[#86868B] border-white/10 hover:text-white'}`}
                    >
                        {t}
                    </button>
                ))}
                <button onClick={fetchData} className="ml-auto text-xs hover:text-[#00FF41] flex items-center gap-1">
                    REFRESH DATA
                </button>
            </div>

            {/* CONTENT */}
            <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                
                {loading ? (
                    <div className="p-12 text-center text-[#00FF41] animate-pulse">FETCHING DATA...</div>
                ) : tab === 'USERS' ? (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#1C1C1E] text-[#86868B] uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Identity Key</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-[#00FF41]">{u.identity_key}</td>
                                    <td className="p-4">{u.name}</td>
                                    <td className="p-4">{u.birth_place}</td>
                                    <td className="p-4 opacity-50">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button className="text-[#00FF41] hover:underline">VIEW CHART</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : tab === 'LOGS' ? (
                    <div className="divide-y divide-white/5">
                        {logs.map(log => {
                            // Find user to get key for decryption
                            const user = users.find(u => u.identity_key === log.user_key);
                            const content = user ? decryptMessage(log.content, user.identity_key) : "[KEY MISSING]";
                            
                            return (
                                <div key={log.id} className="p-4 hover:bg-white/5 transition-colors text-xs font-mono flex gap-4">
                                    <div className="w-24 opacity-50">{new Date(log.created_at).toLocaleTimeString()}</div>
                                    <div className={`font-bold w-16 ${log.sender === 'god' ? 'text-[#00FF41]' : 'text-blue-400'}`}>
                                        {log.sender.toUpperCase()}
                                    </div>
                                    <div className="flex-1 break-all opacity-80">
                                        {content}
                                    </div>
                                    <div className="w-32 text-right opacity-30 truncate">{log.user_key}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center space-y-4">
                        <Coins className="w-16 h-16 mx-auto text-yellow-500" />
                        <h2 className="text-2xl font-bold">REVENUE STREAM</h2>
                        <p className="opacity-50">Crypto Wallet Integration Pending...</p>
                        <div className="p-4 bg-[#1C1C1E] rounded border border-white/10 max-w-md mx-auto font-mono text-[#00FF41]">
                            WALLET: T9yD14Nj9j7xAB4dbGeiX9h8unkkhxnXVpe
                        </div>
                    </div>
                )}
            </div>

        </div>
    </div>
  );
}

