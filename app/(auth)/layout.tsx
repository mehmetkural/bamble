export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bamble</h1>
          <p className="text-gray-500 mt-1">Find your people, discover your city</p>
        </div>
        {children}
      </div>
    </div>
  )
}
