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
