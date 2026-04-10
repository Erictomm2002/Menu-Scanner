import Link from 'next/link'

interface AccessDeniedPageProps {
  searchParams: Promise<{ email?: string; error?: string }>
}

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams
  const email = params?.email

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-800 mb-4">
          Truy cập bị từ chối
        </h1>

        <p className="text-slate-600 mb-6">
          Email của bạn không có quyền truy cập vào ứng dụng này.
        </p>

        {email && (
          <div className="bg-slate-100 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-slate-500">Email của bạn:</p>
            <p className="font-mono text-slate-700">{email}</p>
          </div>
        )}

        <div className="border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-500 mb-4">
            Nếu bạn cần quyền truy cập, vui lòng liên hệ:
          </p>
          <a
            href="mailto:admin@ipos.vn"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            admin@ipos.vn
          </a>
        </div>

        <Link
          href="/"
          className="block mt-6 text-slate-500 hover:text-teal-600 transition-colors"
        >
          ← Quay về trang chủ
        </Link>
      </div>
    </div>
  )
}
