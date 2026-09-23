export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Torque Block — Premium Performance Motorcycle Tyre Commerce</p>
        <div className="flex items-center space-x-4 text-slate-400">
          <span>B2B Portal</span>
          <span>•</span>
          <span>Bengaluru, India</span>
        </div>
      </div>
    </footer>
  );
}
