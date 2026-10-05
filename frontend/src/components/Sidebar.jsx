import { MessageSquare, Plus, Trash2, UserCircle, LogOut, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  return <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
    <div className="sidebar-top"><Logo /><button className="icon-btn mobile-close" onClick={onClose}><X size={20} /></button></div>
    <button className="new-chat" onClick={onNew}><Plus size={19} /> New chat</button>
    <div className="side-label">Recent chats</div>
    <div className="conversation-list">
      {conversations.length === 0 ? <div className="empty-side"><MessageSquare size={24} /><span>No conversations yet</span><small>Start a new chat</small></div> : conversations.map(c => <div key={c._id} className={`conversation-item ${activeId === c._id ? 'active' : ''}`}>
        <button className="conversation-select" onClick={() => { onSelect(c._id); onClose?.(); }}><MessageSquare size={16} /><span>{c.title || 'New Chat'}</span></button>
        <button className="delete-chat" title="Delete" onClick={() => onDelete(c._id)}><Trash2 size={15} /></button>
      </div>)}
    </div>
    <div className="sidebar-bottom">
      <div className="user-mini"><div className="avatar">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || "User"}
            className="avatar-image"
          />
        ) : (
          user?.name?.[0]?.toUpperCase() || "U"
        )}
      </div><div className="user-info"><strong>{user?.name}</strong><span>{user?.email}</span></div></div>
      <div className="side-actions"><button onClick={() => { location.href = '/profile' }}><UserCircle size={17} /> Profile</button><button onClick={logout}><LogOut size={17} /> Logout</button></div>
    </div>
  </aside>;
}
