import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [catalogo, setCatalogo] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [busca, setBusca] = useState('');
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    const unsubCat = onSnapshot(collection(db, "insumos"), (snap) => setCatalogo(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubLotes = onSnapshot(collection(db, "lotes"), (snap) => setLotes(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubCat(); unsubLotes(); };
  }, []);

  const toggleExpandir = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const isVencido = (dataValidade) => {
    if (!dataValidade) return false;
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    return new Date(dataValidade + 'T00:00:00') < hoje;
  };

  // Função de Inativação (Soft Delete)
  const alternarStatusInsumo = async (idInsumo, statusAtual) => {
    const novoStatus = statusAtual === false ? true : false;
    const msg = novoStatus 
      ? `Tem certeza que deseja REATIVAR este insumo? Ele voltará a aparecer para movimentações.` 
      : `Tem certeza que deseja INATIVAR este insumo? Ele deixará de ser listado em novas movimentações.`;

    if (window.confirm(msg)) {
      try {
        await updateDoc(doc(db, "insumos", idInsumo), { ativo: novoStatus });
      } catch (err) {
        alert("Erro ao alterar status: " + err.message);
      }
    }
  };

  const catalogoFiltrado = catalogo.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="fade-in">
      <header className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Painel Logístico</h2>
          <p className="text-muted mb-0">Visão de Estoque Útil vs Vencido</p>
        </div>
        <div className="input-group w-25 shadow-sm">
          <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
          <input type="text" className="form-control border-start-0" placeholder="Buscar produto..." onChange={e => setBusca(e.target.value)} />
        </div>
      </header>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th className="px-3 py-3" style={{width: '50px'}}></th>
                <th>Insumo Base</th>
                <th className="text-center">Mínimo</th>
                <th className="text-center">Estoque ÚTIL</th>
                <th className="text-center">Vencidos</th>
                <th className="text-center">Status</th>
                <th className="px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {catalogoFiltrado.map(produto => {
                const lotesDoProduto = lotes.filter(l => l.insumo_id === produto.id && l.quantidade > 0);
                
                let estoqueUtil = 0;
                let estoquePerdido = 0;
                let temLoteVencido = false;

                lotesDoProduto.forEach(lote => {
                  if (isVencido(lote.validade)) {
                    estoquePerdido += lote.quantidade;
                    temLoteVencido = true;
                  } else {
                    estoqueUtil += lote.quantidade;
                  }
                });

                const isExpandido = expandidos[produto.id];
                const isAtivo = produto.ativo !== false; 

                // Lógica de Status
                let statusBadge;
                if (!isAtivo) {
                  statusBadge = <span className="badge bg-secondary">INATIVO</span>;
                } else if (estoqueUtil === 0) {
                  statusBadge = <span className="badge bg-dark">🚫 ZERADO</span>;
                } else if (estoqueUtil <= produto.estoque_minimo) {
                  statusBadge = <span className="badge bg-warning text-dark">⚠️ COMPRAR</span>;
                } else {
                  statusBadge = <span className="badge bg-success">✅ OK</span>;
                }

                return (
                  <React.Fragment key={produto.id}>
                    <tr className={`${isExpandido ? 'table-light' : 'bg-white'} ${!isAtivo ? 'opacity-75' : ''}`}>
                      <td className="px-3 text-center">
                        <button onClick={() => toggleExpandir(produto.id)} className="btn btn-sm btn-light border rounded">
                          <i className={`bi bi-chevron-${isExpandido ? 'up' : 'down'}`}></i>
                        </button>
                      </td>
                      <td>
                        <div className={`fw-bold ${!isAtivo ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                          {produto.nome}
                        </div>
                        <small className="text-muted">{produto.caracteristica} • {produto.material}</small>
                      </td>
                      <td className="text-center text-muted">{produto.estoque_minimo}</td>
                      
                      <td className="text-center">
                        <span className={`fs-5 fw-bold ${!isAtivo ? 'text-muted' : (estoqueUtil <= produto.estoque_minimo ? 'text-danger' : 'text-success')}`}>
                          {estoqueUtil}
                        </span>
                      </td>

                      <td className="text-center">
                        {temLoteVencido ? (
                          <span className="badge bg-danger rounded-pill px-2 py-1" title="Descartar imediatamente!">
                            {estoquePerdido} un.
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>

                      <td className="text-center">{statusBadge}</td>
                      
                      {/* --- AQUI ESTÁ A CORREÇÃO DOS BOTÕES --- */}
                      <td className="px-4 text-center">
                        <button 
                          onClick={() => alternarStatusInsumo(produto.id, isAtivo)}
                          className={`btn btn-sm fw-bold ${isAtivo ? 'btn-danger' : 'btn-success'}`}
                          style={{ width: '90px' }}
                        >
                          {isAtivo ? 'Inativar' : 'Reativar'}
                        </button>
                      </td>
                    </tr>

                    {/* SUB-LINHAS (Lotes Expandidos) */}
                    {isExpandido && (
                      <tr>
                        <td colSpan="7" className="p-0 border-bottom-0">
                          <div className="bg-light p-3 border-start border-secondary border-4 ms-4 my-2 rounded-end shadow-sm">
                            <h6 className="fw-bold text-secondary mb-2 small text-uppercase">Lotes Físicos na Prateleira</h6>
                            {lotesDoProduto.length === 0 ? (
                              <div className="text-muted small">Nenhum lote com saldo.</div>
                            ) : (
                              <table className="table table-sm table-borderless mb-0">
                                <tbody>
                                  {lotesDoProduto.map(lote => {
                                    const vencido = isVencido(lote.validade);
                                    return (
                                      <tr key={lote.id}>
                                        <td className="fw-bold text-muted" style={{width: '20%'}}>{lote.lote}</td>
                                        <td className={vencido ? 'text-danger fw-bold' : 'text-muted'} style={{width: '30%'}}>
                                          Vence: {lote.validade.split('-').reverse().join('/')}
                                        </td>
                                        <td className="fw-bold text-dark" style={{width: '20%'}}>{lote.quantidade} un.</td>
                                        <td>
                                          {vencido ? <span className="badge bg-danger">VENCIDO</span> : <span className="badge bg-success-subtle text-success border border-success">Bom para uso</span>}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}