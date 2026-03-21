const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm:  'w-4 h-4 border-2',
    md:  'w-6 h-6 border-2',
    lg:  'w-10 h-10 border-3',
    xl:  'w-16 h-16 border-4',
  }
  return (
    <div className={`${sizes[size] || sizes.md} border-odoo border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

export const LoadingScreen = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-odoo font-black uppercase tracking-[0.3em] text-[10px]">Portal Initialization…</p>
    </div>
  </div>
)

export default Spinner
