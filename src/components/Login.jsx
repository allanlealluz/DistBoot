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
        // Verifica se o usuário já existe
        const q = query(usersRef, where("usuario", "==", form.usuario));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          alert("❌ Este nome de usuário já está em uso.");
        } else {
          await addDoc(usersRef, { 
            nome: form.nome, 
            usuario: form.usuario.toLowerCase(), 
            senha: form.senha 
          });
          alert("✅ Usuário criado! Agora faça login.");
          setIsRegistro(false);
        }
      } else {
        // --- LÓGICA DE LOGIN ---
        const q = query(usersRef, 
          where("usuario", "==", form.usuario.toLowerCase()), 
          where("senha", "==", form.senha)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          alert("❌ Usuário ou senha incorretos.");
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
    <div className="d-flex align-items-center justify-content-center vh-100 vw-100" 
         style={{ backgroundColor: '#0f172a', position: 'fixed', top: 0, left: 0 }}>
      
      <div className="card shadow-lg border-0 p-4" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">DISTBOOT</h2>
          <p className="text-muted">{isRegistro ? 'Crie sua conta' : 'Acesso ao Sistema'}</p>
        </div>

        <form onSubmit={handleAuth}>
          {isRegistro && (
            <div className="mb-3">
              <label className="form-label fw-bold small">NOME COMPLETO</label>
              <input type="text" className="form-control bg-light" required
                onChange={e => setForm({...form, nome: e.target.value})} />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-bold small">USUÁRIO</label>
            <input type="text" className="form-control bg-light" required
              onChange={e => setForm({...form, usuario: e.target.value})} />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small">SENHA</label>
            <input type="password" className="form-control bg-light" required
              onChange={e => setForm({...form, senha: e.target.value})} />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold py-2 mb-3" disabled={loading}>
            {loading ? 'Aguarde...' : (isRegistro ? 'CADASTRAR' : 'ENTRAR')}
          </button>

          <div className="text-center">
            <button type="button" className="btn btn-link btn-sm text-decoration-none" 
                    onClick={() => setIsRegistro(!isRegistro)}>
              {isRegistro ? 'Já tenho conta? Entrar' : 'Ainda não sou cadastrado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}