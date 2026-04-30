const records = [
  {
    id: 1,
    userId: 1,
    date: '2026-04-22',
    vehicleType: 'Car',
    liters: 45.2,
    distanceKm: 520,
    totalCost: 72.30
  },
  {
    id: 2,
    userId: 1,
    date: '2026-04-25',
    vehicleType: 'Motorcycle',
    liters: 12.4,
    distanceKm: 220,
    totalCost: 19.60
  },
  {
    id: 3,
    userId: 2,
    date: '2026-05-03',
    vehicleType: 'Car',
    liters: 38.0,
    distanceKm: 470,
    totalCost: 61.50
  }
];

function findRecordById(id) {
  return records.find((record) => record.id === Number(id));
}

function createRecord(data) {
  const nextId = records.length ? Math.max(...records.map((r) => r.id)) + 1 : 1;
  const record = {
    id: nextId,
    userId: Number(data.userId),
    date: data.date,
    vehicleType: data.vehicleType,
    liters: Number(data.liters),
    distanceKm: Number(data.distanceKm),
    totalCost: Number(data.totalCost)
  };
  records.push(record);
  return record;
}

function updateRecord(id, data) {
  const record = findRecordById(id);
  if (!record) return null;
  record.date = data.date;
  record.vehicleType = data.vehicleType;
  record.liters = Number(data.liters);
  record.distanceKm = Number(data.distanceKm);
  record.totalCost = Number(data.totalCost);
  return record;
}

function deleteRecord(id, userId) {
  const index = records.findIndex((record) => record.id === Number(id) && record.userId === Number(userId));
  if (index === -1) return false;
  records.splice(index, 1);
  return true;
}

function getRecordsByUser(userId) {
  return records
    .filter((record) => record.userId === Number(userId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function computeKmPerLiter(record) {
  return record.liters > 0 ? Number((record.distanceKm / record.liters).toFixed(2)) : 0;
}

function summarizeByWeek(recordsList) {
  const summary = {};
  recordsList.forEach((record) => {
    const date = new Date(record.date);
    const day = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
    const label = weekStart.toISOString().slice(0, 10);
    if (!summary[label]) summary[label] = 0;
    summary[label] += record.totalCost;
  });
  return Object.entries(summary).map(([weekStart, amount]) => ({ weekStart, totalCost: Number(amount.toFixed(2)) })).sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
}

function summarizeByMonth(recordsList) {
  const summary = {};
  recordsList.forEach((record) => {
    const date = new Date(record.date);
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!summary[label]) summary[label] = 0;
    summary[label] += record.totalCost;
  });
  return Object.entries(summary).map(([month, amount]) => ({ month, totalCost: Number(amount.toFixed(2)) })).sort((a, b) => a.month < b.month ? 1 : -1);
}

function getRecordsByUserId(userId) {
  return records.filter((record) => record.userId === Number(userId));
}

module.exports = {
  records,
  findRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordsByUser,
  computeKmPerLiter,
  summarizeByWeek,
  summarizeByMonth
};
