import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6 flex flex-col items-center w-full">
                    {/* Full Width Login Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#8fbdf8] hover:bg-[#3897f0] text-white font-bold py-2.5 rounded-3xl transition-colors focus:outline-none disabled:opacity-50"
                    >
                        Log in
                    </button>
                </div>
            </form>

            <div className="mt-4 flex flex-col items-center w-full">
                {/* Centered Forgot Password */}
                {canResetPassword && (
                    <Link
                        href={route('password.request')}
                        className="text-[13px] text-gray-900 font-semibold hover:text-gray-600 focus:outline-none"
                    >
                        Forgot password?
                    </Link>
                )}

                {/* Padding / Spacer */}
                <div className="w-full mt-10 mb-4 pb-4 border-b border-gray-100"></div>

                {/* Create New Account Button (Outlined) */}
                <Link
                    href={route('register')}
                    className="w-full flex items-center justify-center border border-[#1877f2] text-[#1877f2] font-semibold py-2.5 rounded-full hover:bg-blue-50 focus:outline-none transition-colors"
                >
                    Create new account
                </Link>
            </div>
        </GuestLayout>
    );
}
