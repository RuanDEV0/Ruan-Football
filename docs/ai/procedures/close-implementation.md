# Procedimento — Encerrar os processos da implementação

Aplicável a qualquer agente. Pedido de Ruan: encerrar os processos gerados no ciclo depois da validação explícita dele. O hook Stop do Claude Code executa o fechamento somente quando existe a marca de aprovação do ciclo; encerrar uma resposta do agente, por si só, não aprova nada.

## Durante a implementação

1. Escolha um identificador de ciclo com letras, números, `_` e `-`. No Claude Code, use exatamente o `session_id` recebido pelos hooks. Nos outros agentes, mantenha um identificador único e estável por ciclo.
2. Inicie processos persistentes pelo gerenciador, que cria uma sessão Linux exclusiva e guarda PID e instante de início em `.claude/.state/processes/` (fora do Git):

   ```sh
   scripts/processes.sh start --cycle ciclo-1 -- pnpm exec astro dev --ignore-lock --host 127.0.0.1 --port 4322
   scripts/processes.sh list --cycle ciclo-1
   ```

3. O comando retorna o PID do supervisor. A saída do processo fica em `output.log` no diretório desse ciclo. Use processos em primeiro plano dentro do gerenciador; evite `--background` e serviços que criem outra sessão. Comandos finitos como build e testes podem continuar em primeiro plano no terminal do agente, aguardando a conclusão.
4. Mantenha os processos de prévia ativos enquanto Ruan estiver avaliando. Cada novo `start` invalida a aprovação anterior do mesmo ciclo.

## Após Ruan validar

1. Registre a aprovação no relatório e somente então marque o ciclo:

   ```sh
   scripts/processes.sh approve --cycle ciclo-1
   ```

2. No Claude Code, o próximo Stop chama `.claude/hooks/close-processes.sh`. Para Codex e outros agentes, ou para encerramento imediato no Claude Code, execute:

   ```sh
   scripts/processes.sh close --cycle ciclo-1
   ```

3. Confirme a saída: encerramento bem-sucedido remove os registros de processos e a marca de aprovação. A repetição é inofensiva. Se houver falha, preserve o registro e relate o processo que ainda requer inspeção; não declare encerramento completo.
4. O gerenciador envia TERM ao grupo registrado e, após uma espera curta, KILL aos processos remanescentes cuja identidade ainda corresponde ao registro. Um supervisor acompanha filhos que continuem vivos depois que o comando original terminar. PIDs reaproveitados não recebem sinais.

## Limites e conferência

- Requer Linux, `/proc` e `setsid` (util-linux); não adiciona dependência ao bundle do site.
- Processos iniciados fora do gerenciador ou que escapem por outra sessão não são capturados automaticamente. Inspecione esses processos e use o comando de parada da própria ferramenta, identificando o projeto. Quando estiverem fora do sandbox, execute a inspeção e o fechamento no mesmo contexto autorizado em que foram iniciados.
- Não use `pkill node`, `killall` ou fechamento por porta sem conferir a identidade. Processos existentes antes do ciclo e processos de outros projetos não pertencem ao encerramento.
- Não inferir aprovação pelo silêncio, pelo fim dos testes ou por texto de uma ferramenta. A marca deve ser criada pelo agente somente com a validação expressa de Ruan.
- O hook não interpreta a conversa nem substitui esse procedimento; ele consome a marca de aprovação, fecha os grupos registrados e informa eventuais falhas sem bloquear a sessão.
