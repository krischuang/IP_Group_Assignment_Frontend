'use client'

import { useState } from 'react'

interface Props {
    id: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    required?: boolean
    minLength?: number
    autoComplete?: string
    autoFocus?: boolean
    error?: boolean
    className?: string
}

export default function PasswordInput({
    id,
    value,
    onChange,
    placeholder = '••••••••',
    required,
    minLength,
    autoComplete,
    autoFocus,
    error,
    className = '',
}: Props) {
    const [show, setShow] = useState(false)

    return (
        <div className="relative">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                className={`field-input pr-11 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
            />
            <button
                type="button"
                onClick={() => setShow((p) => !p)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-300/20 hover:text-ink-700"
            >
                {show ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.77 21.77 0 015.06-5.94 M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.77 21.77 0 01-3.17 4.4 M1 1l22 22" />
                        <path d="M14.12 14.12A3 3 0 019.88 9.88" />
                    </svg>
                ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    )
}
