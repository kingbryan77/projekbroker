import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const SecurityPage: React.FC = () => {
  const { changePassword, user } = useAuth();
  const { addNotification } = useTransactions();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
        setMessage({type: 'error', text: 'Password minimal 6 karakter'});
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessage({type: 'error', text: 'Konfirmasi password tidak cocok'});
        return;
    }

    setIsLoading(true);
    const result = await changePassword(newPassword);
    
    if (result.success) {
        setMessage({type: 'success', text: 'Password berhasil diubah.'});
        setNewPassword('');
        setConfirmPassword('');
        // Notifikasi ke user
        addNotification(`Anda telah mengubah password Anda pada ${new Date().toLocaleString()}.`);
    } else {
        setMessage({type: 'error', text: result.message});
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Security Settings</h2>
      
      <div className="bg-darkblue2 p-6 rounded-lg shadow-md max-w-xl">
        <h3 className="text-xl text-white font-bold mb-4 flex items-center">
            <LockClosedIcon className="w-6 h-6 mr-2 text-primary" />
            Ubah Password
        </h3>
        
        <p className="text-gray-400 mb-6 text-sm">
          Untuk keamanan akun, disarankan menggunakan kombinasi huruf, angka, dan simbol. 
          Perubahan password akan langsung dinotifikasi ke sistem keamanan kami.
        </p>

        {message && (
            <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                {message.text}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                id="newPass" 
                label="Password Baru" 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="******"
            />
             <Input 
                id="confirmPass" 
                label="Konfirmasi Password Baru" 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="******"
            />
            
            <div className="pt-2">
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    Simpan Password Baru
                </Button>
            </div>
        </form>
      </div>

      <div className="mt-8 bg-darkblue2 p-6 rounded-lg shadow-md max-w-xl opacity-75">
          <h3 className="text-lg text-white font-bold mb-2">Two-Factor Authentication (2FA)</h3>
          <p className="text-gray-500 text-sm mb-4">Fitur ini akan segera tersedia.</p>
          <Button variant="secondary" disabled>Enable 2FA</Button>
      </div>
    </div>
  );
};

export default SecurityPage;