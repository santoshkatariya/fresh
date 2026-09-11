import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Download,
  Server,
  Layers,
  Code,
  ExternalLink,
  Shield,
  Activity,
  Check,
  X,
} from 'lucide-react';
import { Button } from './Button';

interface MySQLStatusData {
  configured: boolean;
  connected: boolean;
  host: string | null;
  port: number | null;
  database: string | null;
  user: string | null;
  ssl: boolean;
  latencyMs: number | null;
  errorMessage: string | null;
  tables: Record<string, number>;
  lastChecked: string;
}

interface MySQLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MySQLModal: React.FC<MySQLModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<MySQLStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'config'>('overview');
  const [copied, setCopied] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [schemaSql, setSchemaSql] = useState<string>('');

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mysql/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load MySQL status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async () => {
    try {
      const res = await fetch('/api/mysql/schema.sql');
      if (res.ok) {
        const text = await res.text();
        setSchemaSql(text);
      }
    } catch (err) {
      console.error('Failed to load schema:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      fetchSchema();
    }
  }, [isOpen]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/mysql/sync', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        const total = Object.values(result.synced as Record<string, number>).reduce((a, b) => a + b, 0);
        setSyncMessage(`Successfully synced ${total} records across tables to MySQL.`);
        fetchStatus();
      } else {
        setSyncMessage(`Sync notice: ${result.error || 'Could not sync at this time'}`);
      }
    } catch (err: any) {
      setSyncMessage(`Sync notice: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySchema = () => {
    if (schemaSql) {
      navigator.clipboard.writeText(schemaSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSchema = () => {
    window.open('/api/mysql/schema.sql', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">MySQL Database Integration</h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    status?.connected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {status?.connected ? 'MySQL Connected' : 'Local Store Active'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                FreshRoute relational data engine for produce batches, orders & WhatsApp logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-stone-200 bg-stone-50 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Live Status & Tables
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'schema'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code className="w-4 h-4" />
            SQL Schema (DDL)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Server className="w-4 h-4" />
            Connection Setup
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  status?.connected
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}
              >
                {status?.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">
                    {status?.connected
                      ? `Active Connection to MySQL 8.x (${status.database})`
                      : 'Dual-Engine: Local File Store with Automatic MySQL Sync'}
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {status?.connected
                      ? `Connected to ${status.host}:${status.port} with ${status.latencyMs}ms response latency. All harvest scans, buyer commitments, and WhatsApp interactions are persistently stored in MySQL tables.`
                      : 'FreshRoute is currently storing data in local JSON storage (`data/db.json`). When you provide your MySQL credentials (`MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`) in Settings, it immediately syncs tables and persists changes to MySQL without downtime.'}
                  </p>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Host & Port
                  </span>
                  <span className="text-sm font-bold text-stone-800 font-mono mt-0.5 block truncate">
                    {status?.host ? `${status.host}:${status.port}` : 'Local Container'}
                  </span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Database Name
                  </span>
                  <span className="text-sm font-bold text-stone-800 font-mono mt-0.5 block truncate">
                    {status?.database || 'freshroute_db'}
                  </span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Connection Latency
                  </span>
                  <span className="text-sm font-bold text-emerald-600 font-mono mt-0.5 block">
                    {status?.latencyMs !== null && status?.latencyMs !== undefined
                      ? `${status.latencyMs} ms`
                      : 'In-Memory (0 ms)'}
                  </span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    SSL Security
                  </span>
                  <span className="text-sm font-bold text-stone-800 mt-0.5 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    {status?.ssl ? 'TLS / SSL Active' : 'Disabled / Local'}
                  </span>
                </div>
              </div>

              {/* Table Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Registered Database Tables
                  </h4>
                  <span className="text-[11px] text-stone-500">InnoDB UTF8MB4</span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                  {[
                    {
                      name: 'produce_batches',
                      desc: 'Harvest biometrics, quality grades, photos & shelf-life predictions',
                      count: status?.tables?.produce_batches ?? 4,
                    },
                    {
                      name: 'orders',
                      desc: 'Buyer-farmer smart contracts, cold transit telemetry & escrow records',
                      count: status?.tables?.orders ?? 2,
                    },
                    {
                      name: 'users',
                      desc: 'Farmers, FPOs, wholesale buyers & retail hub profiles',
                      count: status?.tables?.users ?? 2,
                    },
                    {
                      name: 'buyers',
                      desc: 'Procurement demand criteria, prices offered & reliability ratings',
                      count: status?.tables?.buyers ?? 5,
                    },
                    {
                      name: 'demands',
                      desc: 'Active quick-commerce and supermarket purchase requisitions',
                      count: status?.tables?.demands ?? 2,
                    },
                    {
                      name: 'whatsapp_conversations',
                      desc: 'Farmer multi-turn chat sessions, photo scans & GPS coordinates',
                      count: status?.tables?.whatsapp_conversations ?? 0,
                    },
                    {
                      name: 'whatsapp_webhook_logs',
                      desc: 'Audit trail of Meta Cloud API incoming payloads and outgoing replies',
                      count: status?.tables?.whatsapp_webhook_logs ?? 0,
                    },
                  ].map((tbl) => (
                    <div key={tbl.name} className="p-3 bg-white flex items-center justify-between hover:bg-stone-50/70 transition-colors">
                      <div>
                        <span className="font-bold text-stone-800 font-mono text-xs">{tbl.name}</span>
                        <p className="text-[11px] text-stone-500 mt-0.5">{tbl.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {tbl.count} rows
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Message if any */}
              {syncMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  {syncMessage}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Full MySQL 8.x DDL Schema
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Ready to execute on any MySQL, AWS RDS, Cloud SQL, or PlanetScale instance.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopySchema} icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}>
                    {copied ? 'Copied' : 'Copy SQL'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleDownloadSchema} icon={<Download className="w-3.5 h-3.5" />}>
                    Download .sql
                  </Button>
                </div>
              </div>

              <div className="relative rounded-xl border border-stone-800 bg-stone-950 p-4 font-mono text-xs text-stone-200 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
                <pre className="whitespace-pre">{schemaSql || '-- Loading schema...'}</pre>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Environment Configuration
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Set these environment variables in your deployment environment or project settings:
                </p>
              </div>

              <div className="bg-stone-900 text-stone-100 rounded-xl p-4 font-mono text-xs space-y-1 border border-stone-800">
                <p className="text-stone-400"># MySQL Database Configuration</p>
                <p><span className="text-emerald-400">MYSQL_HOST</span>=your-db-host.rds.amazonaws.com</p>
                <p><span className="text-emerald-400">MYSQL_PORT</span>=3306</p>
                <p><span className="text-emerald-400">MYSQL_USER</span>=admin</p>
                <p><span className="text-emerald-400">MYSQL_PASSWORD</span>=your_secure_password</p>
                <p><span className="text-emerald-400">MYSQL_DATABASE</span>=freshroute_db</p>
                <p><span className="text-emerald-400">MYSQL_SSL</span>=true</p>
                <p className="text-stone-400 mt-2"># Or provide a single unified connection URI:</p>
                <p><span className="text-emerald-400">MYSQL_URL</span>=mysql://admin:pass@host:3306/freshroute_db</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-600" />
                    Google Cloud SQL
                  </div>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    Create a MySQL 8.0 instance in Cloud SQL, allow container network authorized networks, and specify the public IP or socket path in <code>MYSQL_HOST</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-blue-600" />
                    AWS RDS / Aurora
                  </div>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    Launch an RDS MySQL instance with a public endpoint or VPC peering, set <code>MYSQL_SSL=true</code>, and configure security group inbound port 3306.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Test Connection
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              icon={<Database className="w-3.5 h-3.5 text-emerald-700" />}
            >
              {syncing ? 'Syncing...' : 'Sync All Records to MySQL'}
            </Button>
          </div>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
