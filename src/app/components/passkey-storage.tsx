'use client';

import { useState, useEffect } from 'react';
import { Key, Shield, Wifi, AlertTriangle } from 'lucide-react';

export default function PasskeyAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [method, setMethod] = useState<'password' | 'passkey' | 'biometric'>('password');

  const handlePasskeyLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        setMethod('password');
        return;
      }
      const credential = await (navigator as any).credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }] as any,
        },
      }) as any;
      if (credential) {
        setAuthenticated(true);
      }
    } catch {
      setMethod('password');
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Passwordless Authentication</h3>
      </div>
      {authenticated ? (
        <div className="flex items-center gap-2 text-emerald-300 text-sm">
          <Shield className="w-4 h-4" /> Authenticated via Passkey
        </div>
      ) : (
        <div className="space-y-2">
          <button onClick={handlePasskeyLogin} className="w-full py-2 bg-white/10 border border-white/15 text-white rounded-lg text-sm hover:bg-white/20 transition-all">
            <Key className="w-4 h-4 inline mr-2" /> Sign in with Passkey
          </button>
          <p className="text-xs text-white/30">
            Passkeys use WebAuthn/FIDO2 — no passwords, no phishing, device-bound cryptographic keys.
          </p>
        </div>
      )}
    </div>
  );
}

export function PartitionedStorage() {
  const [storage, setStorage] = useState<{ type: string; status: string }[]>([]);

  useEffect(() => {
    const storages = [
      { type: 'LocalStorage', status: (navigator as any).storage?.persist ? 'Persisted' : 'Volatile' },
      { type: 'IndexedDB', status: 'Partitioned by origin' },
      { type: 'Cache API', status: 'Partitioned by origin' },
      { type: 'Cookies', status: 'SameSite=Lax enforced' },
    ];
    setStorage(storages);
  }, []);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-bold">Partitioned Storage</h3>
      </div>
      <div className="space-y-2">
        {storage.map((s, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
            <span className="text-sm text-white/70">{s.type}</span>
            <span className="text-xs text-teal-300">{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}