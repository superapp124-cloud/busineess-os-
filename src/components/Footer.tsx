import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full mt-auto py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-[12px] text-slate-400 font-medium">
            Chatr Intent — A product of TalentXcel Services Pvt Ltd
          </p>
          <p className="text-[11px] text-slate-500">
            © 2026 TalentXcel Services Pvt Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-[12px] pt-1">
            <Link 
              to="/about" 
              className="text-slate-400 hover:text-cyan-400 hover:underline transition-colors font-medium"
            >
              About
            </Link>
            <span className="text-slate-600">|</span>
            <Link 
              to="/help" 
              className="text-slate-400 hover:text-cyan-400 hover:underline transition-colors font-medium"
            >
              Help
            </Link>
            <span className="text-slate-600">|</span>
            <Link 
              to="/contact" 
              className="text-slate-400 hover:text-cyan-400 hover:underline transition-colors font-medium"
            >
              Contact
            </Link>
            <span className="text-slate-600">|</span>
            <Link 
              to="/terms" 
              className="text-slate-400 hover:text-cyan-400 hover:underline transition-colors font-medium"
            >
              Terms
            </Link>
            <span className="text-slate-600">|</span>
            <Link 
              to="/privacy" 
              className="text-slate-400 hover:text-cyan-400 hover:underline transition-colors font-medium"
            >
              Privacy
            </Link>
            <span className="text-slate-600">|</span>
            <Link 
              to="/disclaimer" 
              className="text-slate-400 hover:text-cyan-400 hover:underline transition-colors font-medium"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
