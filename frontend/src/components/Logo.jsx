import { Bot } from 'lucide-react';
export default function Logo({ compact=false }) { return <div className="brand"><span className="brand-icon"><Bot size={compact?18:22}/></span>{!compact && <span>NeuroChat</span>}</div>; }
