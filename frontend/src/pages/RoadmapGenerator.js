import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../App';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const RoadmapGenerator = ({ currentUser, logoutUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    skill_level: currentUser?.skill_level || 'beginner',
    duration_weeks: 12,
    focus_topics: [],
    time_per_day: '1-2 hours',
  });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);

  useEffect(() => { if (!currentUser) navigate('/'); }, [currentUser, navigate]);
  if (!currentUser) return null;

  const topicOptions = ['arrays','strings','linked-lists','trees','graphs','dynamic-programming','binary-search','backtracking','greedy','sorting','hashing'];
  const toggleTopic = (t) => setFormData(prev => ({ ...prev, focus_topics: prev.focus_topics.includes(t) ? prev.focus_topics.filter(x=>x!==t) : [...prev.focus_topics, t] }));

  const handleGenerate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.post('/generate-roadmap', {
        user_id: currentUser.id,
        skill_level: formData.skill_level,
        duration_weeks: parseInt(formData.duration_weeks),
        focus_topics: formData.focus_topics.length > 0 ? formData.focus_topics : null,
        time_per_day: formData.time_per_day,
      });
      setGenerated(res.data);
      toast.success('Roadmap generated!');
    } catch(err) { toast.error(err.response?.data?.detail || 'Failed to generate'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width:'100%', background:'#080c12', border:'1px solid rgba(48,54,61,0.8)', borderRadius:'8px', padding:'10px 14px', color:'#e6edf3', fontFamily:"'JetBrains Mono',monospace", fontSize:'13px', outline:'none', transition:'border-color 0.2s' };
  const selectStyle = { ...inputStyle, cursor:'pointer' };
  const labelStyle = { fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#00ff88', letterSpacing:'0.1em', display:'block', marginBottom:'8px' };

  return (
    <div style={{ minHeight:'100vh', background:'#030508', fontFamily:"'Syne',sans-serif" }}>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(0,255,136,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.018) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <Navbar currentUser={currentUser} logoutUser={logoutUser}/>

        <div style={{ maxWidth:'720px', margin:'0 auto', padding:'40px 24px' }} data-testid="roadmap-generator-container">

          {/* Header */}
          <div style={{ marginBottom:'36px', opacity:0, animation:'fadeIn 0.5s ease forwards' }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#00ff88', letterSpacing:'0.15em', marginBottom:'8px' }}>// AI_ROADMAP_GENERATOR</p>
            <h1 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, color:'#e6edf3', letterSpacing:'-0.02em' }}>
              Generate Your <span style={{ background:'linear-gradient(135deg,#00ff88,#00d4ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI Roadmap</span>
            </h1>
            <p style={{ color:'#8b949e', marginTop:'8px', fontSize:'14px' }}>Personalized DSA path crafted by GPT-4o for your goals</p>
          </div>

          {!generated ? (
            <div style={{ background:'#0d1117', border:'1px solid rgba(48,54,61,0.8)', borderRadius:'20px', padding:'36px', opacity:0, animation:'fadeInUp 0.5s ease forwards 0.2s', position:'relative', overflow:'hidden' }} data-testid="roadmap-form">
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#00ff88,#00d4ff,transparent)', opacity:0.5 }}/>

              <form onSubmit={handleGenerate} style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

                {/* Skill Level */}
                <div>
                  <label style={labelStyle}>$ skill_level</label>
                  <select value={formData.skill_level} onChange={e => setFormData({...formData, skill_level:e.target.value})} style={selectStyle} data-testid="skill-level-select"
                    onFocus={e => e.target.style.borderColor='rgba(0,255,136,0.4)'} onBlur={e => e.target.style.borderColor='rgba(48,54,61,0.8)'}>
                    <option value="beginner">beginner — just getting started</option>
                    <option value="intermediate">intermediate — some DSA knowledge</option>
                    <option value="advanced">advanced — strong foundation</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label style={labelStyle}>$ duration_weeks <span style={{ color:'#484f58' }}>(4–52)</span></label>
                  <input type="number" min="4" max="52" value={formData.duration_weeks}
                    onChange={e => setFormData({...formData, duration_weeks:e.target.value})}
                    style={inputStyle} data-testid="duration-input"
                    onFocus={e => e.target.style.borderColor='rgba(0,255,136,0.4)'}
                    onBlur={e => e.target.style.borderColor='rgba(48,54,61,0.8)'}/>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'10px', color:'#484f58', marginTop:'6px' }}>// recommended: 8–16 weeks</p>
                </div>

                {/* Time per day */}
                <div>
                  <label style={labelStyle}>$ daily_time_commitment</label>
                  <select value={formData.time_per_day} onChange={e => setFormData({...formData, time_per_day:e.target.value})} style={selectStyle} data-testid="time-per-day-select"
                    onFocus={e => e.target.style.borderColor='rgba(0,255,136,0.4)'} onBlur={e => e.target.style.borderColor='rgba(48,54,61,0.8)'}>
                    {['30 minutes','1-2 hours','2-3 hours','3+ hours'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Topics */}
                <div>
                  <label style={labelStyle}>$ focus_topics <span style={{ color:'#484f58' }}>(optional)</span></label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {topicOptions.map(t => (
                      <button key={t} type="button" onClick={() => toggleTopic(t)} data-testid={`topic-badge-${t}`}
                        style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', fontWeight:600, letterSpacing:'0.06em', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', transition:'all 0.15s',
                          background: formData.focus_topics.includes(t) ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.03)',
                          border: formData.focus_topics.includes(t) ? '1px solid rgba(0,255,136,0.4)' : '1px solid rgba(48,54,61,0.8)',
                          color: formData.focus_topics.includes(t) ? '#00ff88' : '#8b949e',
                        }}>
                        {formData.focus_topics.includes(t) ? '✓ ' : ''}{t.replace(/-/g,'_')}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} data-testid="generate-roadmap-submit-btn"
                  style={{ background: loading ? 'rgba(0,255,136,0.3)' : 'linear-gradient(135deg,#00ff88,#00d4ff)', border:'none', borderRadius:'10px', padding:'14px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'14px', color:'#030508', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing:'0.06em', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'all 0.2s', boxShadow: loading ? 'none' : '0 0 25px rgba(0,255,136,0.25)' }}>
                  {loading ? <><Loader2 size={16} style={{ animation:'spin 0.8s linear infinite' }}/> GENERATING_ROADMAP...</> : <><Sparkles size={16}/> GENERATE_ROADMAP →</>}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'20px', opacity:0, animation:'fadeInUp 0.5s ease forwards' }} data-testid="generated-roadmap">
              {/* Success */}
              <div style={{ background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.25)', borderRadius:'14px', padding:'20px 24px', display:'flex', alignItems:'center', gap:'14px' }}>
                <CheckCircle size={24} color="#00ff88"/>
                <div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'14px', color:'#00ff88' }}>ROADMAP_GENERATED ✓</div>
                  <div style={{ color:'#8b949e', fontSize:'13px', marginTop:'2px' }}>Your personalized learning path is ready</div>
                </div>
              </div>

              {/* Roadmap card */}
              <div style={{ background:'#0d1117', border:'1px solid rgba(48,54,61,0.8)', borderRadius:'20px', padding:'32px', position:'relative', overflow:'hidden' }} data-testid="roadmap-details">
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#00ff88,#00d4ff,transparent)', opacity:0.5 }}/>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'22px', color:'#e6edf3', marginBottom:'8px' }}>{generated.title}</h2>
                <p style={{ color:'#8b949e', fontSize:'14px', marginBottom:'16px', lineHeight:1.6 }}>{generated.description}</p>
                <div style={{ display:'flex', gap:'8px', marginBottom:'28px' }}>
                  {[generated.skill_level, `${generated.duration_weeks} weeks`].map(tag => (
                    <span key={tag} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#00ff88', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'4px', padding:'3px 10px', letterSpacing:'0.06em' }}>{tag}</span>
                  ))}
                </div>

                {generated.topics?.weekly_plan && (
                  <div>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#484f58', letterSpacing:'0.1em', marginBottom:'14px' }}>// WEEKLY_BREAKDOWN (preview)</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      {generated.topics.weekly_plan.slice(0,3).map(week => (
                        <div key={week.week} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(48,54,61,0.6)', borderRadius:'10px', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', color:'#00ff88', fontWeight:700 }}>Week {week.week}</span>
                            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#8b949e', marginLeft:'12px' }}>{week.topics?.join(', ')}</span>
                          </div>
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'10px', color:'#484f58', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(48,54,61,0.8)', borderRadius:'4px', padding:'2px 8px' }}>{week.problem_count||5} problems</span>
                        </div>
                      ))}
                      {generated.topics.weekly_plan.length > 3 && (
                        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#484f58', textAlign:'center', padding:'8px' }}>...and {generated.topics.weekly_plan.length - 3} more weeks</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:'12px' }}>
                <button onClick={() => navigate(`/roadmap/${generated.id}`)} data-testid="view-full-roadmap-btn"
                  style={{ flex:1, background:'linear-gradient(135deg,#00ff88,#00d4ff)', border:'none', borderRadius:'10px', padding:'13px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'13px', color:'#030508', cursor:'pointer', letterSpacing:'0.06em', boxShadow:'0 0 20px rgba(0,255,136,0.2)' }}>
                  VIEW_FULL_ROADMAP →
                </button>
                <button onClick={() => { setGenerated(null); setFormData({ skill_level: currentUser?.skill_level||'beginner', duration_weeks:12, focus_topics:[], time_per_day:'1-2 hours' }); }} data-testid="generate-another-btn"
                  style={{ flex:1, background:'transparent', border:'1px solid rgba(48,54,61,0.8)', borderRadius:'10px', padding:'13px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'13px', color:'#8b949e', cursor:'pointer', letterSpacing:'0.06em' }}>
                  GENERATE_ANOTHER
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};
export default RoadmapGenerator;