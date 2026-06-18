"use client";

import React, { useEffect, useState } from "react";
import { Users, Plus, Edit2, Trash2, Check, X, Phone } from "lucide-react";
import { listWorkers, addWorker, updateWorker, deleteWorker } from "@/lib/store";
import type { Worker } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function EquipePage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [especialidades, setEspecialidades] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ativo, setAtivo] = useState(true);

  async function load() {
    setLoading(true);
    const w = await listWorkers();
    setWorkers(w);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setNome("");
    setEspecialidades("");
    setTelefone("");
    setAtivo(true);
    setEditing(null);
  }

  function openNew() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(w: Worker) {
    setEditing(w);
    setNome(w.nome);
    setEspecialidades((w.especialidades || []).join(", "));
    setTelefone(w.telefone || "");
    setAtivo(w.ativo ?? true);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const esp = especialidades
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      nome: nome.trim(),
      especialidades: esp,
      telefone: telefone.trim() || undefined,
      ativo,
    };

    try {
      if (editing) {
        await updateWorker(editing.id, payload);
      } else {
        await addWorker(payload);
      }
      await load();
      closeForm();
    } catch (err) {
      alert("Erro ao salvar profissional. Tente novamente.");
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Remover ${nome}?`)) return;
    try {
      await deleteWorker(id);
      await load();
    } catch {
      alert("Erro ao remover.");
    }
  }

  async function toggleAtivo(w: Worker) {
    try {
      await updateWorker(w.id, { ativo: !w.ativo });
      await load();
    } catch {
      /* noop */
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-champagne-100">Equipe</h1>
              <p className="text-sm text-navy-300">Profissionais da sua clínica</p>
            </div>
          </div>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400 active:bg-gold-600 transition"
        >
          <Plus size={16} /> Adicionar profissional
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-navy-700 bg-navy-800/60 p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-navy-400 mb-1">Nome</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full rounded-xl bg-navy-900 border border-navy-700 px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500"
                  placeholder="Ex: Camila Mendes"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-navy-400 mb-1">Telefone (opcional)</label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full rounded-xl bg-navy-900 border border-navy-700 px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500"
                  placeholder="(91) 99999-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-navy-400 mb-1">
                Especialidades (separadas por vírgula)
              </label>
              <input
                value={especialidades}
                onChange={(e) => setEspecialidades(e.target.value)}
                className="w-full rounded-xl bg-navy-900 border border-navy-700 px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500"
                placeholder="Botox, Limpeza de pele, Preenchimento"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-navy-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="accent-gold-500"
                />
                Ativo (aparece em listas futuras)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400"
              >
                {editing ? "Salvar alterações" : "Adicionar profissional"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-navy-600 px-5 py-2 text-sm text-navy-200 hover:bg-navy-800"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-navy-400 text-sm">Carregando equipe...</div>
      ) : workers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-700 bg-navy-800/40 p-10 text-center">
          <Users className="mx-auto mb-3 text-gold-500/60" size={36} />
          <div className="text-champagne-100 font-medium mb-1">Nenhum profissional cadastrado</div>
          <p className="text-sm text-navy-300 max-w-xs mx-auto">
            Cadastre sua equipe para organizar atendimentos e (futuramente) atribuir conversas.
          </p>
          <button
            onClick={openNew}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-500/60 px-4 py-1.5 text-sm text-gold-400 hover:bg-gold-500/5"
          >
            Adicionar primeiro profissional
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {workers.map((w) => (
            <div
              key={w.id}
              className={cn(
                "rounded-2xl border p-4 flex items-start gap-4 bg-navy-800/60",
                w.ativo ? "border-navy-700" : "border-navy-800 opacity-60"
              )}
            >
              <div className="mt-0.5 h-10 w-10 rounded-full bg-navy-700 flex items-center justify-center text-gold-400 flex-shrink-0">
                <Users size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium text-champagne-100">{w.nome}</div>
                  {!w.ativo && (
                    <span className="text-[10px] uppercase tracking-widest rounded px-1.5 py-px bg-navy-700 text-navy-300">Inativo</span>
                  )}
                </div>

                {w.especialidades && w.especialidades.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {w.especialidades.map((esp, i) => (
                      <span key={i} className="text-xs rounded-full bg-navy-900 border border-navy-700 px-2.5 py-0.5 text-navy-200">
                        {esp}
                      </span>
                    ))}
                  </div>
                )}

                {w.telefone && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-navy-300">
                    <Phone size={14} /> {w.telefone}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(w)}
                  className="rounded-lg p-2 text-navy-300 hover:bg-navy-700 hover:text-champagne-200"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => toggleAtivo(w)}
                  className="rounded-lg p-2 text-navy-300 hover:bg-navy-700 hover:text-champagne-200"
                  title={w.ativo ? "Desativar" : "Ativar"}
                >
                  {w.ativo ? <X size={16} /> : <Check size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(w.id, w.nome)}
                  className="rounded-lg p-2 text-red-400/80 hover:bg-red-950/40 hover:text-red-400"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-navy-500">
        Os profissionais cadastrados aqui ficarão disponíveis para atribuição de atendimentos e relatórios (em breve).
      </p>
    </div>
  );
}
