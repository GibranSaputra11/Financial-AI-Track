const formatRupiah = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0';
  const num = Number(amount);
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatRupiahSigned = (amount, type) => {
  const formatted = formatRupiah(Math.abs(amount));
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
};

const parseRupiah = (str) => {
  if (!str) return 0;
  const s = String(str);
  return parseInt(s.replace(/[^\d]/g, ''), 10) || 0;
};

const getCategoryIcon = (category) => {
  const icons = {
    Kos: '🏠',
    Makan: '🍜',
    'Tugas/Print': '📄',
    Nongkrong: '☕',
    Transportasi: '🛵',
    Lainnya: '📦',
  };
  return icons[category] || '📦';
};

const getCategoryColor = (category) => {
  const colors = {
    Kos: 'bg-blue-100 text-blue-800',
    Makan: 'bg-orange-100 text-orange-800',
    'Tugas/Print': 'bg-purple-100 text-purple-800',
    Nongkrong: 'bg-pink-100 text-pink-800',
    Transportasi: 'bg-green-100 text-green-800',
    Lainnya: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

const getRemainingDays = () => {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diffTime = endOfMonth - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDaysInMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusFromBudget = (remainingBudget, monthlyBudget) => {
  if (monthlyBudget <= 0) return { status: 'AMAN', class: 'bg-brand-forest text-white' };
  const ratio = remainingBudget / monthlyBudget;
  if (ratio >= 0.3) return { status: 'AMAN', class: 'bg-brand-forest text-white' };
  if (ratio >= 0.1) return { status: 'WASPADA', class: 'bg-orange-500 text-white' };
  return { status: 'KRITIS', class: 'bg-red-500 text-white' };
};

const getDailyAllowance = (remainingBudget, remainingDays) => {
  if (remainingDays <= 0) return 0;
  return Math.floor(remainingBudget / remainingDays);
};

module.exports = {
  formatRupiah,
  formatRupiahSigned,
  parseRupiah,
  getCategoryIcon,
  getCategoryColor,
  getRemainingDays,
  getDaysInMonth,
  formatDate,
  formatDateShort,
  getStatusFromBudget,
  getDailyAllowance,
};