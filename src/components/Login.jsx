import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export default function Login({ onLogin }) {
  const [isRegistro, setIsRegistro] = useState(false);
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '' });
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usersRef = collection(db, "usuarios");

      if (isRegistro) {
        // --- LÓGICA DE CADASTRO ---
        const q = query(usersRef, where("usuario", "==", form.usuario));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          alert("Erro: Este nome de usuário já está em uso.");
        } else {
          await addDoc(usersRef, { 
            nome: form.nome, 
            usuario: form.usuario.toLowerCase(), 
            senha: form.senha 
          });
          alert("Usuário criado com sucesso. Por favor, faça login.");
          setIsRegistro(false);
          setForm({ ...form, senha: '' }); // Limpa a senha por segurança
        }
      } else {
        // --- LÓGICA DE LOGIN ---
        const q = query(usersRef, 
          where("usuario", "==", form.usuario.toLowerCase()), 
          where("senha", "==", form.senha)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          alert("Erro: Usuário ou senha incorretos.");
        } else {
          const dados = snap.docs[0].data();
          onLogin({ nome: dados.nome, id: snap.docs[0].id });
        }
      }
    } catch (err) {
      alert("Erro na autenticação: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          /* Animação do fundo escuro */
          @keyframes moveDarkGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .bg-dark-animated {
            background: linear-gradient(-45deg, #020617, #0f172a, #1e293b, #020617);
            background-size: 400% 400%;
            animation: moveDarkGradient 15s ease infinite;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            padding: 1rem;
          }

          /* Efeito literal de flutuação para a caixa */
          @keyframes floatingBox {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }

          .floating-card {
            background: #ffffff;
            border-radius: 24px;
            /* Sombra dupla: uma difusa para profundidade, uma curta para a base */
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 420px;
            padding: 3rem 2.5rem;
            animation: floatingBox 6s ease-in-out infinite;
            position: relative;
            z-index: 10;
          }

          .clean-input {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.8rem 1.2rem;
            color: #334155;
            transition: all 0.2s ease;
          }

          .clean-input:focus {
            background-color: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            outline: none;
          }

          .btn-primary-custom {
            background-color: #0f172a;
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-weight: 600;
            padding: 0.8rem;
            letter-spacing: 0.5px;
            transition: background-color 0.2s, transform 0.1s;
          }

          .btn-primary-custom:hover:not(:disabled) {
            background-color: #1e293b;
            transform: translateY(-1px);
          }

          .btn-primary-custom:disabled {
            background-color: #94a3b8;
            cursor: not-allowed;
          }

          .toggle-link {
            color: #64748b;
            font-size: 0.9rem;
            text-decoration: none;
            background: none;
            border: none;
            padding: 0;
            transition: color 0.2s;
            cursor: pointer;
          }

          .toggle-link:hover {
            color: #0f172a;
            text-decoration: underline;
          }
        `}
      </style>

      <div className="bg-dark-animated">
        <div className="floating-card">
          
          <div className="text-center mb-5">
            <img 
              src="/distboot.png" 
              alt="Logo Distboot" 
              style={{ width: '85px', height: 'auto', marginBottom: '20px' }}
              onError={(e) => e.target.style.display = 'none'} 
            />
            <h3 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '1.5px' }}>DISTBOOT</h3>
            <p className="text-muted small mb-0">
              {isRegistro ? 'Preencha os dados para criar seu acesso' : 'Insira suas credenciais para continuar'}
            </p>
          </div>

          <form onSubmit={handleAuth}>
            
            {isRegistro && (
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  Nome Completo
                </label>
                <input 
                  type="text" 
                  className="form-control clean-input" 
                  placeholder="Nome do colaborador"
                  required
                  value={form.nome}
                  onChange={e => setForm({...form, nome: e.target.value})} 
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Usuário
              </label>
              <input 
                type="text" 
                className="form-control clean-input" 
                placeholder="login"
                required
                value={form.usuario}
                onChange={e => setForm({...form, usuario: e.target.value})} 
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Senha
              </label>
              <input 
                type="password" 
                className="form-control clean-input" 
                placeholder="••••••••"
                required
                value={form.senha}
                onChange={e => setForm({...form, senha: e.target.value})} 
              />
            </div>

            <button type="submit" className="btn-primary-custom w-100 mb-4" disabled={loading}>
              {loading ? 'Processando...' : (isRegistro ? 'Finalizar Cadastro' : 'Acessar Plataforma')}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                className="toggle-link"
                onClick={() => {
                  setIsRegistro(!isRegistro);
                  setForm({ nome: '', usuario: '', senha: '' });
                }}
              >
                {isRegistro ? 'Voltar para o Login' : 'Cadastro'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </>
  );
}