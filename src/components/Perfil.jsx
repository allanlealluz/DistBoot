import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// O componente precisa receber o ID do usuário logado e uma função para atualizar o state global (opcional)
export default function Perfil({ usuarioId, onPerfilAtualizado }) {
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '' });
  const [usuarioOriginal, setUsuarioOriginal] = useState('');
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      try {
        const docRef = doc(db, "usuarios", usuarioId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setForm({ nome: dados.nome, usuario: dados.usuario, senha: dados.senha });
          setUsuarioOriginal(dados.usuario); // Guarda o original para saber se ele tentou mudar
        }
      } catch (error) {
        alert("Erro ao buscar dados do perfil: " + error.message);
      } finally {
        setCarregandoDados(false);
      }
    };

    if (usuarioId) buscarDadosUsuario();
  }, [usuarioId]);

  const handleAtualizarPerfil = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usuarioDigitado = form.usuario.toLowerCase();

      // Se ele mudou o nome de usuário, verifica se o novo já existe
      if (usuarioDigitado !== usuarioOriginal) {
        const usersRef = collection(db, "usuarios");
        const q = query(usersRef, where("usuario", "==", usuarioDigitado));
        const snap = await getDocs(q);

        if (!snap.empty) {
          alert("Este nome de usuário já está sendo usado por outra pessoa.");
          setLoading(false);
          return;
        }
      }

      // Atualiza o documento no Firestore
      const docRef = doc(db, "usuarios", usuarioId);
      await updateDoc(docRef, {
        nome: form.nome,
        usuario: usuarioDigitado,
        senha: form.senha
      });

      alert("Perfil atualizado com sucesso!");
      setUsuarioOriginal(usuarioDigitado);
      
      // Atualiza o nome no cabeçalho principal do seu sistema, se necessário
      if (onPerfilAtualizado) {
        onPerfilAtualizado(form.nome);
      }

    } catch (err) {
      alert("Erro ao atualizar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (carregandoDados) return <div className="p-4 text-center text-muted">Carregando perfil...</div>;

  return (
    <div className="fade-in max-w-md">
      <h3 className="fw-bold text-dark mb-4">Meu Perfil</h3>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleAtualizarPerfil}>
            
            <div className="mb-3">
              <label className="form-label fw-bold small text-muted">NOME COMPLETO</label>
              <input 
                type="text" 
                className="form-control" 
                required
                value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})} 
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-muted">LOGIN (USUÁRIO)</label>
              <input 
                type="text" 
                className="form-control" 
                required
                value={form.usuario}
                onChange={e => setForm({...form, usuario: e.target.value})} 
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-muted">SENHA DE ACESSO</label>
              <input 
                type="text" // Usando text para ele poder ver a senha que está alterando
                className="form-control" 
                required
                value={form.senha}
                onChange={e => setForm({...form, senha: e.target.value})} 
              />
              <div className="form-text small">Para sua segurança, não compartilhe sua senha.</div>
            </div>

            <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}