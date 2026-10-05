import { Sparkles } from 'lucide-react';
import Logo from './Logo';
export default function AuthLayout({ children, title, subtitle }) { return <div className="auth-page"><div className="auth-glow glow-one"/><div className="auth-glow glow-two"/><div className="auth-shell"><div className="auth-brand"><Logo/></div><div className="auth-card"><div className="auth-heading"><span className="eyebrow"><Sparkles size={14}/> AI powered workspace</span><h1>{title}</h1><p>{subtitle}</p></div>{children}</div><p className="auth-footer">Your conversations stay in your account.</p></div></div>; }
