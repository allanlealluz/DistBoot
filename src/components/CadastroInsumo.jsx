import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CadastroInsumo({ aoSucesso }) {
  const [insumo, setInsumo] = useState({ 
    nome: '', carac: '', material: '', min: 10 
  });

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      // Agora salvamos apenas o "Molde" do produto no catálogo
      await addDoc(collection(db, "insumos"), {
        nome: insumo.nome,
        caracteristica: insumo.carac,
        material: insumo.material,
        estoque_minimo: parseInt(insumo.min)
      });
      alert("✅ Produto adicionado ao catálogo com sucesso!");
      setInsumo({ nome: '', carac: '', material: '', min: 10 });
      if(aoSucesso) aoSucesso(); // Volta pro dashboard
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 mx-auto" style={{maxWidth: '800px'}}>
      <h3 className="fw-bold text-secondary mb-4">Novo Item no Catálogo</h3>
      <div className="alert alert-info border-0 shadow-sm small">
        <i className="bi bi-info-circle-fill me-2"></i>
        Aqui você cadastra apenas o tipo de insumo. Lotes, validades e quantidades serão informados na tela de <strong>Movimentações (Entrada)</strong>.
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
          <button type="submit" className="btn btn-primary px-5 fw-bold">Salvar no Catálogo</button>
        </div>
      </form>
    </div>
  );
}