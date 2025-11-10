import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import { Search, Sun, Moon, Plus, LogIn, LogOut, Edit, Trash2, Star, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  return { theme, setTheme }
}

function useToken() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const save = (t) => { setToken(t); localStorage.setItem('token', t || '') }
  const clear = () => save('')
  return { token, save, clear }
}

function Header({ onSearch, query, theme, toggleTheme, isAdmin, onLogout }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur bg-black/30 dark:bg-black/40 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="font-bold tracking-wide text-lg">Poetry Gallery</Link>
        <div className="flex-1" />
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-white/70" />
          <input value={query} onChange={(e)=>onSearch(e.target.value)} placeholder="Search poems..." className="w-full pl-10 pr-3 py-2 rounded-md bg-white/10 placeholder-white/70 text-white outline-none" />
        </div>
        <button onClick={toggleTheme} className="ml-3 p-2 rounded-md bg-white/10 hover:bg-white/20">
          {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>} 
        </button>
        {isAdmin ? (
          <button onClick={onLogout} className="ml-2 p-2 rounded-md bg-white/10 hover:bg-white/20"><LogOut size={18}/></button>
        ) : (
          <a href="/admin" className="ml-2 p-2 rounded-md bg-white/10 hover:bg-white/20"><LogIn size={18}/></a>
        )}
      </div>
    </div>
  )
}

function Hero({ featured }) {
  return (
    <div className="relative h-[60vh] min-h-[420px] w-full">
      <Spline scene="https://prod.spline.design/cEecEwR6Ehj4iT8T/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-10 left-6 md:left-12 text-white max-w-2xl">
        <div className="text-sm uppercase tracking-widest text-white/80">Featured</div>
        <h1 className="text-3xl md:text-5xl font-serif leading-tight">{featured?.title || 'Featured Poem'}</h1>
        <p className="mt-2 md:mt-4 text-white/90 max-w-xl">{featured?.excerpt}</p>
        <a href={featured ? `/poem/${featured.id}` : '#'} className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md">Read <ChevronRight size={18}/></a>
      </div>
    </div>
  )
}

function Carousel({ title, poems }) {
  return (
    <div className="mt-6">
      <div className="px-6 md:px-12 flex items-center gap-2 text-white/90"><h3 className="font-semibold">{title}</h3></div>
      <div className="overflow-x-auto pl-6 md:pl-12 py-3">
        <div className="flex gap-4">
          {poems.map(p => <PoemCard key={p.id} poem={p} />)}
        </div>
      </div>
    </div>
  )
}

function PoemCard({ poem }) {
  const cover = poem.coverImage ? (poem.coverImage.startsWith('http') ? poem.coverImage : `${API_BASE}${poem.coverImage}`) : null
  return (
    <a href={`/poem/${poem.id}`} className="group w-56 shrink-0">
      <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-orange-200 to-rose-200 dark:from-orange-400/20 dark:to-red-400/10 overflow-hidden">
        {cover ? (
          <img src={cover} alt={poem.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-800/80 dark:text-rose-200/80 font-serif p-4">{poem.title}</div>
        )}
      </div>
      <div className="mt-2 text-white">
        <div className="flex items-center gap-1">{poem.isFeatured && <Star className="text-yellow-400" size={16}/>}<h4 className="font-medium truncate">{poem.title}</h4></div>
        <p className="text-sm text-white/80 line-clamp-2">{poem.excerpt}</p>
      </div>
    </a>
  )
}

function Dashboard({ stats, onCreate }){
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 text-neutral-800 dark:text-neutral-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Total Poems</div>
          <div className="text-2xl font-semibold">{stats.total}</div>
        </div>
        <div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">Featured</div>
          <div className="text-2xl font-semibold">{stats.featured}</div>
        </div>
        <button onClick={onCreate} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700"><Plus size={16}/> New Poem</button>
      </div>
    </div>
  )
}

function AdminPanel(){
  const { token, save, clear } = useToken()
  const [list, setList] = useState([])
  const [username, setUsername] = useState('Irieimran')
  const [password, setPassword] = useState('aqsayanu')
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const stats = useMemo(()=>({ total: list.length, featured: list.filter(p=>p.isFeatured).length }),[list])

  const fetchPoems = async () => {
    const res = await fetch(`${API_BASE}/poems`)
    const data = await res.json()
    setList(data)
  }
  useEffect(()=>{ fetchPoems() },[])

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = new URLSearchParams()
      body.append('username', username)
      body.append('password', password)
      const res = await fetch(`${API_BASE}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      if(!res.ok) throw new Error('Login failed')
      const data = await res.json()
      save(data.access_token)
    } catch(err){ alert(err.message) } finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (p) => { setEditing(p); setFormOpen(true) }

  const handleDelete = async (id) => {
    if(!confirm('Delete this poem?')) return
    await fetch(`${API_BASE}/admin/poems/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchPoems()
  }

  const submitForm = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const isEdit = !!editing
    const url = isEdit ? `${API_BASE}/admin/poems/${editing.id}` : `${API_BASE}/admin/poems`
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd })
    if(!res.ok) return alert('Save failed')
    setFormOpen(false)
    form.reset()
    fetchPoems()
  }

  if(!token){
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <form onSubmit={login} className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full mb-2 px-3 py-2 rounded border dark:bg-neutral-800" />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full mb-4 px-3 py-2 rounded border dark:bg-neutral-800" />
          <button disabled={loading} className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700">{loading? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
        <button onClick={()=>{clear();}} className="text-white/80 hover:text-white flex items-center gap-2"><LogOut size={16}/> Logout</button>
      </div>
      <Dashboard stats={stats} onCreate={openCreate} />
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(p=> (
          <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-rose-200 to-orange-200 dark:from-rose-500/20 dark:to-orange-400/10">
              {p.coverImage && <img src={(p.coverImage.startsWith('http')?p.coverImage:`${API_BASE}${p.coverImage}`)} className="w-full h-full object-cover"/>}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.title}</div>
                {p.isFeatured && <Star className="text-yellow-500" size={16}/>} 
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">{p.excerpt}</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={()=>openEdit(p)} className="px-2 py-1 text-xs rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1"><Edit size={14}/> Edit</button>
                <button onClick={()=>handleDelete(p.id)} className="px-2 py-1 text-xs rounded bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1"><Trash2 size={14}/> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <motion.form initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} onSubmit={submitForm} className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-lg p-6">
              <div className="text-lg font-semibold mb-4">{editing? 'Edit Poem' : 'New Poem'}</div>
              <div className="grid gap-3">
                <input name="title" defaultValue={editing?.title||''} placeholder="Title" className="px-3 py-2 rounded border dark:bg-neutral-800" required />
                <input name="excerpt" defaultValue={editing?.excerpt||''} placeholder="Excerpt" className="px-3 py-2 rounded border dark:bg-neutral-800" required />
                <textarea name="content" defaultValue={editing?.content||''} placeholder="Full poem text" className="px-3 py-2 rounded border dark:bg-neutral-800 h-40" required />
                <input name="tags" defaultValue={editing? editing.tags.join(', ') : ''} placeholder="tags (comma separated)" className="px-3 py-2 rounded border dark:bg-neutral-800" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" defaultChecked={editing?.isFeatured||false} /> Featured</label>
                <input type="file" name="cover" accept="image/*" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={()=>setFormOpen(false)} className="px-3 py-2 rounded bg-neutral-200 dark:bg-neutral-800">Cancel</button>
                <button className="px-3 py-2 rounded bg-rose-600 text-white">Save</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PoemDetail(){
  const [poem, setPoem] = useState(null)
  const [related, setRelated] = useState([])
  const id = window.location.pathname.split('/').pop()
  useEffect(()=>{
    (async()=>{
      const res = await fetch(`${API_BASE}/poems/${id}`)
      const data = await res.json()
      setPoem(data)
      const rel = await fetch(`${API_BASE}/poems?tag=${encodeURIComponent(data.tags?.[0]||'')}`)
      setRelated(await rel.json())
    })()
  },[id])
  if(!poem) return null
  const cover = poem.coverImage ? (poem.coverImage.startsWith('http') ? poem.coverImage : `${API_BASE}${poem.coverImage}`) : null
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-neutral-100">
      <Header onSearch={()=>{}} query="" theme="dark" toggleTheme={()=>{}} isAdmin={!!localStorage.getItem('token')} onLogout={()=>{localStorage.removeItem('token'); location.reload()}} />
      <div className="h-16" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl md:text-5xl">{poem.title}</h1>
        <div className="mt-2 text-sm text-neutral-500">{poem.createdAt ? new Date(poem.createdAt).toLocaleDateString() : ''}</div>
        {cover && <img src={cover} className="mt-6 rounded-lg" />}
        <pre className="whitespace-pre-wrap font-serif leading-relaxed mt-6 text-lg">{poem.content}</pre>
        {poem.tags?.length>0 && (
          <div className="mt-6 flex flex-wrap gap-2">{poem.tags.map(t=> <span key={t} className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">#{t}</span>)}</div>
        )}
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <Carousel title="Related" poems={related.filter(p=>p.id!==poem.id)} />
      </div>
    </div>
  )
}

export default function App(){
  const { theme, setTheme } = useTheme()
  const { token, clear } = useToken()
  const [query, setQuery] = useState('')
  const [poems, setPoems] = useState([])

  const isAdmin = !!token

  const fetchPoems = async ()=>{
    const url = query ? `${API_BASE}/poems?search=${encodeURIComponent(query)}` : `${API_BASE}/poems`
    const res = await fetch(url)
    const data = await res.json()
    setPoems(data)
  }
  useEffect(()=>{ fetchPoems() },[])
  useEffect(()=>{ const t = setTimeout(fetchPoems, 400); return ()=>clearTimeout(t) },[query])

  const featured = poems.find(p=>p.isFeatured)
  const recent = poems.slice(0,10)
  const byTag = (tag)=> poems.filter(p=>p.tags?.includes(tag))

  const path = window.location.pathname
  if(path.startsWith('/admin')) return (
    <div className="min-h-screen bg-black text-white">
      <Header onSearch={()=>{}} query="" theme={theme} toggleTheme={()=>setTheme(theme==='dark'?'light':'dark')} isAdmin={isAdmin} onLogout={()=>{clear(); location.href='/'}} />
      <div className="h-16" />
      <AdminPanel />
    </div>
  )
  if(path.startsWith('/poem/')) return <PoemDetail />

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onSearch={setQuery} query={query} theme={theme} toggleTheme={()=>setTheme(theme==='dark'?'light':'dark')} isAdmin={isAdmin} onLogout={()=>{clear(); location.reload()}} />
      <div className="h-16" />
      <Hero featured={featured} />
      <div className="max-w-6xl mx-auto px-4">
        {featured && <Carousel title="Featured" poems={poems.filter(p=>p.isFeatured)} />}
        <Carousel title="Recent" poems={recent} />
        {['nature','city','night','rain','light'].map(tag=> (
          byTag(tag).length>0 && <Carousel key={tag} title={`#${tag}`} poems={byTag(tag)} />
        ))}
      </div>
    </div>
  )
}
