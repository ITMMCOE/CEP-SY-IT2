import { AppLogo } from '@/components/common/AppLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="mb-8">
        <AppLogo />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
