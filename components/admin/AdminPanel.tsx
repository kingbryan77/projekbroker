
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';
import { Transaction, TransactionStatus, User, CompanyBankInfo } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import { 
    UsersIcon,
    BanknotesIcon,
    Cog6ToothIcon,
    ArrowLeftOnRectangleIcon,
    MagnifyingGlassIcon,
    UserPlusIcon,
    TrashIcon,
    XMarkIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    NoSymbolIcon,
    PlusIcon,
    MinusIcon,
    ComputerDesktopIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    getAllUsers,
    getAllTransactions,
    updateDepositStatus,
    updateWithdrawalStatus,
    companyBankInfoList,
    setCompanyBankInfoList,
    adminUpdateUserBalance,
    adminCreateUser,
    adminToggleUserStatus
  } = useTransactions();

  // View State
  const [activeView, setActiveView] = useState<'users' | 'transactions' | 'settings'>('users');

  // Data State
  const [bankList, setBankList] = useState<CompanyBankInfo[]>(companyBankInfoList);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Filters
  const [trxSearch, setTrxSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [trxFilter, setTrxFilter] = useState<'ALL' | 'PENDING' | 'WITHDRAWAL' | 'DEPOSIT'>('ALL');

  // Modals
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState<'add' | 'subtract'>('add');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Added username to state
  const [createData, setCreateData] = useState({
    fullName: '', email: '', username: '', phoneNumber: '', password: '', balance: '0', isAdmin: false, isVerified: true
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setBankList(companyBankInfoList);
  }, [companyBankInfoList]);

  const loadData = async () => {
    const u = await getAllUsers();
    setUsers(u);
    const t = await getAllTransactions();
    setTransactions(t);
  };

  const handleLogout = () => {
      logout();
      // App.tsx akan menangani redirect ke login karena status jadi UNAUTHENTICATED
  };

  // --- FILTERS ---
  const getFilteredUsers = () => {
      if(!userSearch.trim()) return users;
      const lower = userSearch.toLowerCase();
      return users.filter(u => 
        u.fullName.toLowerCase().includes(lower) || 
        u.email.toLowerCase().includes(lower) || 
        u.username.toLowerCase().includes(lower)
      );
  }

  const getFilteredTransactions = () => {
      let res = transactions;
      if (trxFilter === 'PENDING') res = res.filter(t => t.status === TransactionStatus.PENDING);
      else if (trxFilter === 'WITHDRAWAL') res = res.filter(t => t.type === 'WITHDRAWAL');
      else if (trxFilter === 'DEPOSIT') res = res.filter(t => t.type === 'DEPOSIT');

      if (trxSearch.trim()) {
          const lower = trxSearch.toLowerCase();
          res = res.filter(t => 
             t.id.toLowerCase().includes(lower) || 
             t.userId.toLowerCase().includes(lower) ||
             users.find(u => u.id === t.userId)?.email.toLowerCase().includes(lower)
          );
      }
      return res;
  };

  // --- ACTIONS ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    // Validasi Username
    if (!createData.username) {
        setCreateError("Username wajib diisi.");
        return;
    }
    const success = await adminCreateUser({
        ...createData,
        balance: parseFloat(createData.balance) || 0
    });
    if (success) {
        setIsCreateModalOpen(false);
        setCreateData({ fullName: '', email: '', username: '', phoneNumber: '', password: '', balance: '0', isAdmin: false, isVerified: true });
        loadData();
    } else {
        setCreateError("Gagal membuat user.");
    }
  };

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance || !balanceAmount) return;
    await adminUpdateUserBalance(selectedUserForBalance.id, parseFloat(balanceAmount), balanceType);
    setIsBalanceModalOpen(false);
    setSelectedUserForBalance(null);
    setBalanceAmount('');
    loadData();
  };

  const handleToggleStatus = async (u: User) => {
      if(confirm(`Ubah status user ${u.fullName}?`)) {
          await adminToggleUserStatus(u.id, u.isVerified);
          loadData();
      }
  }

  const handleStatusChange = async (t: Transaction, newStatus: string) => {
      const status = newStatus as TransactionStatus;
      if (t.type === 'DEPOSIT') await updateDepositStatus(t.id, status);
      else if (t.type === 'WITHDRAWAL') await updateWithdrawalStatus(t.id, status);
      loadData();
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-[#0B0E11] font-sans text-gray-300 overflow-hidden">
        
        {/* SIDEBAR (Control Panel) */}
        <aside className="w-64 bg-[#151922] border-r border-gray-800 flex flex-col flex-shrink-0 z-50">
            {/* Header Sidebar */}
            <div className="h-[60px] flex items-center px-6 border-b border-gray-800 bg-[#0B0E11]">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-3 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <h1 className="text-white font-bold tracking-wider uppercase text-xs">CONTROL PANEL</h1>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                <button 
                    onClick={() => setActiveView('users')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded transition-all duration-200 ${
                        activeView === 'users' 
                        ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }`}
                >
                    <UsersIcon className="w-5 h-5 mr-3" />
                    Manajemen User
                </button>
                <button 
                    onClick={() => setActiveView('transactions')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded transition-all duration-200 ${
                        activeView === 'transactions' 
                        ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }`}
                >
                    <BanknotesIcon className="w-5 h-5 mr-3" />
                    Transaksi & Approval
                </button>
                <button 
                    onClick={() => setActiveView('settings')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded transition-all duration-200 ${
                        activeView === 'settings' 
                        ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                    }`}
                >
                    <Cog6ToothIcon className="w-5 h-5 mr-3" />
                    Pengaturan Bank
                </button>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#0B0E11]">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs font-bold text-white mr-3 border border-gray-700">
                        AD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-white text-xs font-bold truncate">{user?.username}</p>
                        <p className="text-gray-500 text-[9px] uppercase tracking-wider">Administrator</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full flex items-center justify-center px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors mb-2"
                >
                    <ComputerDesktopIcon className="w-3.5 h-3.5 mr-2" />
                    Lihat Web User
                </button>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-xs font-bold text-danger hover:bg-danger/10 border border-danger/20 rounded transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5 mr-2" />
                    Keluar Panel
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT (RIGHT SIDE) */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0B0E11]">
            
            {/* Header Content */}
            <header className="h-[60px] bg-[#151922] border-b border-gray-800 flex items-center justify-between px-6 shadow-md z-40">
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                    {activeView === 'users' && 'DATA PENGGUNA'}
                    {activeView === 'transactions' && 'DATA TRANSAKSI'}
                    {activeView === 'settings' && 'PENGATURAN BANK'}
                </h2>
                <div className="flex items-center space-x-4">
                     <span className="text-[10px] text-green-500 font-mono bg-green-500/10 px-2 py-1 rounded border border-green-500/20">System Online</span>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
                
                {/* --- VIEW: MANAJEMEN USER --- */}
                {activeView === 'users' && (
                    <div className="space-y-4 animate-fade-in">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row justify-between gap-4 bg-[#151922] p-4 rounded border border-gray-800">
                            <div className="relative w-full md:w-96">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Cari nama, email, username..." 
                                    className="w-full bg-[#0B0E11] border border-gray-700 rounded pl-9 pr-3 py-2 text-xs text-white focus:border-primary outline-none transition-colors"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>
                            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="!text-xs !py-2 !px-4">
                                <PlusIcon className="w-3 h-3 mr-2" /> Tambah User
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="bg-[#151922] border border-gray-800 rounded overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-[#0B0E11]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">User Identity</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Credentials (Admin View)</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Saldo (IDR)</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kontrol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {getFilteredUsers().map(u => (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-white font-bold text-xs mb-0.5">{u.fullName}</div>
                                                <div className="text-gray-500 text-[10px]">{u.email}</div>
                                                <div className="text-gray-500 text-[10px]">{u.phoneNumber}</div>
                                            </td>
                                            {/* KOLOM USERNAME DAN PASSWORD */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center text-xs text-blue-400">
                                                        <span className="w-16 text-gray-500 text-[9px] uppercase font-bold">Username:</span>
                                                        <span className="font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{u.username}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-red-400">
                                                        <span className="w-16 text-gray-500 text-[9px] uppercase font-bold">Password:</span>
                                                        <span className="font-mono bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 flex items-center">
                                                            <KeyIcon className="w-3 h-3 mr-1"/>
                                                            {u.visiblePassword || '******'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-white font-mono font-bold text-xs">
                                                    {u.balance.toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${u.isVerified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {u.isVerified ? 'Active' : 'Banned'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => { setSelectedUserForBalance(u); setBalanceAmount(''); setBalanceType('add'); setIsBalanceModalOpen(true); }} className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition-colors border border-blue-500/20" title="Atur Saldo">
                                                        <CurrencyDollarIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleToggleStatus(u)} className={`p-1.5 rounded transition-colors border ${u.isVerified ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border-green-500/20'}`} title={u.isVerified ? "Blokir" : "Aktifkan"}>
                                                        {u.isVerified ? <NoSymbolIcon className="w-3.5 h-3.5" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- VIEW: TRANSAKSI (SAMA SEPERTI SEBELUMNYA) --- */}
                {activeView === 'transactions' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex flex-col md:flex-row justify-between gap-4 bg-[#151922] p-4 rounded border border-gray-800">
                            <div className="flex space-x-2">
                                <button onClick={() => setTrxFilter('ALL')} className={`px-3 py-1.5 text-[10px] font-bold rounded border ${trxFilter === 'ALL' ? 'bg-primary text-white border-primary' : 'bg-[#0B0E11] text-gray-400 border-gray-700 hover:border-gray-500'}`}>ALL</button>
                                <button onClick={() => setTrxFilter('PENDING')} className={`px-3 py-1.5 text-[10px] font-bold rounded border ${trxFilter === 'PENDING' ? 'bg-warning text-black border-warning' : 'bg-[#0B0E11] text-gray-400 border-gray-700 hover:border-gray-500'}`}>PENDING</button>
                                <button onClick={() => setTrxFilter('WITHDRAWAL')} className={`px-3 py-1.5 text-[10px] font-bold rounded border ${trxFilter === 'WITHDRAWAL' ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#0B0E11] text-gray-400 border-gray-700 hover:border-gray-500'}`}>WD</button>
                                <button onClick={() => setTrxFilter('DEPOSIT')} className={`px-3 py-1.5 text-[10px] font-bold rounded border ${trxFilter === 'DEPOSIT' ? 'bg-blue-500 text-white border-blue-500' : 'bg-[#0B0E11] text-gray-400 border-gray-700 hover:border-gray-500'}`}>DEPO</button>
                            </div>
                            <div className="relative w-full md:w-64">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Cari ID transaksi..." 
                                    className="w-full bg-[#0B0E11] border border-gray-700 rounded pl-9 pr-3 py-2 text-xs text-white focus:border-primary outline-none transition-colors"
                                    value={trxSearch}
                                    onChange={(e) => setTrxSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-[#151922] border border-gray-800 rounded overflow-hidden">
                             <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-[#0B0E11]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Waktu & ID</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tipe & Nominal</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {getFilteredTransactions().map(t => {
                                        const userDetail = users.find(u => u.id === t.userId);
                                        return (
                                        <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-gray-300 text-[10px]">{new Date(t.date).toLocaleString()}</div>
                                                <div className="text-gray-500 font-mono text-[10px] uppercase mt-0.5">#{t.id.substring(0,8)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white text-xs font-bold">{userDetail?.fullName || 'Unknown'}</div>
                                                <div className="text-gray-500 text-[10px]">{userDetail?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${t.type === 'DEPOSIT' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : t.type === 'WITHDRAWAL' ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' : 'text-purple-400 border-purple-400/20'}`}>
                                                        {t.type === 'WITHDRAWAL' ? 'WD' : 'DP'}
                                                    </span>
                                                    <span className="text-white font-mono font-bold text-xs">
                                                        Rp {t.amount.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                {t.type === 'WITHDRAWAL' && (
                                                    <div className="text-[9px] text-gray-500 mt-1 italic">
                                                        {(t as any).bankOrEwalletName} - {(t as any).accountNumber}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase border ${
                                                    t.status === TransactionStatus.SUCCESS ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    t.status === TransactionStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {t.status === TransactionStatus.PENDING && (
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => {
                                                            if(confirm('Setujui transaksi ini?')) handleStatusChange(t, TransactionStatus.SUCCESS);
                                                        }} className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 text-[10px] rounded font-bold shadow transition-colors">
                                                            Approve
                                                        </button>
                                                        <button onClick={() => {
                                                             if(confirm('Tolak transaksi ini?')) handleStatusChange(t, TransactionStatus.REJECTED);
                                                        }} className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 text-[10px] rounded font-bold shadow transition-colors">
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {t.status !== TransactionStatus.PENDING && (
                                                    <span className="text-gray-600 text-[10px] italic">Selesai</span>
                                                )}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                             </table>
                        </div>
                    </div>
                )}

                {/* --- VIEW: PENGATURAN BANK --- */}
                {activeView === 'settings' && (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <div className="bg-[#151922] border border-gray-800 rounded p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white text-sm font-bold uppercase tracking-wide">Rekening Bank Perusahaan</h3>
                                <Button size="sm" onClick={() => setBankList([...bankList, { bankName: '', accountNumber: '', accountHolderName: '' }])} className="!text-xs">
                                    <PlusIcon className="w-3 h-3 mr-2" /> Tambah Bank
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                {bankList.map((bank, index) => (
                                    <div key={index} className="bg-[#0B0E11] p-4 rounded border border-gray-700 flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="text-[10px] text-gray-500 mb-1 block uppercase font-bold">Nama Bank</label>
                                            <input type="text" className="w-full bg-[#151922] border border-gray-600 rounded px-3 py-2 text-xs text-white outline-none focus:border-primary transition-colors" 
                                                value={bank.bankName} onChange={e => {
                                                    const list = [...bankList]; list[index].bankName = e.target.value; setBankList(list);
                                                }} 
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="text-[10px] text-gray-500 mb-1 block uppercase font-bold">No. Rekening</label>
                                            <input type="text" className="w-full bg-[#151922] border border-gray-600 rounded px-3 py-2 text-xs text-white font-mono outline-none focus:border-primary transition-colors" 
                                                value={bank.accountNumber} onChange={e => {
                                                    const list = [...bankList]; list[index].accountNumber = e.target.value; setBankList(list);
                                                }} 
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="text-[10px] text-gray-500 mb-1 block uppercase font-bold">Atas Nama</label>
                                            <input type="text" className="w-full bg-[#151922] border border-gray-600 rounded px-3 py-2 text-xs text-white outline-none focus:border-primary transition-colors" 
                                                value={bank.accountHolderName} onChange={e => {
                                                    const list = [...bankList]; list[index].accountHolderName = e.target.value; setBankList(list);
                                                }} 
                                            />
                                        </div>
                                        <button onClick={() => {
                                            const list = bankList.filter((_, i) => i !== index); setBankList(list);
                                        }} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white mb-[1px] border border-red-500/20 transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-700 flex justify-end">
                                <Button onClick={() => { setCompanyBankInfoList(bankList); alert('Data Bank Tersimpan'); }} className="!text-xs">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>

        {/* --- MODAL: BALANCE --- */}
        {isBalanceModalOpen && selectedUserForBalance && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#151922] border border-gray-700 rounded-lg w-full max-w-sm overflow-hidden shadow-2xl">
                    <div className="p-4 bg-[#0B0E11] border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm">KELOLA SALDO</h3>
                        <button onClick={() => setIsBalanceModalOpen(false)}><XMarkIcon className="w-4 h-4 text-gray-500 hover:text-white"/></button>
                    </div>
                    <form onSubmit={handleBalanceSubmit} className="p-6">
                        <div className="text-center mb-6">
                            <p className="text-gray-500 text-xs mb-1">Saldo Saat Ini</p>
                            <p className="text-2xl font-bold text-white font-mono">Rp {selectedUserForBalance.balance.toLocaleString('id-ID')}</p>
                            <p className="text-primary text-xs mt-1 font-bold">{selectedUserForBalance.fullName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                             <button type="button" onClick={() => setBalanceType('add')} className={`p-3 rounded border text-center transition-colors ${balanceType === 'add' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-[#0B0E11] border-gray-700 text-gray-500'}`}>
                                 <PlusIcon className="w-5 h-5 mx-auto mb-1"/> 
                                 <span className="text-xs font-bold">TAMBAH</span>
                             </button>
                             <button type="button" onClick={() => setBalanceType('subtract')} className={`p-3 rounded border text-center transition-colors ${balanceType === 'subtract' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[#0B0E11] border-gray-700 text-gray-500'}`}>
                                 <MinusIcon className="w-5 h-5 mx-auto mb-1"/> 
                                 <span className="text-xs font-bold">KURANG</span>
                             </button>
                        </div>
                        <Input 
                            id="balAmount" 
                            label="Nominal (Rp)" 
                            type="number" 
                            value={balanceAmount} 
                            onChange={e => setBalanceAmount(e.target.value)} 
                            className="mb-6 !bg-[#0B0E11] !text-sm"
                        />
                        <Button fullWidth type="submit" variant={balanceType === 'add' ? 'primary' : 'danger'} className="!text-sm">
                            KONFIRMASI
                        </Button>
                    </form>
                </div>
            </div>
        )}

        {/* --- MODAL: CREATE USER --- */}
        {isCreateModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                 <div className="bg-[#151922] border border-gray-700 rounded-lg w-full max-w-lg overflow-hidden shadow-2xl">
                    <div className="p-4 bg-[#0B0E11] border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-white font-bold text-sm">TAMBAH USER BARU</h3>
                        <button onClick={() => setIsCreateModalOpen(false)}><XMarkIcon className="w-4 h-4 text-gray-500 hover:text-white"/></button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                        {createError && <div className="bg-red-500/20 text-red-500 p-2 rounded text-xs border border-red-500/20">{createError}</div>}
                        <div className="grid grid-cols-2 gap-4">
                             {/* USERNAME INPUT ADDED */}
                            <Input id="newUsername" label="Username" value={createData.username} onChange={e => setCreateData({...createData, username: e.target.value})} className="!bg-[#0B0E11] !text-xs"/>
                            <Input id="newEmail" label="Email" value={createData.email} onChange={e => setCreateData({...createData, email: e.target.value})} className="!bg-[#0B0E11] !text-xs"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input id="newPass" label="Password" value={createData.password} onChange={e => setCreateData({...createData, password: e.target.value})} className="!bg-[#0B0E11] !text-xs"/>
                            <Input id="newPhone" label="Phone" value={createData.phoneNumber} onChange={e => setCreateData({...createData, phoneNumber: e.target.value})} className="!bg-[#0B0E11] !text-xs"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input id="newName" label="Full Name" value={createData.fullName} onChange={e => setCreateData({...createData, fullName: e.target.value})} className="!bg-[#0B0E11] !text-xs"/>
                            <Input id="newBal" label="Saldo Awal" type="number" value={createData.balance} onChange={e => setCreateData({...createData, balance: e.target.value})} className="!bg-[#0B0E11] !text-xs"/>
                        </div>
                        
                        <div className="flex gap-4 p-2 bg-[#0B0E11] rounded border border-gray-700">
                            <label className="flex items-center text-xs text-gray-400 cursor-pointer hover:text-white"><input type="checkbox" className="mr-2 rounded bg-gray-700 border-gray-600" checked={createData.isAdmin} onChange={e => setCreateData({...createData, isAdmin: e.target.checked})}/> Grant Admin Privileges</label>
                            <label className="flex items-center text-xs text-gray-400 cursor-pointer hover:text-white"><input type="checkbox" className="mr-2 rounded bg-gray-700 border-gray-600" checked={createData.isVerified} onChange={e => setCreateData({...createData, isVerified: e.target.checked})}/> Mark as Verified</label>
                        </div>
                        <Button fullWidth type="submit" className="!text-sm">BUAT AKUN</Button>
                    </form>
                 </div>
            </div>
        )}

    </div>
  );
};

export default AdminPanel;
