"use client"

import { useEffect } from "react"

export default function HomeGenScript() {
  useEffect(() => {
    const $ = (s) => document.querySelector(s)
    const errBox = $('#nb-error')
    const resultImg = $('#nb-result')
    const dl = $('#nb-download')
    const bal = $('#nb-balance')

    const showErr = (msg) => {
      if (!errBox) return
      errBox.textContent = String(msg || '')
      errBox.classList.toggle('hidden', !msg)
    }

    const setImg = (dataUrl) => {
      if (!resultImg) return
      if (dataUrl) {
        resultImg.src = dataUrl
        resultImg.classList.remove('hidden')
        if (dl) { dl.href = dataUrl; dl.classList.remove('hidden') }
      } else {
        resultImg.classList.add('hidden')
        if (dl) dl.classList.add('hidden')
      }
    }

    const fetchBalance = async () => {
      try {
        const r = await fetch('/api/session', { method: 'GET' })
        const j = await r.json().catch(() => null)
        if (j && typeof j.balance === 'number' && bal) bal.textContent = String(j.balance)
      } catch {}
    }
    fetchBalance()

    // Tabs
    const tabT2I = $('#tab-t2i')
    const tabI2I = $('#tab-i2i')
    const panelT2I = $('#panel-t2i')
    const panelI2I = $('#panel-i2i')

    const activate = (which) => {
      if (!panelT2I || !panelI2I || !tabT2I || !tabI2I) return
      if (which === 't2i') {
        panelT2I.classList.remove('hidden'); panelI2I.classList.add('hidden')
        tabT2I.classList.add('bg-yellow-600','text-white'); tabT2I.classList.remove('bg-white','text-gray-700','border')
        tabI2I.classList.add('bg-white','text-gray-700','border'); tabI2I.classList.remove('bg-yellow-600','text-white')
      } else {
        panelI2I.classList.remove('hidden'); panelT2I.classList.add('hidden')
        tabI2I.classList.add('bg-yellow-600','text-white'); tabI2I.classList.remove('bg-white','text-gray-700','border')
        tabT2I.classList.add('bg-white','text-gray-700','border'); tabT2I.classList.remove('bg-yellow-600','text-white')
      }
      showErr('')
      setImg(null)
    }

    const onT2I = async () => {
      const prompt = (document.querySelector('#t2i-prompt')?.value || '').trim()
      const btn = document.querySelector('#t2i-generate')
      if (!prompt) { showErr('Please enter a prompt.'); return }
      if (btn) btn.disabled = true
      showErr(''); setImg(null)
      try {
        const r = await fetch('/api/vertex/imagine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        })
        const j = await r.json().catch(() => null)
        if (!r.ok || !j || j.ok === false) throw new Error((j && j.error) || 'Failed to generate')
        if (j.dataUrl) setImg(j.dataUrl)
        if (typeof j.balance === 'number' && bal) bal.textContent = String(j.balance)
      } catch (e) {
        showErr(e?.message || String(e))
      } finally {
        if (btn) btn.disabled = false
      }
    }

    const onI2I = async () => {
      const prompt = (document.querySelector('#i2i-prompt')?.value || '').trim()
      const fileEl = document.querySelector('#i2i-file')
      const btn = document.querySelector('#i2i-generate')
      const file = fileEl?.files && fileEl.files[0]
      if (!file) { showErr('Please choose an image.'); return }
      if (!prompt) { showErr('Please enter an edit prompt.'); return }
      if (btn) btn.disabled = true
      showErr(''); setImg(null)
      try {
        const form = new FormData()
        form.append('prompt', prompt)
        form.append('image', file, file.name)
        const r = await fetch('/api/vertex/edit', { method: 'POST', body: form })
        const j = await r.json().catch(() => null)
        if (!r.ok || !j || j.ok === false) throw new Error((j && j.error) || 'Failed to edit')
        if (j.dataUrl) setImg(j.dataUrl)
        if (typeof j.balance === 'number' && bal) bal.textContent = String(j.balance)
      } catch (e) {
        showErr(e?.message || String(e))
      } finally {
        if (btn) btn.disabled = false
      }
    }

    tabT2I?.addEventListener('click', () => activate('t2i'))
    tabI2I?.addEventListener('click', () => activate('i2i'))
    document.querySelector('#t2i-generate')?.addEventListener('click', onT2I)
    document.querySelector('#i2i-generate')?.addEventListener('click', onI2I)
    activate('t2i')

    return () => {
      tabT2I?.removeEventListener('click', () => activate('t2i'))
      tabI2I?.removeEventListener('click', () => activate('i2i'))
      document.querySelector('#t2i-generate')?.removeEventListener('click', onT2I)
      document.querySelector('#i2i-generate')?.removeEventListener('click', onI2I)
    }
  }, [])

  return null
}
