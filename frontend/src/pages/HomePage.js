import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WarpShaderBackground } from '@/components/ui/wrap-shader';
import { api } from '../App';
import { toast } from 'sonner';

const HomePage = ({ currentUser, loginUser }) => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ username:'', email:'', skill_level:'beginner' });
  const [loading, setLoading] = useState(false);

  if (currentUser) { navigate('/dashboard'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isLogin) {
        const res = await api.get('/users');
        const user = res.data.find(u => u.username === formData.username);
        if (user) { loginUser(user); toast.success('Welcome back!'); navigate('/dashboard'); }
        else toast.error('User not found. Sign up first.');
      } else {
        const res = await api.post('/users', formData);
        loginUser(res.data); toast.success('Account created!'); navigate('/dashboard');
      }
    } catch(err) { toast.error(err.response?.data?.detail || 'Auth failed'); }
    finally { setLoading(false); }
  };

  const features = [
    { icon: '⚡', title: 'AI Roadmaps', desc: 'GPT-4o generated personalized learning paths based on your level', color: '#c0c0c0' },
    { icon: '🎯', title: 'Structured Path', desc: 'Week-by-week curriculum designed to build skills progressively', color: '#e8e8e8' },
    { icon: '📈', title: 'Track Progress', desc: 'Real-time analytics dashboard with completion stats', color: '#a0a0a0' },
    { icon: '🔥', title: '24+ Problems', desc: 'Hand-picked problems from Easy to Hard across all topics', color: '#d0d0d0' },
  ];

  const topics = ['Arrays', 'Trees', 'DP', 'Graphs', 'Binary Search', 'Backtracking', 'Greedy', 'Hashing'];

  return (
    <div style={{ minHeight:'100vh', background:'#030508', fontFamily:"'Syne',sans-serif", position:'relative', overflow:'hidden' }}>

      {/* Warp shader hero background (black & silver) */}
      <WarpShaderBackground />

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Navbar */}
        <nav style={{ borderBottom:'1px solid rgba(192,192,192,0.15)', padding:'0 32px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'34px', height:'34px', background:'linear-gradient(135deg,#c0c0c0,#ffffff)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'JetBrains Mono',monospace", fontWeight:900, fontSize:'13px', color:'#030508', boxShadow:'0 0 15px rgba(192,192,192,0.4)' }}>{'</>'}</div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'15px', background:'linear-gradient(135deg,#c0c0c0,#ffffff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>DSA_FORGE</span>
          </div>
          <button onClick={() => setShowAuth(true)} data-testid="nav-get-started-btn"
            style={{ background:'linear-gradient(135deg,#c0c0c0,#ffffff)', border:'none', borderRadius:'8px', padding:'9px 20px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'12px', color:'#030508', cursor:'pointer', letterSpacing:'0.04em' }}>
            GET_STARTED →
          </button>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth:'1100px', margin:'0 auto', padding:'100px 24px 80px', textAlign:'center' }} data-testid="hero-section">
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(192,192,192,0.08)', border:'1px solid rgba(192,192,192,0.25)', borderRadius:'50px', padding:'6px 16px', marginBottom:'32px' }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#c0c0c0', display:'inline-block', boxShadow:'0 0 8px #c0c0c0', animation:'blink 2s ease infinite' }}/>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#c0c0c0', letterSpacing:'0.1em' }}>AI-POWERED • PERSONALIZED • FREE</span>
          </div>

          <h1 style={{ fontSize:'clamp(42px,7vw,80px)', fontWeight:800, lineHeight:1.05, marginBottom:'24px', color:'#f0f0f0', letterSpacing:'-0.02em' }}>
            Master DSA with<br/>
            <span style={{ background:'linear-gradient(135deg,#c0c0c0,#ffffff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI-Generated</span>
            {' '}Roadmaps
          </h1>

          <p style={{ fontSize:'18px', color:'#a0a0a0', maxWidth:'560px', margin:'0 auto 40px', lineHeight:1.7 }}>
            Stop grinding blindly. Get a personalized DSA learning path crafted by AI, tailored to your skill level and timeline.
          </p>

          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => setShowAuth(true)} data-testid="hero-get-started-btn"
              style={{ background:'linear-gradient(135deg,#c0c0c0,#ffffff)', border:'none', borderRadius:'10px', padding:'14px 32px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'14px', color:'#030508', cursor:'pointer', boxShadow:'0 0 30px rgba(192,192,192,0.35)', letterSpacing:'0.04em', transition:'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 40px rgba(192,192,192,0.55)'; }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 0 30px rgba(192,192,192,0.35)'; }}>
              START_LEARNING →
            </button>
            <button onClick={() => navigate('/problems')} data-testid="hero-view-problems-btn"
              style={{ background:'transparent', border:'1px solid rgba(192,192,192,0.4)', borderRadius:'10px', padding:'14px 32px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'14px', color:'#c0c0c0', cursor:'pointer', letterSpacing:'0.04em', transition:'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background='rgba(192,192,192,0.08)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform=''; }}>
              VIEW_PROBLEMS
            </button>
          </div>

          {/* Topic pills */}
          <div style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap', marginTop:'48px' }}>
            {topics.map((t, i) => (
              <span key={t} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#888', border:'1px solid rgba(192,192,192,0.2)', borderRadius:'50px', padding:'4px 12px', letterSpacing:'0.06em', animation:`fadeIn 0.5s ease forwards ${i*0.05+0.3}s`, opacity:0 }}>{t}</span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth:'1100px', margin:'0 auto', padding:'40px 24px 100px' }} data-testid="features-section">
          <div style={{ textAlign:'center', marginBottom:'60px' }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#c0c0c0', letterSpacing:'0.15em', marginBottom:'12px' }}>// WHY_CHOOSE_DSA_FORGE</p>
            <h2 style={{ fontSize:'clamp(28px,4vw,42px)', fontWeight:800, color:'#f0f0f0', letterSpacing:'-0.02em' }}>Everything you need to<br/><span style={{ background:'linear-gradient(135deg,#c0c0c0,#ffffff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>crack DSA interviews</span></h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'20px' }}>
            {features.map((f, i) => (
              <div key={f.title} data-testid={`feature-${f.title.toLowerCase().replace(' ','-')}`}
                style={{ background:'rgba(10,10,10,0.7)', border:'1px solid rgba(192,192,192,0.12)', borderRadius:'16px', padding:'28px 24px', transition:'all 0.25s', animation:`fadeInUp 0.5s ease forwards ${i*0.1+0.2}s`, opacity:0, position:'relative', overflow:'hidden' }}
                onMouseOver={e => { e.currentTarget.style.borderColor=f.color+'66'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 0 30px ${f.color}20`; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='rgba(192,192,192,0.12)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <div style={{ fontSize:'32px', marginBottom:'16px' }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'14px', color:f.color, marginBottom:'10px', letterSpacing:'0.04em' }}>{f.title}</h3>
                <p style={{ color:'#888', fontSize:'13px', lineHeight:1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth:'900px', margin:'0 auto', padding:'0 24px 100px' }} data-testid="cta-section">
          <div style={{ background:'linear-gradient(135deg,rgba(192,192,192,0.05),rgba(255,255,255,0.05))', border:'1px solid rgba(192,192,192,0.15)', borderRadius:'24px', padding:'64px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,#c0c0c0,transparent)' }}/>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#c0c0c0', letterSpacing:'0.15em', marginBottom:'16px' }}>// READY_TO_START</p>
            <h2 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:800, color:'#f0f0f0', marginBottom:'16px', letterSpacing:'-0.02em' }}>Start your DSA journey today</h2>
            <p style={{ color:'#a0a0a0', fontSize:'15px', marginBottom:'36px' }}>Join developers mastering DSA with AI-powered roadmaps</p>
            <button onClick={() => setShowAuth(true)} data-testid="cta-get-started-btn"
              style={{ background:'linear-gradient(135deg,#c0c0c0,#ffffff)', border:'none', borderRadius:'10px', padding:'14px 36px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'14px', color:'#030508', cursor:'pointer', boxShadow:'0 0 30px rgba(192,192,192,0.3)', letterSpacing:'0.04em' }}>
              GET_STARTED_FREE →
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop:'1px solid rgba(192,192,192,0.15)', padding:'24px', textAlign:'center' }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', color:'#686868' }}>© 2026 DSA_FORGE — Built for developers 🖤</span>
        </footer>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent data-testid="auth-dialog" style={{ background:'#0d0d0d', border:'1px solid rgba(192,192,192,0.2)', borderRadius:'20px', maxWidth:'420px' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily:"'JetBrains Mono',monospace", color:'#f0f0f0', fontSize:'18px' }}>
              {isLogin ? '// WELCOME_BACK' : '// CREATE_ACCOUNT'}
            </DialogTitle>
            <DialogDescription style={{ fontFamily:"'JetBrains Mono',monospace", color:'#a0a0a0', fontSize:'12px' }}>
              {isLogin ? 'Enter your username to continue' : 'Start your DSA journey today'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px', marginTop:'8px' }}>
            {[
              { id:'username', label:'username', type:'text', placeholder:'your_username', show:true },
              { id:'email', label:'email', type:'email', placeholder:'your@email.com', show:!isLogin },
            ].filter(f => f.show).map(field => (
              <div key={field.id}>
                <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#c0c0c0', letterSpacing:'0.1em', display:'block', marginBottom:'6px' }}>$ {field.label}</label>
                <input
                  id={field.id} type={field.type} required
                  data-testid={`auth-${field.id}-input`}
                  placeholder={field.placeholder}
                  value={formData[field.id]}
                  onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                  style={{ width:'100%', background:'#050505', border:'1px solid rgba(192,192,192,0.2)', borderRadius:'8px', padding:'10px 14px', color:'#f0f0f0', fontFamily:"'JetBrains Mono',monospace", fontSize:'13px', outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor='rgba(192,192,192,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(192,192,192,0.2)'}
                />
              </div>
            ))}

            {!isLogin && (
              <div>
                <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', color:'#c0c0c0', letterSpacing:'0.1em', display:'block', marginBottom:'6px' }}>$ skill_level</label>
                <Select value={formData.skill_level} onValueChange={v => setFormData({...formData, skill_level:v})}>
                  <SelectTrigger data-testid="auth-skill-select" style={{ background:'#050505', border:'1px solid rgba(192,192,192,0.2)', color:'#f0f0f0', fontFamily:"'JetBrains Mono',monospace", fontSize:'13px', borderRadius:'8px' }}>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent style={{ background:'#0d0d0d', border:'1px solid rgba(192,192,192,0.15)' }}>
                    {['beginner','intermediate','advanced'].map(v => (
                      <SelectItem key={v} value={v} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', color:'#f0f0f0' }}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <button type="submit" disabled={loading} data-testid="auth-submit-btn"
              style={{ background:'linear-gradient(135deg,#c0c0c0,#ffffff)', border:'none', borderRadius:'8px', padding:'12px', fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'13px', color:'#030508', cursor:'pointer', letterSpacing:'0.06em', opacity: loading ? 0.7 : 1, marginTop:'4px' }}>
              {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN →' : 'CREATE_ACCOUNT →')}
            </button>
          </form>

          <button onClick={() => setIsLogin(!isLogin)} data-testid="auth-toggle-btn"
            style={{ background:'none', border:'none', color:'#a0a0a0', fontFamily:"'JetBrains Mono',monospace", fontSize:'11px', cursor:'pointer', letterSpacing:'0.04em', marginTop:'4px' }}>
            {isLogin ? '→ No account? Sign up' : '→ Already have account? Login'}
          </button>
        </DialogContent>
      </Dialog>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
};
export default HomePage;