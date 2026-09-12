import { useState } from 'react';
import { Zap } from 'lucide-react';

/**
 * ============================================================================
 *  WHERE TO DROP YOUR LOGO
 * ============================================================================
 *  Put your logo file at:   billk-erp-web/public/logo.svg
 *  (PNG works too - just change LOGO_SRC below to "/logo.png")
 *
 *  Anything inside Vite's `public/` folder is served as-is from the site
 *  root, so a file at `public/logo.svg` is reachable at `/logo.svg` with no
 *  import statement and no build step required - drop the file in and
 *  refresh. Until a file exists there, this component quietly falls back to
 *  the default lightning-bolt mark below, so nothing breaks in the
 *  meantime.
 * ============================================================================
 */
const LOGO_SRC = '/logo.png';

export default function Logo({ size = 40, rounded = 'rounded-2xl', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`grid shrink-0 place-items-center ${rounded} bg-brand-600 text-white shadow-sm shadow-brand-600/30 ${className}`}
        style={{ width: size, height: size }}
      >
        <Zap size={Math.round(size * 0.5)} strokeWidth={2.5} />
      </span>
    );
  }

  return (
    <img
      src={LOGO_SRC}
      alt="Billk Motolink"
      onError={() => setFailed(true)}
      className={`shrink-0 object-contain ${rounded} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
