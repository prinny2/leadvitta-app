-- app_historico_respostas: a política de SELECT tinha `OR firebase_uid IS NOT NULL`,
-- o que tornava TODA linha legível por qualquer um com a chave publishable.
-- O app autentica via Clerk/Firebase (nunca Supabase Auth), então auth.uid() é
-- sempre null para o anon — a cláusula restante nega leitura anônima e continua
-- correta caso um dia exista sessão Supabase. O espelho client-side só faz
-- upsert com `return=minimal`, então não depende de SELECT.
alter policy app_hist_select_own on public.app_historico_respostas
  using (((select auth.uid())::text = firebase_uid));
