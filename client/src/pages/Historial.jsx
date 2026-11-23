import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Save,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import * as api from '../api/client';
import { extractError } from '../api/client';
import { useBet } from '../context/BetContext';
import { formatCOP, formatPercent, formatDate, formatNumber } from '../utils/format';

const MODE_LABELS = {
  fixed: 'Apuesta fija',
  total: 'Reinversión total',
  profit: 'Reinversión de ganancias',
  percentage: 'Porcentaje del capital',
};

export default function Historial() {
  const { simData, config } = useBet();
  const [records, setRecords] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);

  const notify = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listHistory({
        from: from || undefined,
        to: to || undefined,
      });
      setRecords(data);
    } catch (err) {
      notify(extractError(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const createFromCurrent = async () => {
    if (!simData) {
      notify('Ejecuta una simulación primero.', 'error');
      return;
    }
    try {
      await api.createHistory({
        initialCapital: simData.summary.initialCapital,
        odd: Number(config.odd),
        totalBets: Number(config.totalBets),
        goal: simData.summary.goal,
        mode: config.mode,
        riskPercent: Number(config.riskPercent),
        wins: simData.summary.wins,
        losses: simData.summary.losses,
        finalCapital: simData.summary.finalCapital,
        netGain: simData.summary.netGain,
        profitability: simData.summary.profitability,
        totalStaked: simData.summary.totalStaked,
        totalReturned: simData.summary.totalReturned,
        goalAchieved: simData.summary.goalAchieved,
        resultsJson: simData.bets,
      });
      notify('Registro creado correctamente.');
      load();
    } catch (err) {
      notify(extractError(err), 'error');
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteHistory(id);
      notify('Registro eliminado.');
      load();
    } catch (err) {
      notify(extractError(err), 'error');
    }
  };

  const saveEdit = async () => {
    try {
      await api.updateHistory(editing.id, editing);
      setEditing(null);
      notify('Registro actualizado.');
      load();
    } catch (err) {
      notify(extractError(err), 'error');
    }
  };

  const exportData = async (format) => {
    try {
      await api.exportHistory(format, { from: from || undefined, to: to || undefined });
      notify(`Exportación a ${format.toUpperCase()} iniciada.`);
    } catch (err) {
      notify(extractError(err), 'error');
    }
  };

  const setEditField = (field, value) => {
    setEditing((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            messageType === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          }`}
        >
          {message}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="from">Desde</label>
              <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="to">Hasta</label>
              <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
            </div>
            <div className="flex items-end gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={load}>
                <RefreshCw className="h-4 w-4" /> Filtrar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={createFromCurrent}>
              <Plus className="h-4 w-4" /> Guardar simulación actual
            </button>
            <button type="button" className="btn-secondary" onClick={() => exportData('csv')}>
              <Download className="h-4 w-4" /> CSV
            </button>
            <button type="button" className="btn-secondary" onClick={() => exportData('xlsx')}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
            <button type="button" className="btn-secondary" onClick={() => exportData('pdf')}>
              <FileText className="h-4 w-4" /> PDF
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="card border-brand-500/40">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Editar registro #{editing.id}</h3>
            <button type="button" className="text-slate-400 hover:text-white" onClick={() => setEditing(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['odd', 'Cuota'],
              ['goal', 'Meta (COP)'],
              ['finalCapital', 'Capital final'],
              ['netGain', 'Ganancia neta'],
              ['profitability', 'Rentabilidad %'],
              ['wins', 'Victorias'],
              ['losses', 'Derrotas'],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input
                  type="number"
                  step="0.01"
                  value={editing[field]}
                  onChange={(e) => setEditField(field, Number(e.target.value))}
                  className="input"
                />
              </div>
            ))}
            <div>
              <label className="label">Modalidad</label>
              <select value={editing.mode} onChange={(e) => setEditField('mode', e.target.value)} className="input">
                {Object.entries(MODE_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn-primary" onClick={saveEdit}>
              <Save className="h-4 w-4" /> Guardar cambios
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Historial de simulaciones</h2>
          <p className="text-xs text-slate-400">
            {loading ? 'Cargando…' : `${formatNumber(records.length, 0)} registro(s)`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Capital inicial</th>
                <th>Cuota</th>
                <th>Modalidad</th>
                <th>V/D</th>
                <th>Capital final</th>
                <th>Ganancia neta</th>
                <th>Rentabilidad</th>
                <th>Meta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-500">
                    No hay registros. Guarda tu simulación actual o crea un registro nuevo.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="text-slate-400">{formatDate(r.createdAt)}</td>
                  <td>{formatCOP(r.initialCapital)}</td>
                  <td>{formatNumber(r.odd)}</td>
                  <td>{MODE_LABELS[r.mode] || r.mode}</td>
                  <td>{r.wins}/{r.losses}</td>
                  <td className="font-semibold text-white">{formatCOP(r.finalCapital)}</td>
                  <td className={r.netGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatCOP(r.netGain)}</td>
                  <td>{formatPercent(r.profitability)}</td>
                  <td>
                    {r.goalAchieved ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Alcanzada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400">
                        <XCircle className="h-4 w-4" /> No
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-sky-400 hover:bg-sky-500/10"
                        onClick={() => setEditing({ ...r })}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10"
                        onClick={() => remove(r.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
