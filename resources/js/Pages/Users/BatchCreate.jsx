import { useState, useRef } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import Button from '@/components/ui/Button';

import {
    ArrowLeft, Save, Plus, Trash2, Download, Upload,
    FileSpreadsheet, Key, Sparkles, Check, AlertCircle,
    FileText, UserPlus, Shield, UserCheck, GraduationCap
} from 'lucide-react';

export default function UserBatchCreate({ roles = [] }) {
    const [activeTab, setActiveTab] = useState('table'); // 'table' | 'csv'
    const fileInputRef = useRef(null);

    // Initial 3 rows for table mode
    const [rows, setRows] = useState([
        { id: 1, name: '', email: '', password: 'password123', role: 'user' },
        { id: 2, name: '', email: '', password: 'password123', role: 'pengurus' },
        { id: 3, name: '', email: '', password: 'password123', role: 'user' },
    ]);

    // CSV Mode state
    const [csvFile, setCsvFile] = useState(null);
    const [csvText, setCsvText] = useState('');
    const [previewCsvRows, setPreviewCsvRows] = useState([]);
    const [csvParseError, setCsvParseError] = useState(null);

    // Inertia form
    const { data, setData, post, processing, errors } = useForm({
        mode: 'table',
        users: [],
        file: null,
        csv_text: '',
    });

    // ── Table Mode Handlers ─────────────────────────────────────
    const handleAddRow = () => {
        const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
        setRows([
            ...rows,
            { id: nextId, name: '', email: '', password: 'password123', role: 'user' }
        ]);
    };

    const handleRemoveRow = (id) => {
        if (rows.length <= 1) return;
        setRows(rows.filter(r => r.id !== id));
    };

    const handleRowChange = (id, field, value) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSetDefaultPassword = () => {
        setRows(rows.map(r => ({ ...r, password: 'password123' })));
    };

    const handleSetAllRole = (roleValue) => {
        setRows(rows.map(r => ({ ...r, role: roleValue })));
    };

    const handleTableSubmit = (e) => {
        e.preventDefault();

        // Filter valid non-empty rows
        const validUsers = rows.filter(r => r.name.trim() !== '' && r.email.trim() !== '');
        if (validUsers.length === 0) {
            alert('Harap isi setidaknya satu baris nama dan email pengguna.');
            return;
        }

        setData('mode', 'table');
        setData('users', validUsers);

        // Submit via post
        post('/users/batch', {
            data: {
                mode: 'table',
                users: validUsers,
            }
        });
    };

    // ── CSV Mode Handlers ────────────────────────────────────────
    const parseCsvString = (text) => {
        setCsvParseError(null);
        if (!text || text.trim() === '') {
            setPreviewCsvRows([]);
            return;
        }

        try {
            const lines = text.trim().split(/\r\n|\n|\r/);
            if (lines.length < 2) {
                setCsvParseError('Berkas CSV harus memiliki minimal baris header dan satu baris data.');
                setPreviewCsvRows([]);
                return;
            }

            const headerLine = lines[0].toLowerCase();
            const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

            const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('nama'));
            const emailIdx = headers.findIndex(h => h.includes('email'));
            const passIdx = headers.findIndex(h => h.includes('pass') || h.includes('sandi'));
            const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('akses'));

            if (nameIdx === -1 || emailIdx === -1) {
                setCsvParseError('Kolom "name" dan "email" wajib ada pada header CSV.');
                setPreviewCsvRows([]);
                return;
            }

            const parsed = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
                const name = cols[nameIdx] || '';
                const email = cols[emailIdx] || '';
                const password = passIdx !== -1 && cols[passIdx] ? cols[passIdx] : 'password123';
                let role = roleIdx !== -1 && cols[roleIdx] ? cols[roleIdx].toLowerCase() : 'user';

                if (name && email) {
                    parsed.push({ name, email, password, role });
                }
            }

            if (parsed.length === 0) {
                setCsvParseError('Tidak ditemukan baris data pengguna yang valid dalam CSV.');
            }

            setPreviewCsvRows(parsed);
        } catch (err) {
            setCsvParseError('Gagal mem-parsing format CSV: ' + err.message);
            setPreviewCsvRows([]);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target.result;
            setCsvText(content);
            parseCsvString(content);
        };
        reader.readAsText(file);
    };

    const handleCsvSubmit = (e) => {
        e.preventDefault();

        if (previewCsvRows.length === 0) {
            alert('Tidak ada data pengguna yang valid dari berkas CSV untuk diimpor.');
            return;
        }

        post('/users/batch', {
            data: {
                mode: 'table',
                users: previewCsvRows,
            }
        });
    };

    return (
        <>
            <Head title="Tambah Pengguna Batch - Web GIS UAD" />

            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/users"
                            className="btn btn-ghost btn-sm p-2 text-gray-500 dark:text-slate-400"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="page-title text-xl">Pembuatan Pengguna Secara Batch</h1>
                            <p className="page-subtitle">
                                Tambahkan banyak akun sekaligus melalui tabel interaktif atau unggah berkas CSV
                            </p>
                        </div>
                    </div>

                    <a
                        href="/users/template/csv"
                        className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
                    >
                        <Download className="w-4 h-4" />
                        <span>Unduh Template CSV</span>
                    </a>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 text-sm font-medium">
                    <button
                        type="button"
                        onClick={() => setActiveTab('table')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'table'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Input Tabel Interaktif ({rows.length} Baris)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('csv')}
                        className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'csv'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        <span>Unggah Berkas / Tempel Teks CSV</span>
                    </button>
                </div>

                {/* TAB 1: INTERACTIVE TABLE MODE */}
                {activeTab === 'table' && (
                    <div className="space-y-4">
                        {/* Quick Action Toolbar */}
                        <div className="card p-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 dark:bg-slate-800/40">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-gray-600 dark:text-slate-300 mr-1">Aksi Cepat:</span>
                                <button
                                    type="button"
                                    onClick={handleSetDefaultPassword}
                                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                >
                                    <Key className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Reset Password Semua ke "password123"</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetAllRole('user')}
                                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                >
                                    <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Set Semua ke Civitas</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetAllRole('pengurus')}
                                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                                >
                                    <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Set Semua ke Pengurus</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="btn btn-secondary btn-sm flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Baris</span>
                            </button>
                        </div>

                        {/* Interactive Table Form */}
                        <form onSubmit={handleTableSubmit} className="space-y-4">
                            <div className="card overflow-hidden">
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th className="w-12 text-center">#</th>
                                                <th>Nama Lengkap <span className="text-red-500">*</span></th>
                                                <th>Alamat Email <span className="text-red-500">*</span></th>
                                                <th>Password <span className="text-red-500">*</span></th>
                                                <th className="w-56">Role Akses <span className="text-red-500">*</span></th>
                                                <th className="w-16 text-center">Hapus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, idx) => (
                                                <tr key={row.id}>
                                                    <td className="text-center text-xs font-mono text-gray-400">
                                                        {idx + 1}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.name}
                                                            onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
                                                            placeholder="Nama lengkap..."
                                                            className="form-input py-1.5 text-xs w-full"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="email"
                                                            value={row.email}
                                                            onChange={(e) => handleRowChange(row.id, 'email', e.target.value)}
                                                            placeholder="email@uad.ac.id"
                                                            className="form-input py-1.5 text-xs w-full"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.password}
                                                            onChange={(e) => handleRowChange(row.id, 'password', e.target.value)}
                                                            placeholder="Min. 8 karakter"
                                                            className="form-input py-1.5 text-xs w-full font-mono"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={row.role}
                                                            onChange={(e) => handleRowChange(row.id, 'role', e.target.value)}
                                                            className="form-select py-1.5 text-xs w-full"
                                                        >
                                                            <option value="user">Civitas Academica</option>
                                                            <option value="pengurus">Pengurus Lingkungan</option>
                                                            <option value="admin">Administrator</option>
                                                        </select>
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRow(row.id)}
                                                            disabled={rows.length <= 1}
                                                            className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Hapus baris ini"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={handleAddRow}
                                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Baris Baru</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <Link href="/users" className="btn btn-ghost btn-sm">
                                        Batal
                                    </Link>
                                    <Button type="submit" variant="primary" isLoading={processing}>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Semua Pengguna ({rows.filter(r => r.name && r.email).length} Baris)</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB 2: CSV UPLOAD / PASTE MODE */}
                {activeTab === 'csv' && (
                    <div className="space-y-6">
                        <div className="card p-6 space-y-6">
                            {/* Drag-and-Drop / File input box */}
                            <div>
                                <label className="form-label font-bold text-gray-800 dark:text-slate-200">
                                    Pilih Berkas CSV
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-800/30"
                                >
                                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                                        {csvFile ? csvFile.name : 'Klik untuk memilih berkas CSV dari komputer Anda'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                        Format berkas: .csv dengan kolom name, email, password, role
                                    </p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".csv,text/csv,text/plain"
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Or paste CSV content */}
                            <div>
                                <label className="form-label text-xs font-semibold text-gray-600 dark:text-slate-400">
                                    Atau Tempel (Paste) Konten CSV Langsung
                                </label>
                                <textarea
                                    rows={4}
                                    value={csvText}
                                    onChange={(e) => {
                                        setCsvText(e.target.value);
                                        parseCsvString(e.target.value);
                                    }}
                                    placeholder="name,email,password,role&#10;Ahmad Fauzi,ahmad@uad.ac.id,password123,pengurus&#10;Siti Rahma,siti@uad.ac.id,password123,user"
                                    className="form-input font-mono text-xs mt-1 w-full"
                                />
                            </div>

                            {csvParseError && (
                                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{csvParseError}</span>
                                </div>
                            )}

                            {/* Preview Table of Parsed CSV */}
                            {previewCsvRows.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                            <span>Pratinjau Data Terbaca ({previewCsvRows.length} Pengguna)</span>
                                        </h3>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                            Siap Diimpor
                                        </span>
                                    </div>

                                    <div className="card overflow-hidden">
                                        <div className="table-wrapper max-h-72 overflow-y-auto">
                                            <table className="data-table text-xs">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Nama</th>
                                                        <th>Email</th>
                                                        <th>Password</th>
                                                        <th>Role</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewCsvRows.map((u, i) => (
                                                        <tr key={i}>
                                                            <td className="font-mono text-gray-400">{i + 1}</td>
                                                            <td className="font-medium text-gray-800 dark:text-slate-200">{u.name}</td>
                                                            <td className="font-mono text-gray-600 dark:text-slate-300">{u.email}</td>
                                                            <td className="font-mono text-gray-500">••••••••</td>
                                                            <td>
                                                                <span className={`badge ${
                                                                    u.role === 'admin'
                                                                        ? 'badge-indigo'
                                                                        : u.role === 'pengurus'
                                                                        ? 'badge-amber'
                                                                        : 'badge-emerald'
                                                                }`}>
                                                                    {u.role}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-3">
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={handleCsvSubmit}
                                            isLoading={processing}
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Impor {previewCsvRows.length} Pengguna Sekarang</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

