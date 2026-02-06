import React from 'react';
import { useUsersModule } from '../sidebar/UsersModuleContext';
import { parseDate } from '../sidebar/UsersModuleContext';

const UsersListCard: React.FC = () => {
  const { users, usersLoading, handleEdit, handleDelete } = useUsersModule();

  return (
    <section className="absolute inset-y-0 right-0 w-full max-w-[720px] p-8">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-2 text-slate-400">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">FunilBuilder AI</p>
          <h2 className="text-3xl font-display text-slate-900">Usuários ativos</h2>
          <p className="text-sm text-slate-500">Lista responsiva com colunas, filtros e ações inline para o CRUD completo.</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-300 rounded-full transition hover:border-primary hover:text-primary">
            Filtrar
          </button>
          <button className="px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-xl">
            Novo Usuário
          </button>
        </div>
        <div className="flex-1 overflow-hidden rounded-[36px] bg-white/90 border border-slate-200 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[640px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-[11px] uppercase tracking-[0.5em] text-slate-400">
                  <th className="px-5 py-4">Nome</th>
                  <th className="px-5 py-4">E-mail</th>
                  <th className="px-5 py-4">Função</th>
                  <th className="px-5 py-4">Último login</th>
                  <th className="px-5 py-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                      Carregando usuários...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-slate-400 italic">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900 max-w-[140px] truncate">{user.name || user.email}</td>
                      <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate">{user.email}</td>
                      <td className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">{user.role}</td>
                      <td className="px-5 py-4 text-slate-400">{parseDate(user.lastLoginAt)}</td>
                      <td className="px-5 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 rounded-2xl border border-slate-300 text-[11px] font-black uppercase tracking-widest transition hover:border-blue-500 hover:text-blue-500"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1 rounded-2xl border border-rose-300 text-[11px] font-black uppercase tracking-widest text-rose-500 transition hover:bg-rose-500/10"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UsersListCard;
