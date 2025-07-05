'use client'

import { Suspense } from 'react'
import ResetPasswordForm from './resetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}