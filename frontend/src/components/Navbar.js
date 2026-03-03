import { useNavigate, useLocation } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, Sparkles, BookOpen, LogOut, ChevronDown } from 'lucide-react';

const Navbar = ({ currentUser, logoutUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/generate-roadmap', label: 'Roadmap', icon: Sparkles },
    { path: '/problems', label: 'Problems', icon: BookOpen },
  ];

  return (
    <nav style={{
      background: 'rgba(8,12,18,0.92)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,255,136,0.1)',
      position: 'sticky', top: 0, zIndex: 100,
    }} data-testid="navbar">
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} data-testid="nav-logo">
          <div style={{
            width:'34px', height:'34px',
            background:'linear-gradient(135deg,#00ff88,#00d4ff)',
            borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'JetBrains Mono',monospace", fontWeight:900, fontSize:'13px', color:'#030508',
            boxShadow:'0 0 15px rgba(0,255,136,0.35)',
          }}>{'</>'}</div>
          <span style={{
            fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:'15px', letterSpacing:'0.04em',
            background:'linear-gradient(135deg,#00ff88,#00d4ff)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>DSA_FORGE</span>
        </div>

        {/* Links */}
        {currentUser && (
          <div style={{ display:'flex', gap:'4px' }}>
            {navLinks.map(({ path, label, icon: Icon }) => (
              <button key={path} onClick={() => navigate(path)} data-testid={`nav-${label.toLowerCase()}`}
                style={{
                  display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px',
                  background: isActive(path) ? 'rgba(0,255,136,0.1)' : 'transparent',
                  border: isActive(path) ? '1px solid rgba(0,255,136,0.25)' : '1px solid transparent',
                  borderRadius:'8px',
                  color: isActive(path) ? '#00ff88' : '#8b949e',
                  fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', fontWeight:600,
                  cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.02em',
                }}
                onMouseOver={e => { if(!isActive(path)){ e.currentTarget.style.color='#e6edf3'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}}
                onMouseOut={e => { if(!isActive(path)){ e.currentTarget.style.color='#8b949e'; e.currentTarget.style.background='transparent'; }}}
              >
                <Icon size={13}/> {label}
              </button>
            ))}
          </div>
        )}

        {/* User dropdown */}
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{
                display:'flex', alignItems:'center', gap:'8px',
                background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)',
                borderRadius:'10px', padding:'6px 10px 6px 6px', cursor:'pointer',
              }} data-testid="nav-user-menu">
                <div style={{
                  width:'28px', height:'28px', background:'linear-gradient(135deg,#00ff88,#00d4ff)',
                  borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:"'JetBrains Mono',monospace", fontSize:'13px', fontWeight:800, color:'#030508',
                }}>{currentUser.username.charAt(0).toUpperCase()}</div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', color:'#e6edf3', fontWeight:600 }}>{currentUser.username}</span>
                <ChevronDown size={12} color="#8b949e"/>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ background:'#0d1117', border:'1px solid rgba(0,255,136,0.15)', borderRadius:'12px', minWidth:'180px' }}>
              <DropdownMenuLabel>
                <div style={{ fontFamily:"'JetBrains Mono',monospace" }}>
                  <div style={{ color:'#e6edf3', fontWeight:700, fontSize:'13px' }}>{currentUser.username}</div>
                  <div style={{ color:'#484f58', fontSize:'11px', marginTop:'2px' }}>{currentUser.email}</div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background:'rgba(0,255,136,0.1)' }}/>
              {navLinks.map(({ label, path, icon: Icon }) => (
                <DropdownMenuItem key={path} onClick={() => navigate(path)} style={{ color:'#8b949e', fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', cursor:'pointer' }}>
                  <Icon size={13} style={{ marginRight:'8px' }}/>{label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator style={{ background:'rgba(255,80,80,0.12)' }}/>
              <DropdownMenuItem onClick={() => { logoutUser(); navigate('/'); }} data-testid="menu-logout" style={{ color:'#ff5050', fontFamily:"'JetBrains Mono',monospace", fontSize:'12px', cursor:'pointer' }}>
                <LogOut size={13} style={{ marginRight:'8px' }}/> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};
export default Navbar;