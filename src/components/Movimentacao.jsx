import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';

export default function Movimentacao({ usuario, aoSucesso }) {
  const [catalogo, setCatalogo] = useState([]);
  const [lotesDisponiveis, setLotesDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tipo: 'E',
    insumo_id: '',
    nome_insumo: '',
    lote: '',
    validade: '',
    quantidade: '',
    finalidade: '',
    lote_id_saida: ''
  });

  useEffect(() => {
    const carregarCatalogo = async () => {
      const snap = await getDocs(collection(db, "insumos"));
      const dados = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Filtra apenas os ativos para novas movimentações
      setCatalogo(dados.filter(i => i.ativo !== false).sort((a, b) => a.nome.localeCompare(b.nome)));
    };
    carregarCatalogo();
  }, []);

  // Busca lotes sempre que mudar o insumo ou o tipo for Saída
  useEffect(() => {
    const carregarLotes = async () => {
      if (form.tipo === 'S' && form.insumo_id) {
        try {
          // Busca todos os lotes desse insumo
          const q = query(collection(db, "lotes"), where("insumo_id", "==", form.insumo_id));
          const snap = await getDocs(q);
          
          const hoje = new Date();
          hoje.setHours(0,0,0,0);

          const filtrados = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(l => l.quantidade > 0 && new Date(l.validade + 'T00:00:00') >= hoje);
          
          setLotesDisponiveis(filtrados);
        } catch (err) {
          console.error("Erro ao buscar lotes:", err);
        }
      }
    };
    carregarLotes();
  }, [form.insumo_id, form.tipo]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!form.insumo_id) return alert("Selecione um insumo");
    setLoading(true);

    try {
      const qtd = parseInt(form.quantidade);
      let loteFinal = form.lote;

      if (form.tipo === 'E') {
        const qLote = query(collection(db, "lotes"), 
          where("insumo_id", "==", form.insumo_id), 
          where("lote", "==", form.lote)
        );
        const snapLote = await getDocs(qLote);

        if (!snapLote.empty) {
          const loteDoc = snapLote.docs[0];
          await updateDoc(doc(db, "lotes", loteDoc.id), { 
            quantidade: loteDoc.data().quantidade + qtd 
          });
        } else {
          await addDoc(collection(db, "lotes"), {
            insumo_id: form.insumo_id,
            lote: form.lote,
            validade: form.validade,
            quantidade: qtd
          });
        }
      } else {
        const loteSelecionado = lotesDisponiveis.find(l => l.id === form.lote_id_saida);
        if (!loteSelecionado) throw new Error("Selecione um lote válido");
        if (qtd > loteSelecionado.quantidade) throw new Error("Estoque insuficiente neste lote");

        await updateDoc(doc(db, "lotes", form.lote_id_saida), {
          quantidade: loteSelecionado.quantidade - qtd
        });
        loteFinal = loteSelecionado.lote;
      }

      await addDoc(collection(db, "movimentacoes"), {
        tipo: form.tipo,
        insumo_id: form.insumo_id,
        nome_insumo: form.nome_insumo,
        lote: loteFinal,
        quantidade: qtd,
        finalidade: form.finalidade,
        usuario: usuario?.nome || "Sistema",
        data_hora: new Date().toISOString()
      });

      alert("Sucesso!");
      if (aoSucesso) aoSucesso();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 mx-auto" style={{maxWidth: '800px'}}>
      <h3 className="fw-bold mb-4">Movimentação de Estoque</h3>
      <form onSubmit={handleSalvar}>
        <div className="btn-group w-100 mb-4 shadow-sm">
          <input type="radio" className="btn-check" name="tipo" id="ent" checked={form.tipo === 'E'} onChange={() => setForm({...form, tipo: 'E'})} />
          <label className="btn btn-outline-success fw-bold" htmlFor="ent">ENTRADA</label>
          <input type="radio" className="btn-check" name="tipo" id="sai" checked={form.tipo === 'S'} onChange={() => setForm({...form, tipo: 'S'})} />
          <label className="btn btn-outline-danger fw-bold" htmlFor="sai">SAÍDA</label>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <label className="form-label fw-bold">Insumo</label>
            <select className="form-select" required value={form.insumo_id} 
              onChange={e => {
                const item = catalogo.find(i => i.id === e.target.value);
                setForm({...form, insumo_id: e.target.value, nome_insumo: item?.nome || ''});
              }}>
              <option value="">Selecione...</option>
              {catalogo.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.caracteristica})</option>)}
            </select>
          </div>

          {form.tipo === 'E' ? (
            <>
              <div className="col-md-6">
                <label className="form-label fw-bold">Lote</label>
                <input type="text" className="form-control" required value={form.lote} onChange={e => setForm({...form, lote: e.target.value.toUpperCase()})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Validade</label>
                <input type="date" className="form-control" required value={form.validade} onChange={e => setForm({...form, validade: e.target.value})} />
              </div>
            </>
          ) : (
            <div className="col-12">
              <label className="form-label fw-bold text-danger">Lote Disponível</label>
              <select className="form-select border-danger" required value={form.lote_id_saida} onChange={e => setForm({...form, lote_id_saida: e.target.value})}>
                <option value="">Selecione um lote com saldo...</option>
                {lotesDisponiveis.map(l => (
                  <option key={l.id} value={l.id}>Lote: {l.lote} | Saldo: {l.quantidade} | Vence: {l.validade}</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-md-4">
            <label className="form-label fw-bold">Quantidade</label>
            <input type="number" className="form-control" required min="1" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
          </div>
          <div className="col-md-8">
            <label className="form-label fw-bold">Observação</label>
            <input type="text" className="form-control" required value={form.finalidade} onChange={e => setForm({...form, finalidade: e.target.value})} />
          </div>

          <button type="submit" className={`btn btn-lg w-100 mt-4 fw-bold ${form.tipo === 'E' ? 'btn-success' : 'btn-danger'}`} disabled={loading}>
            {loading ? 'Gravando...' : 'Confirmar Movimentação'}
          </button>
        </div>
      </form>
    </div>
  );
}