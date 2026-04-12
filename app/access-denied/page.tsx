import Link from 'next/link'
import { AccessDeniedForm } from '@/components/access-denied/access-denied-form'

interface AccessDeniedPageProps {
  searchParams: Promise<{ email?: string; error?: string }>
}

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams
  const email = params?.email

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#008080] to-[#20B2AA]">
              iPOS
            </span>
            <span className="text-xl font-light text-slate-400">Kit</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-teal-900/10 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-8 py-6 text-center border-b border-amber-100">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-1">
              Tài khoản chưa được kích hoạt
            </h1>
            <p className="text-sm text-slate-600">
              Email của bạn chưa có trong hệ thống cấp quyền
            </p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Email đăng ký:</span>
                <span className="font-mono text-sm text-slate-700">{email}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="px-8 py-6">
            <AccessDeniedForm email={email} />
          </div>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="block mt-6 text-center text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  )
}
