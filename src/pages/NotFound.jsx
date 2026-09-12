import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center text-center">
      <div>
        <Compass className="mx-auto mb-4 text-brand-600" size={40} />
        <h1 className="text-2xl font-bold text-brand-900 dark:text-white">Page not found</h1>
        <p className="mt-1 text-sm text-brand-900/55 dark:text-white/50">That route doesn't exist in this console.</p>
        <Link to="/">
          <Button className="mt-6">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
