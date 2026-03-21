const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex gap-1 border-b border-white/8 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
            activeTab === tab.id
              ? 'text-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}

export default Tabs
