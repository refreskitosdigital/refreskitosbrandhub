'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales incorrectas o error en el servidor.');
      setLoading(false);
      return;
    }

    // Al autenticar, buscar el rol y cliente
    const { data: userData, error: userError } = await supabase
      .from('usuarios_clientes')
      .select('rol, cliente_id, clientes(nombre)')
      .eq('usuario_id', data.user.id)
      .single();

    if (userError || !userData) {
      setError('Tu usuario no tiene un workspace asignado.');
      setLoading(false);
      return;
    }

    // Redirigir según el rol
    if (userData.rol === 'administrador') {
      // El administrador puede ir a una vista global o ver al primer cliente
      router.push('/dashboard');
    } else {
      // El cliente va a su propio workspace
      router.push(`/dashboard/${userData.cliente_id}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md bg-panel border border-border rounded-card p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-magenta/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-syne font-bold text-2xl tracking-tight text-text">REFRESKITOS</h1>
            <p className="font-syne font-semibold text-magenta tracking-widest text-xs uppercase mt-1">Brand Hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-alert/10 border border-alert/20 text-alert text-sm p-3 rounded-btn">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-text-dim uppercase tracking-wide mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@cliente.com"
                className="w-full bg-panel-2 border border-border rounded-btn px-4 py-3 text-text placeholder:text-text-dim/50 focus:outline-none focus:border-magenta focus:ring-1 focus:ring-magenta transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-dim uppercase tracking-wide mb-2">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-panel-2 border border-border rounded-btn px-4 py-3 text-text placeholder:text-text-dim/50 focus:outline-none focus:border-magenta focus:ring-1 focus:ring-magenta transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-magenta text-black font-bold py-3 rounded-btn mt-4 hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,45,139,0.2)] disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-text-dim">
              ¿No tienes acceso? Contacta a tu account manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
