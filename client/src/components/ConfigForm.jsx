import { AlertTriangle } from 'lucide-react';

const MODE_OPTIONS = [
  { id: 'fixed', label: '1 · Apuesta fija' },
  { id: 'total', label: '2 · Reinversión total' },
  { id: 'profit', label: '3 · Reinversión de ganancias' },
  { id: 'percentage', label: '4 · Porcentaje del capital' },
];

const NUMERIC_FIELDS = [
  'initialCapital',
  'odd',
  'totalBets',
  'goal',
  'riskPercent',
  'wins',
  'losses',
];

function validateConfig(config) {
  const errors = {};
  const initialCapital = Number(config.initialCapital);
  const odd = Number(config.odd);
  const totalBets = Number(config.totalBets);
  const goal = Number(config.goal);
  const riskPercent = Number(config.riskPercent);
  const wins = Number(config.wins);
  const losses = Number(config.losses);

  if (!(initialCapital > 0)) errors.initialCapital = 'Debe ser mayor que 0.';
  if (!(odd > 1)) errors.odd = 'Debe ser superior a 1.00.';
  if (!Number.isInteger(totalBets) || totalBets < 1 || totalBets > 100) {
    errors.totalBets = 'Entero entre 1 y 100.';
  }
  if (!(goal >= 0)) errors.goal = 'No puede ser negativa.';
  if (!(riskPercent >= 0 && riskPercent <= 100)) {
    errors.riskPercent = 'Entre 0 y 100.';
  }
  if (!(wins >= 0 && wins <= totalBets)) errors.wins = `Entre 0 y ${totalBets || 'N'}.`;
  if (!(losses >= 0 && losses <= totalBets)) errors.losses = `Entre 0 y ${totalBets || 'N'}.`;
  if (wins + losses > totalBets) {
    errors.wins = 'La suma de victorias y derrotas no puede superar el total de apuestas.';
  }
  return errors;
}

function Field({ label, name, value, onChange, type = 'number', step, min, error, hint, children }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      {children || (
        <input
          id={name}
          type={type}
          step={step}
          min={min}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={`input ${error ? 'border-rose-500' : ''}`}
        />
      )}
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export default function ConfigForm({ config, onChange }) {
  const errors = validateConfig(config);

  const set = (field, raw) => {
    const value = NUMERIC_FIELDS.includes(field)
      ? (raw === '' ? '' : Number(raw))
      : raw;
    onChange({ [field]: value });
  };

  return (
    <div className="card">
      <h2 className="mb-4 text-lg font-bold text-white">Configuración</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Capital inicial (COP)"
          name="initialCapital"
          value={config.initialCapital}
          onChange={set}
          min="0"
          step="1000"
          error={errors.initialCapital}
        />
        <Field
          label="Cuota decimal"
          name="odd"
          value={config.odd}
          onChange={set}
          min="1.01"
          step="0.01"
          error={errors.odd}
        />
        <Field
          label="Número total de apuestas"
          name="totalBets"
          value={config.totalBets}
          onChange={set}
          min="1"
          step="1"
          error={errors.totalBets}
        />
        <Field
          label="Meta de ganancias (COP)"
          name="goal"
          value={config.goal}
          onChange={set}
          min="0"
          step="10000"
          error={errors.goal}
        />
        <Field
          label="Modalidad de apuestas"
          name="mode"
          value={config.mode}
          onChange={set}
        >
          <select
            id="mode"
            value={config.mode}
            onChange={(e) => set('mode', e.target.value)}
            className="input"
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="% del capital a arriesgar"
          name="riskPercent"
          value={config.riskPercent}
          onChange={set}
          min="0"
          max="100"
          step="1"
          error={errors.riskPercent}
        />
        <Field
          label="Cantidad de apuestas ganadas"
          name="wins"
          value={config.wins}
          onChange={set}
          min="0"
          step="1"
          error={errors.wins}
        />
        <Field
          label="Cantidad de apuestas perdidas"
          name="losses"
          value={config.losses}
          onChange={set}
          min="0"
          step="1"
          error={errors.losses}
          hint="Las apuestas restantes (si las hay) se simulan como derrotas."
        />
      </div>
    </div>
  );
}
