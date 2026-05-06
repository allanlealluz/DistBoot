import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CadastroInsumo({ aoSucesso }) {
  const [insumo, setInsumo] = useState({ 
    nome: '', carac: '', material: '', min: 10 
  });
  const [loading, setLoading] = useState(false);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Salva o item no catálogo definindo-o como ATIVO
      await addDoc(collection(db, "insumos"), {
        nome: insumo.nome,
        caracteristica: insumo.carac,
        material: insumo.material,
        estoque_minimo: parseInt(insumo.min),
        ativo: true // Campo crucial para a nova lógica
      });
      alert("✅ Produto adicionado ao catálogo com sucesso!");
      setInsumo({ nome: '', carac: '', material: '', min: 10 });
      if(aoSucesso) aoSucesso();
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 mx-auto" style={{maxWidth: '800px'}}>
      <h3 className="fw-bold text-secondary mb-4">Novo Item no Catálogo</h3>
      <div className="alert alert-info border-0 shadow-sm small">
        <i className="bi bi-info-circle-fill me-2"></i>
        Cadastre apenas a especificação base. O produto nascerá com status <strong>Ativo</strong>.
      </div>
      <form onSubmit={handleSalvar} className="row g-3">
        <div className="col-md-12">
          <label className="form-label fw-bold">Nome do Insumo *</label>
          <input type="text" className="form-control bg-light" required value={insumo.nome} onChange={e => setInsumo({...insumo, nome: e.target.value})} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold">Tamanho/Capacidade</label>
          <input type="text" className="form-control bg-light" placeholder="ex: 10ml, M, G" value={insumo.carac} onChange={e => setInsumo({...insumo, carac: e.target.value})} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold">Material</label>
          <input type="text" className="form-control bg-light" placeholder="ex: Látex, Nitrílica" value={insumo.material} onChange={e => setInsumo({...insumo, material: e.target.value})} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold">Estoque Mínimo (Alerta)</label>
          <input type="number" className="form-control bg-light" value={insumo.min} onChange={e => setInsumo({...insumo, min: e.target.value})} />
        </div>
        <div className="col-12 mt-4 text-end">
          <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar no Catálogo'}
          </button>
        </div>
      </form>
    </div>
  );
}