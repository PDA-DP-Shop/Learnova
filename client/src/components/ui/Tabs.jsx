const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex gap-1 border-b border-slate-100 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-6 py-4 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === tab.id
              ? 'text-odoo'
              : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-odoo rounded-full shadow-[0_0_8px_rgba(113,75,103,0.3)]" />
          )}
        </button>
      ))}
    </div>
  )
}

export default Tabs
