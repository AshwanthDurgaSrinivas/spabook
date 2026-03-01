import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function SocialSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const handleSuccess = async () => {
            const type = searchParams.get('type');

            if (type === 'social') {
                // In a real app, we'd get a token from the backend session or URL
                // Here we mock a successful social login
                toast.success('Successfully logged in with Google');

                // Mocking the behavior for demonstration
                // In production, the backend would have set a cookie or we'd exchange a code for a JWT
                setTimeout(() => {
                    navigate('/customer/appointments');
                }, 1500);
            } else {
                navigate('/login');
            }
        };

        handleSuccess();
    }, [searchParams, navigate, login]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
            <div className="p-8 bg-white rounded-3xl shadow-xl shadow-indigo-100 flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <h1 className="text-2xl font-bold text-gray-800">Authenticating...</h1>
                <p className="text-gray-500 text-center">Finalizing your secure session</p>
            </div>
        </div>
    );
}
