create table if not exists coin_poll_votes (
  id bigserial primary key,
  picks text[] not null,
  user_agent_hash text,
  referer text,
  created_at timestamptz not null default now()
);

create index if not exists coin_poll_votes_created_at_idx
  on coin_poll_votes (created_at desc);
