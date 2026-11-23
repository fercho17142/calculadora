/**
 * Servicio de historial.
 *
 * Usa PostgreSQL/Prisma cuando la base de datos está disponible.
 * Si Prisma no está generado o la conexión falla en tiempo de ejecución,
 * degrada automáticamente a un almacenamiento en memoria (no persistente)
 * para que la aplicación siga funcionando en modo desarrollo.
 */

let prisma = null;
let dbError = null;

try {
  // eslint-disable-next-line global-require
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (err) {
  dbError = err.message;
}

const memoryStore = new Map();
let memoryId = 1;

function getDbStatus() {
  return { available: prisma !== null, error: dbError };
}

function disablePrisma(err) {
  if (prisma) {
    console.warn('[Historial] Base de datos no disponible, usando memoria:', err.message);
    prisma = null;
    dbError = err.message;
  }
}

function mapRecord(r) {
  return {
    id: r.id,
    initialCapital: Number(r.initialCapital),
    odd: Number(r.odd),
    totalBets: Number(r.totalBets),
    goal: Number(r.goal),
    mode: r.mode,
    riskPercent: Number(r.riskPercent),
    wins: Number(r.wins),
    losses: Number(r.losses),
    finalCapital: Number(r.finalCapital),
    netGain: Number(r.netGain),
    profitability: Number(r.profitability),
    totalStaked: Number(r.totalStaked),
    totalReturned: Number(r.totalReturned),
    goalAchieved: Boolean(r.goalAchieved),
    resultsJson: r.resultsJson || null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function buildPayload(data) {
  return {
    initialCapital: Number(data.initialCapital),
    odd: Number(data.odd),
    totalBets: Number(data.totalBets),
    goal: Number(data.goal),
    mode: data.mode,
    riskPercent: Number(data.riskPercent),
    wins: Number(data.wins),
    losses: Number(data.losses),
    finalCapital: Number(data.finalCapital),
    netGain: Number(data.netGain),
    profitability: Number(data.profitability),
    totalStaked: Number(data.totalStaked),
    totalReturned: Number(data.totalReturned),
    goalAchieved: Boolean(data.goalAchieved),
    resultsJson: data.resultsJson ? JSON.stringify(data.resultsJson) : null,
  };
}

function buildWhere(from, to) {
  const where = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }
  return where;
}

// ---------- Implementaciones en memoria ----------

function memoryList({ from, to } = {}) {
  let items = [...memoryStore.values()].map(mapRecord);
  if (from) items = items.filter((r) => new Date(r.createdAt) >= new Date(from));
  if (to) items = items.filter((r) => new Date(r.createdAt) <= new Date(to));
  return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function memoryGet(id) {
  const record = memoryStore.get(Number(id));
  return record ? mapRecord(record) : null;
}

function memoryCreate(data) {
  const now = new Date().toISOString();
  const record = { id: memoryId++, ...buildPayload(data), createdAt: now, updatedAt: now };
  memoryStore.set(record.id, record);
  return mapRecord(record);
}

function memoryUpdate(id, data) {
  const existing = memoryStore.get(Number(id));
  if (!existing) return null;
  const updated = {
    ...existing,
    ...data,
    resultsJson:
      data.resultsJson !== undefined
        ? (data.resultsJson ? JSON.stringify(data.resultsJson) : null)
        : existing.resultsJson,
    updatedAt: new Date().toISOString(),
  };
  memoryStore.set(Number(id), updated);
  return mapRecord(updated);
}

function memoryRemove(id) {
  return memoryStore.delete(Number(id));
}

// ---------- API pública con degradación ----------

async function list(opts = {}) {
  if (prisma) {
    try {
      const records = await prisma.historyRecord.findMany({
        where: buildWhere(opts.from, opts.to),
        orderBy: { createdAt: 'desc' },
      });
      return records.map(mapRecord);
    } catch (err) {
      disablePrisma(err);
    }
  }
  return memoryList(opts);
}

async function getById(id) {
  if (prisma) {
    try {
      const record = await prisma.historyRecord.findUnique({ where: { id: Number(id) } });
      return record ? mapRecord(record) : null;
    } catch (err) {
      disablePrisma(err);
    }
  }
  return memoryGet(id);
}

async function create(data) {
  if (prisma) {
    try {
      const record = await prisma.historyRecord.create({ data: buildPayload(data) });
      return mapRecord(record);
    } catch (err) {
      disablePrisma(err);
    }
  }
  return memoryCreate(data);
}

async function update(id, data) {
  if (prisma) {
    try {
      const record = await prisma.historyRecord.update({
        where: { id: Number(id) },
        data: buildPayload({ ...data }),
      });
      return mapRecord(record);
    } catch (err) {
      disablePrisma(err);
    }
  }
  return memoryUpdate(id, data);
}

async function remove(id) {
  if (prisma) {
    try {
      await prisma.historyRecord.delete({ where: { id: Number(id) } });
      return true;
    } catch (err) {
      disablePrisma(err);
    }
  }
  return memoryRemove(id);
}

module.exports = { getDbStatus, list, getById, create, update, remove };
