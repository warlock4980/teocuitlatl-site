create table if not exists coin_poll_votes (
  id bigserial primary key,
  voter_hash text,
  picks text[] not null,
  user_agent_hash text,
  referer text,
  created_at timestamptz not null default now()
);

alter table coin_poll_votes
  add column if not exists voter_hash text;

create unique index if not exists coin_poll_votes_voter_hash_idx
  on coin_poll_votes (voter_hash)
  where voter_hash is not null;

create index if not exists coin_poll_votes_created_at_idx
  on coin_poll_votes (created_at desc);

-- chat_log: stores user queries that fell through the static FAQ to the
-- LLM endpoint (api/chat.js). Lets us review what people ask, promote
-- frequent unmatched queries into the static FAQ, and respect right-to-
-- deletion via the existing poll DELETE endpoint (shared voter_hash).
create table if not exists chat_log (
  id bigserial primary key,
  voter_hash text,
  message text not null,
  response_excerpt text,
  created_at timestamptz not null default now()
);

create index if not exists chat_log_voter_hash_idx
  on chat_log (voter_hash);

create index if not exists chat_log_created_at_idx
  on chat_log (created_at desc);
