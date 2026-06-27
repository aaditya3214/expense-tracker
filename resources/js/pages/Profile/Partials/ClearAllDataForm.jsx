import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function ClearAllDataForm({ className = '' }) {
    const [confirmingDataClear, setConfirmingDataClear] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [processing, setProcessing] = useState(false);

    const confirmClear = () => {
        setConfirmingDataClear(true);
    };

    const handleClearAll = (e) => {
        e.preventDefault();
        if (confirmText !== 'CLEAR ALL') {
            return;
        }

        setProcessing(true);
        router.post(route('expenses.clear-all'), {}, {
            onFinish: () => {
                setProcessing(false);
                closeModal();
            }
        });
    };

    const closeModal = () => {
        setConfirmingDataClear(false);
        setConfirmText('');
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Clear Expense Data
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Permanently delete all of your uploaded receipts, added expenses, and vendor records.
                    Your user account settings, credentials, and profile will remain completely intact.
                </p>
            </header>

            <DangerButton onClick={confirmClear}>
                Clear All Data
            </DangerButton>

            <Modal show={confirmingDataClear} onClose={closeModal}>
                <form onSubmit={handleClearAll} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to clear your data?
                    </h2>

                    <p className="mt-2 text-sm text-red-600 font-medium">
                        🚨 WARNING: This action is permanent and cannot be undone. All expense records, receipt scans, and vendor entries will be completely wiped from your account.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="confirmText"
                            value="Please type CLEAR ALL to confirm"
                            className="text-gray-700 font-bold"
                        />

                        <TextInput
                            id="confirmText"
                            type="text"
                            name="confirmText"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="mt-1 block w-3/4 font-mono font-bold uppercase tracking-wider"
                            isFocused
                            placeholder="CLEAR ALL"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>

                        <DangerButton 
                            className="ms-3" 
                            disabled={confirmText !== 'CLEAR ALL' || processing}
                        >
                            {processing ? 'Clearing...' : 'Yes, Clear All Data'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
