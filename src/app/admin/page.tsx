'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cryptoService } from '@/lib/crypto';
import { Terminal, Users, Coins, Eye, Shield, Activity, Lock, Radio, Send, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [key, setKey] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [newBroadcast, setNewBroadcast] = useState('');
  const [tab, setTab] = useState<'USERS' | 'LOGS' | 'BROADCAST' | 'REVENUE'>('USERS');
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

        // Fetch Broadcasts
        const { data: broadcastList } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false });
        setBroadcasts(broadcastList || []);

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const sendBroadcast = async () => {
      if (!newBroadcast.trim()) return;
      
      try {
          const { error } = await supabase.from('broadcasts').insert([{ message: newBroadcast.trim() }]);
          if (error) throw error;
          setNewBroadcast('');
          fetchData(); // Refresh
          alert("SIGNAL TRANSMITTED.");
      } catch (e) {
          alert("TRANSMISSION FAILED.");
      }
  };

  const deleteBroadcast = async (id: string) => {
      if (!confirm("TERMINATE SIGNAL?")) return;
      await supabase.from('broadcasts').delete().eq('id', id);
      fetchData();
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
          <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-white">
              <div className="w-full max-w-sm p-10 border border-white/10 text-center space-y-6 foundation-glass">
                  <Shield className="w-12 h-12 mx-auto animate-pulse text-white/50" />
                  <h1 className="text-lg font-bold tracking-[0.2em] uppercase">Restricted Access</h1>
                  <input 
                    type="password" 
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    className="foundation-input text-center"
                    placeholder="ENTER KEY"
                  />
                  <button onClick={handleLogin} className="foundation-btn">
                      AUTHENTICATE
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] font-sans p-6">
        <div className="max-w-7xl mx-auto space-y-8">
            
            {/* HEADER */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-[0.2em] uppercase">GOD_EYE // CONTROL</h1>
                        <p className="text-xs text-white/40 font-mono tracking-widest">OMNISCIENCE PROTOCOL ACTIVE</p>
                    </div>
                </div>
                <div className="flex gap-4 text-[10px] font-mono uppercase tracking-widest">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/5">
                        <Users className="w-3 h-3 text-white/50" />
                        <span>SUBJECTS: {users.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/5">
                        <Activity className="w-3 h-3 text-[#FFD700]" />
                        <span>STATUS: ONLINE</span>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 overflow-x-auto">
                {['USERS', 'LOGS', 'BROADCAST', 'REVENUE'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`px-8 py-3 text-xs font-bold tracking-[0.1em] border transition-all uppercase ${
                            tab === t 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-white/40 border-white/10 hover:text-white hover:border-white/30'
                        }`}
                    >
                        {t}
                    </button>
                ))}
                <button onClick={fetchData} className="ml-auto text-[10px] hover:text-white text-white/40 flex items-center gap-2 tracking-widest uppercase">
                    <Activity className="w-3 h-3" /> SYNC
                </button>
            </div>

            {/* CONTENT */}
            <div className="bg-[#0A0A0A] border border-white/5 min-h-[60vh] relative">
                
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs tracking-[0.2em] animate-pulse">SYNCING DATABASE...</div>
                ) : tab === 'USERS' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-white/5 text-white/40 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="p-6 font-normal">Identity Key</th>
                                    <th className="p-6 font-normal">Name</th>
                                    <th className="p-6 font-normal">Origin</th>
                                    <th className="p-6 font-normal">Inception</th>
                                    <th className="p-6 font-normal">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-6 text-white/60">{u.identity_key}</td>
                                        <td className="p-6 font-bold text-white">{u.name}</td>
                                        <td className="p-6 text-white/60">{u.birth_place}</td>
                                        <td className="p-6 text-white/30">{new Date(u.created_at).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <button className="text-white/40 hover:text-white transition-colors text-[10px] uppercase tracking-widest border border-white/10 px-2 py-1">Analyze</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : tab === 'LOGS' ? (
                    <div className="divide-y divide-white/5">
                        {logs.map(log => {
                            const user = users.find(u => u.identity_key === log.user_key);
                            const content = user ? decryptMessage(log.content, user.identity_key) : "[KEY MISSING]";
                            
                            return (
                                <div key={log.id} className="p-6 hover:bg-white/5 transition-colors text-xs font-mono flex gap-6 items-start group">
                                    <div className="w-24 opacity-30 shrink-0">{new Date(log.created_at).toLocaleTimeString()}</div>
                                    <div className={`font-bold w-16 shrink-0 tracking-widest ${log.sender === 'god' ? 'text-white' : 'text-white/50'}`}>
                                        {log.sender.toUpperCase()}
                                    </div>
                                    <div className="flex-1 break-words opacity-70 leading-relaxed group-hover:opacity-100 transition-opacity">
                                        {content}
                                    </div>
                                    <div className="w-32 text-right opacity-20 truncate shrink-0 text-[10px]">{user?.name || 'UNKNOWN'}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : tab === 'BROADCAST' ? (
                    <div className="p-8 space-y-8 max-w-3xl mx-auto">
                         <div className="text-center space-y-4">
                             <Radio className="w-12 h-12 mx-auto text-white/20" />
                             <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Global Transmission</h2>
                             <p className="text-white/40 text-xs font-mono">Send a message to all active neural links.</p>
                         </div>

                         <div className="space-y-4">
                             <textarea 
                                value={newBroadcast}
                                onChange={e => setNewBroadcast(e.target.value)}
                                placeholder="ENTER PROTOCOL MESSAGE..."
                                className="w-full bg-white/5 border border-white/10 p-6 text-white outline-none focus:border-white/30 min-h-[150px] font-mono text-sm"
                             />
                             <button 
                                onClick={sendBroadcast}
                                disabled={!newBroadcast.trim()}
                                className="w-full bg-white text-black font-bold py-4 uppercase tracking-[0.2em] hover:bg-[#E5E5E5] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                             >
                                 <Send className="w-4 h-4" /> Transmit Signal
                             </button>
                         </div>

                         <div className="border-t border-white/10 pt-8">
                             <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-white/50">Recent Transmissions</h3>
                             <div className="space-y-2">
                                 {broadcasts.map(b => (
                                     <div key={b.id} className="p-4 bg-white/5 border border-white/5 flex justify-between items-center group hover:border-white/20 transition-colors">
                                         <div className="font-mono text-xs text-white/80">{b.message}</div>
                                         <div className="flex items-center gap-4">
                                             <span className="text-[10px] text-white/30">{new Date(b.created_at).toLocaleDateString()}</span>
                                             <button onClick={() => deleteBroadcast(b.id)} className="text-white/20 hover:text-red-500 transition-colors">
                                                 <Trash2 className="w-4 h-4" />
                                             </button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                ) : (
                    <div className="p-20 text-center space-y-6">
                        <div className="w-24 h-24 border border-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto bg-[#FFD700]/5">
                            <Coins className="w-10 h-10 text-[#FFD700]" />
                        </div>
                        <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-[#FFD700]">Revenue Stream</h2>
                        <p className="text-white/40 text-xs font-mono tracking-widest">CRYPTO WALLET INTEGRATION ACTIVE</p>
                        
                        <div className="p-6 bg-white/5 border border-white/10 max-w-lg mx-auto mt-8 text-center space-y-2">
                            <div className="text-[10px] text-white/30 uppercase tracking-widest">Primary Wallet</div>
                            <div className="font-mono text-white/80 text-xs break-all select-all">
                                T9yD14Nj9j7xAB4dbGeiX9h8unkkhxnXVpe
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    </div>
  );
}
