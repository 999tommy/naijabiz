"use client"

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'

export default function LoginForm() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'puzzle' | 'credentials'>('puzzle')
    const [puzzleAnswer, setPuzzleAnswer] = useState('')
    async function checkPuzzle(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoading(true)
        const data = new FormData(event.currentTarget)
        setPuzzleAnswer(String(data.get('answer') || ''))
        try {
            const response = await fetch('/nimda/api/puzzle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: data.get('answer'), company: data.get('company') }) })
            const result = await response.json()
            if (result.puzzlePassed) { setStep('credentials'); return }
            if (result.redirect) { window.location.assign(result.redirect); return }
            setError(result.error || 'That answer did not match. Try again.')
        } catch { setError('Could not connect. Check your internet and try again.') }
        finally { setLoading(false) }
    }
    async function submitCredentials(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoading(true)
        const data = new FormData(event.currentTarget)
        try {
            const response = await fetch('/nimda/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: puzzleAnswer, email: data.get('email'), password: data.get('password'), company: data.get('company') }) })
            const result = await response.json()
            if (result.redirect) { window.location.assign(result.redirect); return }
            setError(result.error || 'Those details did not match. Try again.')
        } catch { setError('Could not connect. Check your internet and try again.') }
        finally { setLoading(false) }
    }
    return <main className="nimda-login-screen">
        <div className="nimda-login-card">
            <a className="nimda-brand" href="/"><Image src="/smal-logo.png" alt="Qriblo" width={42} height={42} priority/><b>Qriblo</b><small>ADMIN</small></a>
            <div className="nimda-login-icon"><ShieldCheck size={22}/></div>
            <p className="nimda-kicker">PRIVATE ADMIN AREA</p>
            <h1>Good morning.<br/><em>Let’s get to work.</em></h1>
            <p className="nimda-login-copy">Answer the check, then sign in with your approved admin email and password.</p>
            {step === 'puzzle' ? <form onSubmit={checkPuzzle} className="nimda-login-form">
                <label htmlFor="answer">What came first, the chicken or the egg?</label>
                <input id="answer" name="answer" autoComplete="off" required placeholder="Type your answer in CAPITAL LETTERS" />
                <input className="nimda-honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                {error && <p className="nimda-form-error" role="alert">{error}</p>}
                <button type="submit" disabled={loading}>{loading ? 'Checking…' : 'Continue'}<ArrowRight size={16}/></button>
            </form> : <form onSubmit={submitCredentials} className="nimda-login-form">
                <div className="nimda-puzzle-passed"><ShieldCheck size={14}/> Puzzle passed</div>
                <label htmlFor="email">Admin email</label>
                <input id="email" name="email" type="email" autoComplete="username" required placeholder="name@example.com" />
                <label htmlFor="password">Password</label>
                <div className="nimda-password-wrap"><LockKeyhole size={16}/><input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" /></div>
                <input className="nimda-honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                {error && <p className="nimda-form-error" role="alert">{error}</p>}
                <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Open admin dashboard'}<ArrowRight size={16}/></button>
                <button type="button" className="nimda-back-button" onClick={()=>{setStep('puzzle');setError('')}}>Back to the first step</button>
            </form>}
            <p className="nimda-lock-note"><LockKeyhole size={13}/> Three wrong tries lock this device for 24 hours.</p>
        </div>
        <div className="nimda-login-footer">Qriblo Admin <span/> Private access for the team</div>
    </main>
}
