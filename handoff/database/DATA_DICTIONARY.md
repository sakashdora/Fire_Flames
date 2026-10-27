# Database dictionary

Generated from the applied disposable schema (001 baseline + 002 esports extensions), not from a live Supabase database. Columns and keys are structural facts; command-level invariants are specified separately.

## attendance

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| pass_id | uuid | NO |  |
| event_id | uuid | NO |  |
| participant_id | uuid | NO |  |
| session_id | uuid | NO |  |
| station_id | uuid | NO |  |
| duty_id | uuid | NO |  |
| actor_id | uuid | NO |  |
| action | text | NO |  |
| recorded_at | timestamp with time zone | NO | now() |
| method | text | NO |  |
| observed_at | timestamp with time zone | YES |  |
| reason | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((action = ANY (ARRAY['check_in'::text, 'check_out'::text])))`
- `NOT NULL action`
- `NOT NULL actor_id`
- `CHECK (((method = 'qr'::text) OR (reason IS NOT NULL)))`
- `NOT NULL created_at`
- `FOREIGN KEY (duty_id, event_id, session_id, station_id, actor_id) REFERENCES app.duties(id, event_id, session_id, station_id, profile_id)`
- `NOT NULL duty_id`
- `NOT NULL event_id`
- `UNIQUE (event_id, session_id, participant_id, action)`
- `NOT NULL id`
- `CHECK ((method = ANY (ARRAY['qr'::text, 'manual'::text, 'paper_reconciliation'::text])))`
- `NOT NULL method`
- `NOT NULL participant_id`
- `FOREIGN KEY (pass_id, event_id, participant_id) REFERENCES app.passes(id, event_id, profile_id)`
- `NOT NULL pass_id`
- `PRIMARY KEY (id)`
- `NOT NULL recorded_at`
- `NOT NULL session_id`
- `NOT NULL station_id`

## audit_log

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| institution_id | uuid | NO |  |
| organizer_id | uuid | YES |  |
| event_id | uuid | YES |  |
| actor_id | uuid | YES |  |
| effective_role | text | YES |  |
| action | text | NO |  |
| entity_type | text | NO |  |
| entity_id | uuid | YES |  |
| reason | text | YES |  |
| safe_before | jsonb | YES |  |
| safe_after | jsonb | YES |  |
| correlation_id | uuid | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL action`
- `FOREIGN KEY (actor_id) REFERENCES app.profiles(id)`
- `CHECK (((event_id IS NULL) OR (organizer_id IS NOT NULL)))`
- `NOT NULL correlation_id`
- `NOT NULL created_at`
- `NOT NULL entity_type`
- `FOREIGN KEY (event_id, organizer_id) REFERENCES app.events(id, organizer_id)`
- `NOT NULL id`
- `FOREIGN KEY (institution_id) REFERENCES app.institutions(id)`
- `NOT NULL institution_id`
- `FOREIGN KEY (organizer_id, institution_id) REFERENCES app.organizers(id, institution_id)`
- `PRIMARY KEY (id)`

## award_allocations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| award_id | uuid | NO |  |
| result_row_id | uuid | NO |  |
| event_id | uuid | NO |  |
| approved_by | uuid | NO |  |
| disbursed_at | timestamp with time zone | YES |  |
| disbursement_reference | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (approved_by) REFERENCES app.profiles(id)`
- `NOT NULL approved_by`
- `FOREIGN KEY (award_id, event_id) REFERENCES app.awards(id, event_id)`
- `UNIQUE (award_id)`
- `NOT NULL award_id`
- `CHECK (((disbursed_at IS NULL) OR (disbursement_reference IS NOT NULL)))`
- `NOT NULL created_at`
- `NOT NULL event_id`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (result_row_id, event_id) REFERENCES app.result_rows(id, event_id)`
- `NOT NULL result_row_id`

## awards

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_version_id | uuid | NO |  |
| event_id | uuid | NO |  |
| label | text | NO |  |
| amount_paise | bigint | NO |  |
| kind | text | NO |  |
| rank | integer | YES |  |
| label_confirmed | boolean | NO | false |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((amount_paise >= 0))`
- `NOT NULL amount_paise`
- `NOT NULL created_at`
- `NOT NULL event_id`
- `FOREIGN KEY (event_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `NOT NULL event_version_id`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `CHECK ((kind = ANY (ARRAY['rank'::text, 'jury'::text, 'discipline'::text, 'instagram_poll'::text])))`
- `NOT NULL kind`
- `NOT NULL label_confirmed`
- `NOT NULL label`
- `PRIMARY KEY (id)`
- `CHECK ((rank > 0))`

## bank_credits

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| payment_profile_id | uuid | NO |  |
| receiving_account_reference | text | NO |  |
| settled_transaction_id | text | NO |  |
| amount_paise | bigint | NO |  |
| credited_at | timestamp with time zone | NO |  |
| verified_source_reference | text | NO |  |
| recorded_by | uuid | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((amount_paise > 0))`
- `NOT NULL amount_paise`
- `NOT NULL created_at`
- `NOT NULL credited_at`
- `NOT NULL id`
- `UNIQUE (id, payment_profile_id)`
- `NOT NULL payment_profile_id`
- `FOREIGN KEY (payment_profile_id, receiving_account_reference) REFERENCES app.payment_profiles(id, receiving_account_reference)`
- `PRIMARY KEY (id)`
- `NOT NULL receiving_account_reference`
- `UNIQUE (receiving_account_reference, settled_transaction_id)`
- `FOREIGN KEY (recorded_by) REFERENCES app.profiles(id)`
- `NOT NULL recorded_by`
- `NOT NULL settled_transaction_id`
- `NOT NULL verified_source_reference`

## broadcasts

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| organizer_id | uuid | YES |  |
| event_id | uuid | YES |  |
| author_id | uuid | NO |  |
| subject | text | NO |  |
| body | text | NO |  |
| audience_filter | jsonb | NO |  |
| state | text | NO | 'draft'::text |
| approved_by | uuid | YES |  |
| scheduled_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (approved_by) REFERENCES app.profiles(id)`
- `NOT NULL audience_filter`
- `FOREIGN KEY (author_id) REFERENCES app.profiles(id)`
- `NOT NULL author_id`
- `NOT NULL body`
- `CHECK (((event_id IS NULL) OR (organizer_id IS NOT NULL)))`
- `NOT NULL created_at`
- `FOREIGN KEY (event_id, organizer_id) REFERENCES app.events(id, organizer_id)`
- `NOT NULL id`
- `FOREIGN KEY (organizer_id) REFERENCES app.organizers(id)`
- `PRIMARY KEY (id)`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'approved'::text, 'queued'::text, 'sent'::text, 'cancelled'::text])))`
- `NOT NULL state`
- `NOT NULL subject`

## checkpoint_completions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| entry_id | uuid | NO |  |
| event_id | uuid | NO |  |
| checkpoint_id | uuid | NO |  |
| station_id | uuid | NO |  |
| session_id | uuid | NO |  |
| duty_id | uuid | NO |  |
| actor_id | uuid | NO |  |
| completed_at | timestamp with time zone | NO | now() |
| penalty_seconds | integer | NO | 0 |
| reason | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL actor_id`
- `FOREIGN KEY (checkpoint_id, event_id, station_id) REFERENCES app.checkpoints(id, event_id, station_id)`
- `NOT NULL checkpoint_id`
- `NOT NULL completed_at`
- `NOT NULL created_at`
- `FOREIGN KEY (duty_id, event_id, session_id, station_id, actor_id) REFERENCES app.duties(id, event_id, session_id, station_id, profile_id)`
- `NOT NULL duty_id`
- `UNIQUE (entry_id, checkpoint_id)`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `NOT NULL id`
- `CHECK ((penalty_seconds >= 0))`
- `NOT NULL penalty_seconds`
- `PRIMARY KEY (id)`
- `NOT NULL session_id`
- `NOT NULL station_id`

## checkpoints

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| station_id | uuid | NO |  |
| sequence | integer | NO |  |
| label | text | NO |  |
| private_instructions | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (event_id, sequence)`
- `UNIQUE (id, event_id, station_id)`
- `NOT NULL id`
- `NOT NULL label`
- `PRIMARY KEY (id)`
- `CHECK ((sequence > 0))`
- `NOT NULL sequence`
- `FOREIGN KEY (station_id, event_id) REFERENCES app.stations(id, event_id)`
- `NOT NULL station_id`

## colleges

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO |  |
| city | text | YES |  |
| state | text | YES |  |
| verified_at | timestamp with time zone | YES |  |
| active | boolean | NO | true |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL active`
- `NOT NULL created_at`
- `NOT NULL id`
- `NOT NULL name`
- `PRIMARY KEY (id)`

## competition_entries

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| event_version_id | uuid | NO |  |
| captain_id | uuid | NO |  |
| display_name | text | NO |  |
| kind | text | NO |  |
| state | text | NO | 'forming'::text |
| description | text | YES |  |
| project_details | jsonb | NO | '{}'::jsonb |
| row_version | integer | NO | 1 |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (captain_id) REFERENCES app.profiles(id)`
- `NOT NULL captain_id`
- `NOT NULL created_at`
- `NOT NULL display_name`
- `NOT NULL event_id`
- `FOREIGN KEY (event_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `NOT NULL event_version_id`
- `UNIQUE (id, event_id)`
- `UNIQUE (id, event_version_id, event_id)`
- `NOT NULL id`
- `CHECK ((kind = ANY (ARRAY['team'::text, 'pooled_individuals'::text, 'stall'::text, 'project'::text])))`
- `NOT NULL kind`
- `PRIMARY KEY (id)`
- `NOT NULL project_details`
- `NOT NULL row_version`
- `CHECK ((state = ANY (ARRAY['forming'::text, 'ready'::text, 'held'::text, 'confirmed'::text, 'cancelled'::text, 'disqualified'::text, 'completed'::text])))`
- `NOT NULL state`

## credit_allocations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| order_id | uuid | NO |  |
| credit_id | uuid | NO |  |
| payment_profile_id | uuid | NO |  |
| allocated_by | uuid | NO |  |
| amount_paise | bigint | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (allocated_by) REFERENCES app.profiles(id)`
- `NOT NULL allocated_by`
- `CHECK ((amount_paise > 0))`
- `NOT NULL amount_paise`
- `NOT NULL created_at`
- `UNIQUE (credit_id)`
- `NOT NULL credit_id`
- `FOREIGN KEY (credit_id, payment_profile_id) REFERENCES app.bank_credits(id, payment_profile_id)`
- `NOT NULL id`
- `UNIQUE (order_id)`
- `NOT NULL order_id`
- `FOREIGN KEY (order_id, payment_profile_id) REFERENCES app.orders(id, payment_profile_id)`
- `NOT NULL payment_profile_id`
- `PRIMARY KEY (id)`

## decision_records

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| institution_id | uuid | NO |  |
| decision_key | text | NO |  |
| version | integer | NO |  |
| value | jsonb | NO |  |
| approved_by | uuid | NO |  |
| approved_at | timestamp with time zone | NO |  |
| evidence_reference | text | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL approved_at`
- `FOREIGN KEY (approved_by) REFERENCES app.profiles(id)`
- `NOT NULL approved_by`
- `NOT NULL created_at`
- `NOT NULL decision_key`
- `NOT NULL evidence_reference`
- `NOT NULL id`
- `UNIQUE (institution_id, decision_key, version)`
- `FOREIGN KEY (institution_id) REFERENCES app.institutions(id)`
- `NOT NULL institution_id`
- `PRIMARY KEY (id)`
- `NOT NULL value`
- `CHECK ((version > 0))`
- `NOT NULL version`

## duties

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| staff_assignment_id | uuid | NO |  |
| profile_id | uuid | NO |  |
| event_id | uuid | NO |  |
| session_id | uuid | NO |  |
| station_id | uuid | NO |  |
| starts_at | timestamp with time zone | NO |  |
| ends_at | timestamp with time zone | NO |  |
| acknowledged_at | timestamp with time zone | YES |  |
| revoked_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((ends_at > starts_at))`
- `NOT NULL created_at`
- `NOT NULL ends_at`
- `NOT NULL event_id`
- `UNIQUE (id, event_id, session_id, station_id, profile_id)`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `NOT NULL profile_id`
- `FOREIGN KEY (session_id, event_id) REFERENCES app.sessions(id, event_id)`
- `NOT NULL session_id`
- `NOT NULL staff_assignment_id`
- `FOREIGN KEY (staff_assignment_id, profile_id) REFERENCES app.staff_assignments(id, profile_id)`
- `NOT NULL starts_at`
- `FOREIGN KEY (station_id, event_id) REFERENCES app.stations(id, event_id)`
- `NOT NULL station_id`

## entry_participants

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| entry_id | uuid | NO |  |
| registration_id | uuid | NO |  |
| member_id | uuid | NO |  |
| event_id | uuid | NO |  |
| profile_id | uuid | NO |  |
| active | boolean | NO | true |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL active`
- `NOT NULL created_at`
- `NOT NULL entry_id`
- `UNIQUE (entry_id, profile_id)`
- `NOT NULL event_id`
- `UNIQUE (id, event_id, profile_id)`
- `NOT NULL id`
- `UNIQUE (member_id)`
- `NOT NULL member_id`
- `FOREIGN KEY (member_id, registration_id, event_id, profile_id) REFERENCES app.registration_members(id, registration_id, event_id, profile_id)`
- `PRIMARY KEY (id)`
- `NOT NULL profile_id`
- `FOREIGN KEY (registration_id, entry_id, event_id) REFERENCES app.registrations(id, entry_id, event_id)`
- `NOT NULL registration_id`

## esports_match_entries

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| match_id | uuid | NO |  |
| event_id | uuid | NO |  |
| entry_id | uuid | NO |  |
| slot | integer | YES |  |
| placement | integer | YES |  |
| kills | integer | YES |  |
| points | numeric | YES |  |
| recorded_by | uuid | YES |  |
| reviewed_by | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((reviewed_by IS NULL) OR (reviewed_by <> recorded_by)))`
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `NOT NULL id`
- `CHECK ((kills >= 0))`
- `UNIQUE (match_id, entry_id)`
- `FOREIGN KEY (match_id, event_id) REFERENCES app.esports_matches(id, event_id)`
- `NOT NULL match_id`
- `UNIQUE (match_id, slot)`
- `PRIMARY KEY (id)`
- `CHECK ((placement > 0))`
- `FOREIGN KEY (recorded_by) REFERENCES app.profiles(id)`
- `FOREIGN KEY (reviewed_by) REFERENCES app.profiles(id)`
- `CHECK ((slot > 0))`

## esports_match_result_revisions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| match_id | uuid | NO |  |
| event_id | uuid | NO |  |
| scoring_version_id | uuid | NO |  |
| revision | integer | NO | 1 |
| state | text | NO | 'draft'::text |
| recorded_by | uuid | NO |  |
| reviewed_by | uuid | YES |  |
| reviewed_at | timestamp with time zone | YES |  |
| results_payload | jsonb | NO | '[]'::jsonb |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((reviewed_by IS NULL) OR (reviewed_by <> recorded_by)))`
- `CHECK ((NOT ((state = ANY (ARRAY['reviewed'::text, 'published'::text])) AND ((reviewed_by IS NULL) OR (reviewed_at IS NULL)))))`
- `NOT NULL created_at`
- `NOT NULL event_id`
- `NOT NULL id`
- `FOREIGN KEY (match_id, event_id) REFERENCES app.esports_matches(id, event_id)`
- `NOT NULL match_id`
- `UNIQUE (match_id, revision)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (recorded_by) REFERENCES app.profiles(id)`
- `NOT NULL recorded_by`
- `NOT NULL results_payload`
- `FOREIGN KEY (reviewed_by) REFERENCES app.profiles(id)`
- `CHECK ((revision > 0))`
- `NOT NULL revision`
- `FOREIGN KEY (scoring_version_id, event_id) REFERENCES app.esports_scoring_versions(id, event_id)`
- `NOT NULL scoring_version_id`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'reviewed'::text, 'published'::text, 'superseded'::text])))`
- `NOT NULL state`

## esports_matches

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| session_id | uuid | YES |  |
| round_label | text | NO |  |
| match_number | integer | NO |  |
| state | text | NO | 'draft'::text |
| private_room_details | jsonb | YES |  |
| rules_version_id | uuid | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (event_id, round_label, match_number)`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `CHECK ((match_number > 0))`
- `NOT NULL match_number`
- `PRIMARY KEY (id)`
- `NOT NULL round_label`
- `FOREIGN KEY (rules_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `NOT NULL rules_version_id`
- `FOREIGN KEY (session_id, event_id) REFERENCES app.sessions(id, event_id)`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'scheduled'::text, 'running'::text, 'completed'::text, 'cancelled'::text])))`
- `NOT NULL state`

## esports_placement_points

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| scoring_version_id | uuid | NO |  |
| place | integer | NO |  |
| points | numeric | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `CHECK (((place >= 1) AND (place <= 24)))`
- `NOT NULL place`
- `CHECK ((points >= (0)::numeric))`
- `NOT NULL points`
- `FOREIGN KEY (scoring_version_id) REFERENCES app.esports_scoring_versions(id)`
- `NOT NULL scoring_version_id`
- `UNIQUE (scoring_version_id, place)`

## esports_roster_members

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| roster_id | uuid | NO |  |
| entry_id | uuid | NO |  |
| event_id | uuid | NO |  |
| profile_id | uuid | NO |  |
| slot_type | text | NO |  |
| slot_index | integer | NO |  |
| ign | text | NO |  |
| player_uid | text | NO |  |
| is_igl | boolean | NO | false |
| active | boolean | NO | true |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL active`
- `CHECK ((((slot_type = 'starter'::text) AND ((slot_index >= 1) AND (slot_index <= 4))) OR ((slot_type = 'substitute'::text) AND (slot_index = 5))))`
- `CHECK (((NOT is_igl) OR (slot_type = 'starter'::text)))`
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `NOT NULL id`
- `CHECK ((length(TRIM(BOTH FROM ign)) > 0))`
- `NOT NULL ign`
- `NOT NULL is_igl`
- `PRIMARY KEY (id)`
- `CHECK ((length(TRIM(BOTH FROM player_uid)) > 0))`
- `NOT NULL player_uid`
- `FOREIGN KEY (profile_id) REFERENCES app.profiles(id)`
- `NOT NULL profile_id`
- `FOREIGN KEY (roster_id, entry_id) REFERENCES app.esports_rosters(id, entry_id)`
- `NOT NULL roster_id`
- `CHECK (((slot_index >= 1) AND (slot_index <= 5)))`
- `NOT NULL slot_index`
- `CHECK ((slot_type = ANY (ARRAY['starter'::text, 'substitute'::text])))`
- `NOT NULL slot_type`

## esports_rosters

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| entry_id | uuid | NO |  |
| event_id | uuid | NO |  |
| registration_id | uuid | NO |  |
| revision | integer | NO | 1 |
| state | text | NO | 'draft'::text |
| locked_at | timestamp with time zone | YES |  |
| locked_by | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `UNIQUE (entry_id, revision)`
- `NOT NULL event_id`
- `UNIQUE (id, entry_id)`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `FOREIGN KEY (locked_by) REFERENCES app.profiles(id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (registration_id) REFERENCES app.registrations(id)`
- `NOT NULL registration_id`
- `CHECK ((revision > 0))`
- `NOT NULL revision`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'submitted'::text, 'locked'::text, 'archived'::text])))`
- `NOT NULL state`

## esports_rules_versions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_version_id | uuid | NO |  |
| event_id | uuid | NO |  |
| game | text | NO |  |
| tournament_name | text | NO | 'KALINGA BGMI CLASH SEASON 1'::text |
| source_alias | text | YES | 'KALINGA CLASH 2K26'::text |
| dates | jsonb | NO | '["2026-11-13", "2026-11-14"]'::jsonb |
| team_capacity | integer | NO | 24 |
| starters_count | integer | NO | 4 |
| substitute_slots | integer | NO | 1 |
| substitute_required | boolean | YES |  |
| igl_required | integer | NO | 1 |
| leader_phone_only | boolean | NO | true |
| query_phone | text | YES | '8260555312'::text |
| prize_pool_paise | bigint | YES |  |
| prize_distribution | jsonb | YES |  |
| entry_fee_status | text | NO | 'pending'::text |
| device_policy_status | text | NO | 'pending'::text |
| scoring_rules_status | text | NO | 'pending_complete_rules'::text |
| approved_id_types | jsonb | NO | '["aadhaar", "pan", "voter_id"]'::jsonb |
| declaration_text_ref | text | NO | 'draft_v1'::text |
| scoring_reference | text | NO | 'BGIS 2026 partial placement chart'::text |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL approved_id_types`
- `NOT NULL created_at`
- `NOT NULL dates`
- `NOT NULL declaration_text_ref`
- `CHECK ((device_policy_status = ANY (ARRAY['pending'::text, 'approved'::text, 'active'::text])))`
- `NOT NULL device_policy_status`
- `CHECK ((entry_fee_status = ANY (ARRAY['pending'::text, 'approved'::text, 'active'::text])))`
- `NOT NULL entry_fee_status`
- `NOT NULL event_id`
- `FOREIGN KEY (event_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `UNIQUE (event_version_id)`
- `NOT NULL event_version_id`
- `CHECK ((game = ANY (ARRAY['bgmi'::text, 'free-fire'::text])))`
- `NOT NULL game`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `CHECK ((igl_required = 1))`
- `NOT NULL igl_required`
- `NOT NULL leader_phone_only`
- `PRIMARY KEY (id)`
- `CHECK (((prize_pool_paise IS NULL) OR (prize_pool_paise >= 0)))`
- `NOT NULL scoring_reference`
- `CHECK ((scoring_rules_status = ANY (ARRAY['pending_complete_rules'::text, 'approved'::text, 'active'::text])))`
- `NOT NULL scoring_rules_status`
- `CHECK ((starters_count = 4))`
- `NOT NULL starters_count`
- `CHECK ((substitute_slots = 1))`
- `NOT NULL substitute_slots`
- `CHECK ((team_capacity > 0))`
- `NOT NULL team_capacity`
- `NOT NULL tournament_name`

## esports_scoring_versions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| rules_version_id | uuid | NO |  |
| version | integer | NO |  |
| name | text | NO | 'BGIS 2026 Points System'::text |
| kill_multiplier | numeric | YES |  |
| tie_break_policy | text | YES |  |
| lobby_size | integer | YES |  |
| approval_state | text | NO | 'draft'::text |
| approved_by | uuid | YES |  |
| approved_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((approval_state = ANY (ARRAY['draft'::text, 'approved'::text, 'superseded'::text])))`
- `NOT NULL approval_state`
- `FOREIGN KEY (approved_by) REFERENCES app.profiles(id)`
- `CHECK ((NOT ((approval_state = 'approved'::text) AND ((kill_multiplier IS NULL) OR (tie_break_policy IS NULL) OR (approved_by IS NULL) OR (approved_at IS NULL)))))`
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (event_id, version)`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `CHECK (((kill_multiplier IS NULL) OR (kill_multiplier >= (0)::numeric)))`
- `CHECK (((lobby_size IS NULL) OR (lobby_size > 0)))`
- `NOT NULL name`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (rules_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `NOT NULL rules_version_id`
- `CHECK ((version > 0))`
- `NOT NULL version`

## event_versions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| version | integer | NO |  |
| public_description | text | NO |  |
| rules_text | text | NO |  |
| eligibility_text | text | YES |  |
| team_min | integer | YES |  |
| team_max | integer | YES |  |
| individual_policy | text | YES |  |
| prize_pool_paise | bigint | YES |  |
| currency | text | NO | 'INR'::text |
| configuration | jsonb | NO | '{}'::jsonb |
| approval_state | text | NO | 'draft'::text |
| authored_by | uuid | YES |  |
| approved_by | uuid | YES |  |
| approved_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((approval_state = ANY (ARRAY['draft'::text, 'approved'::text, 'superseded'::text])))`
- `NOT NULL approval_state`
- `FOREIGN KEY (approved_by) REFERENCES app.profiles(id)`
- `FOREIGN KEY (authored_by) REFERENCES app.profiles(id)`
- `CHECK (((team_min IS NULL) OR (team_max IS NULL) OR (team_max >= team_min)))`
- `CHECK (((approval_state = 'draft'::text) OR ((approved_by IS NOT NULL) AND (approved_at IS NOT NULL))))`
- `NOT NULL configuration`
- `NOT NULL created_at`
- `CHECK ((currency = 'INR'::text))`
- `NOT NULL currency`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (event_id, version)`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `CHECK ((individual_policy = ANY (ARRAY['disabled'::text, 'allocate_before_payment'::text])))`
- `PRIMARY KEY (id)`
- `CHECK ((prize_pool_paise >= 0))`
- `NOT NULL public_description`
- `NOT NULL rules_text`
- `CHECK ((team_max > 0))`
- `CHECK ((team_min > 0))`
- `CHECK ((version > 0))`
- `NOT NULL version`

## events

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| organizer_id | uuid | NO |  |
| slug | text | NO |  |
| name | text | NO |  |
| track | text | NO |  |
| state | text | NO | 'draft'::text |
| registration_enabled | boolean | NO | false |
| published_version_id | uuid | YES |  |
| registration_opens_at | timestamp with time zone | YES |  |
| registration_closes_at | timestamp with time zone | YES |  |
| capacity | integer | YES |  |
| capacity_unit | text | NO | 'entry'::text |
| pool_team_count | integer | YES |  |
| row_version | integer | NO | 1 |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((capacity > 0))`
- `CHECK ((capacity_unit = ANY (ARRAY['entry'::text, 'stall'::text])))`
- `NOT NULL capacity_unit`
- `CHECK (((registration_closes_at IS NULL) OR (registration_opens_at IS NULL) OR (registration_closes_at > registration_opens_at)))`
- `CHECK (((NOT registration_enabled) OR ((state = 'published'::text) AND (published_version_id IS NOT NULL))))`
- `NOT NULL created_at`
- `NOT NULL id`
- `UNIQUE (id, organizer_id)`
- `NOT NULL name`
- `FOREIGN KEY (organizer_id) REFERENCES app.organizers(id)`
- `NOT NULL organizer_id`
- `FOREIGN KEY (published_version_id, id) REFERENCES app.event_versions(id, event_id)`
- `PRIMARY KEY (id)`
- `CHECK ((pool_team_count > 0))`
- `NOT NULL registration_enabled`
- `NOT NULL row_version`
- `UNIQUE (slug)`
- `NOT NULL slug`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text, 'cancelled'::text, 'archived'::text])))`
- `NOT NULL state`
- `CHECK ((track = ANY (ARRAY['e-fest'::text, 'esports'::text])))`
- `NOT NULL track`

## export_jobs

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| requested_by | uuid | NO |  |
| organizer_id | uuid | NO |  |
| event_id | uuid | YES |  |
| purpose | text | NO |  |
| state | text | NO | 'queued'::text |
| file_id | uuid | YES |  |
| expires_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `FOREIGN KEY (event_id, organizer_id) REFERENCES app.events(id, organizer_id)`
- `FOREIGN KEY (file_id) REFERENCES app.files(id)`
- `NOT NULL id`
- `FOREIGN KEY (organizer_id) REFERENCES app.organizers(id)`
- `NOT NULL organizer_id`
- `PRIMARY KEY (id)`
- `NOT NULL purpose`
- `FOREIGN KEY (requested_by) REFERENCES app.profiles(id)`
- `NOT NULL requested_by`
- `CHECK ((state = ANY (ARRAY['queued'::text, 'running'::text, 'completed'::text, 'failed'::text, 'expired'::text])))`
- `NOT NULL state`

## files

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| owner_id | uuid | YES |  |
| organizer_id | uuid | YES |  |
| bucket | text | NO |  |
| object_path | text | NO |  |
| purpose | text | NO |  |
| mime_type | text | NO |  |
| size_bytes | bigint | NO |  |
| sha256 | text | YES |  |
| scan_state | text | NO | 'quarantined'::text |
| validated_at | timestamp with time zone | YES |  |
| retention_until | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL bucket`
- `UNIQUE (bucket, object_path)`
- `NOT NULL created_at`
- `NOT NULL id`
- `NOT NULL mime_type`
- `NOT NULL object_path`
- `FOREIGN KEY (organizer_id) REFERENCES app.organizers(id)`
- `FOREIGN KEY (owner_id) REFERENCES app.profiles(id)`
- `PRIMARY KEY (id)`
- `CHECK ((purpose = ANY (ARRAY['payment_evidence'::text, 'official_qr'::text, 'poll_evidence'::text, 'entry_attachment'::text, 'export'::text, 'incident'::text])))`
- `NOT NULL purpose`
- `CHECK ((scan_state = ANY (ARRAY['quarantined'::text, 'validated'::text, 'rejected'::text, 'deleted'::text])))`
- `NOT NULL scan_state`
- `CHECK (((sha256 IS NULL) OR (sha256 ~ '^[0-9a-f]{64}$'::text)))`
- `CHECK (((size_bytes > 0) AND (size_bytes <= 5242880)))`
- `NOT NULL size_bytes`

## idempotency_records

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| actor_id | uuid | NO |  |
| command | text | NO |  |
| client_key | text | NO |  |
| request_hash | text | NO |  |
| state | text | NO |  |
| safe_response | jsonb | YES |  |
| expires_at | timestamp with time zone | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `UNIQUE (actor_id, command, client_key)`
- `FOREIGN KEY (actor_id) REFERENCES app.profiles(id)`
- `NOT NULL actor_id`
- `NOT NULL client_key`
- `NOT NULL command`
- `NOT NULL created_at`
- `NOT NULL expires_at`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `NOT NULL request_hash`
- `CHECK ((state = ANY (ARRAY['in_progress'::text, 'completed'::text])))`
- `NOT NULL state`

## identity_verifications

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| profile_id | uuid | NO |  |
| proof_type | text | NO |  |
| method | text | NO |  |
| status | text | NO | 'pending'::text |
| reviewer_id | uuid | YES |  |
| verified_at | timestamp with time zone | YES |  |
| file_id | uuid | YES |  |
| rejection_reason | text | YES |  |
| expires_at | timestamp with time zone | YES |  |
| deleted_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((reviewer_id IS NULL) OR (reviewer_id <> profile_id)))`
- `CHECK ((((status = 'pending'::text) AND (verified_at IS NULL) AND (reviewer_id IS NULL)) OR ((status = ANY (ARRAY['verified'::text, 'rejected'::text])) AND (reviewer_id IS NOT NULL) AND (verified_at IS NOT NULL))))`
- `CHECK (((method <> 'upload'::text) OR (file_id IS NOT NULL)))`
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (event_id, profile_id, proof_type)`
- `FOREIGN KEY (file_id) REFERENCES app.files(id)`
- `NOT NULL id`
- `CHECK ((method = ANY (ARRAY['in_person'::text, 'upload'::text])))`
- `NOT NULL method`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (profile_id) REFERENCES app.profiles(id)`
- `NOT NULL profile_id`
- `CHECK ((proof_type = ANY (ARRAY['aadhaar'::text, 'pan'::text, 'voter_id'::text, 'college_id'::text])))`
- `NOT NULL proof_type`
- `FOREIGN KEY (reviewer_id) REFERENCES app.profiles(id)`
- `CHECK ((status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])))`
- `NOT NULL status`

## incidents

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| organizer_id | uuid | NO |  |
| event_id | uuid | YES |  |
| reported_by | uuid | NO |  |
| assigned_to | uuid | YES |  |
| severity | text | NO |  |
| state | text | NO | 'open'::text |
| description | text | NO |  |
| resolution | text | YES |  |
| resolved_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (assigned_to) REFERENCES app.profiles(id)`
- `NOT NULL created_at`
- `NOT NULL description`
- `FOREIGN KEY (event_id, organizer_id) REFERENCES app.events(id, organizer_id)`
- `NOT NULL id`
- `FOREIGN KEY (organizer_id) REFERENCES app.organizers(id)`
- `NOT NULL organizer_id`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (reported_by) REFERENCES app.profiles(id)`
- `NOT NULL reported_by`
- `CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))`
- `NOT NULL severity`
- `CHECK ((state = ANY (ARRAY['open'::text, 'investigating'::text, 'resolved'::text, 'closed'::text])))`
- `NOT NULL state`

## institutions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO |  |
| timezone | text | NO | 'Asia/Kolkata'::text |
| support_email | text | YES |  |
| support_phone | text | YES |  |
| archived_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `NOT NULL id`
- `NOT NULL name`
- `PRIMARY KEY (id)`
- `NOT NULL timezone`

## judge_assignments

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| staff_assignment_id | uuid | NO |  |
| judge_id | uuid | NO |  |
| entry_id | uuid | NO |  |
| event_id | uuid | NO |  |
| rubric_id | uuid | NO |  |
| conflict_declared | boolean | NO | false |
| revoked_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL conflict_declared`
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `NOT NULL id`
- `UNIQUE (id, rubric_id)`
- `UNIQUE (judge_id, entry_id, rubric_id)`
- `NOT NULL judge_id`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (rubric_id, event_id) REFERENCES app.rubrics(id, event_id)`
- `NOT NULL rubric_id`
- `FOREIGN KEY (staff_assignment_id, judge_id) REFERENCES app.staff_assignments(id, profile_id)`
- `NOT NULL staff_assignment_id`

## match_substitute_activations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| match_id | uuid | NO |  |
| event_id | uuid | NO |  |
| entry_id | uuid | NO |  |
| starter_member_id | uuid | NO |  |
| substitute_member_id | uuid | NO |  |
| authorized_by | uuid | NO |  |
| reason | text | NO |  |
| activated_at | timestamp with time zone | NO | now() |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL activated_at`
- `FOREIGN KEY (authorized_by) REFERENCES app.profiles(id)`
- `NOT NULL authorized_by`
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `NOT NULL id`
- `FOREIGN KEY (match_id, event_id) REFERENCES app.esports_matches(id, event_id)`
- `NOT NULL match_id`
- `PRIMARY KEY (id)`
- `NOT NULL reason`
- `FOREIGN KEY (starter_member_id) REFERENCES app.esports_roster_members(id)`
- `NOT NULL starter_member_id`
- `FOREIGN KEY (substitute_member_id) REFERENCES app.esports_roster_members(id)`
- `NOT NULL substitute_member_id`

## match_technical_logs

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| match_id | uuid | NO |  |
| event_id | uuid | NO |  |
| entry_id | uuid | YES |  |
| official_id | uuid | NO |  |
| request_type | text | NO |  |
| decision | text | NO |  |
| reason | text | NO |  |
| pause_started_at | timestamp with time zone | YES |  |
| pause_ended_at | timestamp with time zone | YES |  |
| duration_seconds | integer | YES |  |
| penalty_points | numeric | YES |  |
| evidence_notes | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `CHECK ((decision = ANY (ARRAY['granted'::text, 'denied'::text, 'penalty'::text, 'disqualification'::text, 'restarted'::text, 'resumed'::text])))`
- `NOT NULL decision`
- `CHECK (((duration_seconds IS NULL) OR (duration_seconds >= 0)))`
- `FOREIGN KEY (entry_id) REFERENCES app.competition_entries(id)`
- `NOT NULL event_id`
- `NOT NULL id`
- `FOREIGN KEY (match_id, event_id) REFERENCES app.esports_matches(id, event_id)`
- `NOT NULL match_id`
- `FOREIGN KEY (official_id) REFERENCES app.profiles(id)`
- `NOT NULL official_id`
- `CHECK (((penalty_points IS NULL) OR (penalty_points >= (0)::numeric)))`
- `PRIMARY KEY (id)`
- `NOT NULL reason`
- `CHECK ((request_type = ANY (ARRAY['pause'::text, 'disconnect'::text, 'restart'::text, 'integrity'::text, 'penalty'::text, 'disqualification'::text])))`
- `NOT NULL request_type`

## notification_deliveries

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| outbox_id | uuid | NO |  |
| channel | text | NO |  |
| provider_message_id | text | YES |  |
| state | text | NO | 'queued'::text |
| attempt | integer | NO |  |
| last_error_code | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((attempt > 0))`
- `NOT NULL attempt`
- `CHECK ((channel = ANY (ARRAY['email'::text, 'in_app'::text, 'sms'::text, 'whatsapp'::text])))`
- `NOT NULL channel`
- `NOT NULL created_at`
- `NOT NULL id`
- `UNIQUE (outbox_id, channel, attempt)`
- `FOREIGN KEY (outbox_id) REFERENCES app.outbox(id)`
- `NOT NULL outbox_id`
- `PRIMARY KEY (id)`
- `CHECK ((state = ANY (ARRAY['queued'::text, 'accepted'::text, 'delivered'::text, 'bounced'::text, 'failed'::text])))`
- `NOT NULL state`

## notifications

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| recipient_id | uuid | NO |  |
| event_id | uuid | YES |  |
| kind | text | NO |  |
| subject | text | NO |  |
| body | text | NO |  |
| safe_internal_path | text | YES |  |
| dedupe_key | text | NO |  |
| read_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL body`
- `NOT NULL created_at`
- `UNIQUE (dedupe_key)`
- `NOT NULL dedupe_key`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL id`
- `NOT NULL kind`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (recipient_id) REFERENCES app.profiles(id)`
- `NOT NULL recipient_id`
- `NOT NULL subject`

## orders

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| registration_id | uuid | NO |  |
| event_id | uuid | NO |  |
| entry_id | uuid | NO |  |
| reservation_id | uuid | NO |  |
| payment_profile_id | uuid | NO |  |
| reference | text | NO |  |
| total_paise | bigint | NO |  |
| currency | text | NO | 'INR'::text |
| state | text | NO | 'unpaid'::text |
| price_snapshot | jsonb | NO |  |
| beneficiary_snapshot | jsonb | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL beneficiary_snapshot`
- `NOT NULL created_at`
- `CHECK ((currency = 'INR'::text))`
- `NOT NULL currency`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `UNIQUE (id, payment_profile_id)`
- `FOREIGN KEY (payment_profile_id) REFERENCES app.payment_profiles(id)`
- `NOT NULL payment_profile_id`
- `PRIMARY KEY (id)`
- `NOT NULL price_snapshot`
- `UNIQUE (reference)`
- `NOT NULL reference`
- `FOREIGN KEY (registration_id, entry_id, event_id) REFERENCES app.registrations(id, entry_id, event_id)`
- `NOT NULL registration_id`
- `FOREIGN KEY (reservation_id, entry_id, event_id) REFERENCES app.reservations(id, entry_id, event_id)`
- `NOT NULL reservation_id`
- `CHECK ((state = ANY (ARRAY['unpaid'::text, 'evidence_submitted'::text, 'under_review'::text, 'needs_information'::text, 'verified'::text, 'rejected'::text, 'void'::text, 'part_refunded'::text, 'refunded'::text])))`
- `NOT NULL state`
- `CHECK ((total_paise > 0))`
- `NOT NULL total_paise`

## organizers

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| institution_id | uuid | NO |  |
| slug | text | NO |  |
| name | text | NO |  |
| active | boolean | NO | true |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL active`
- `NOT NULL created_at`
- `UNIQUE (id, institution_id)`
- `NOT NULL id`
- `FOREIGN KEY (institution_id) REFERENCES app.institutions(id)`
- `NOT NULL institution_id`
- `NOT NULL name`
- `PRIMARY KEY (id)`
- `UNIQUE (slug)`
- `NOT NULL slug`

## outbox

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| topic | text | NO |  |
| aggregate_type | text | NO |  |
| aggregate_id | uuid | NO |  |
| recipient_id | uuid | YES |  |
| template_version | text | NO |  |
| payload | jsonb | NO |  |
| dedupe_key | text | NO |  |
| state | text | NO | 'pending'::text |
| available_at | timestamp with time zone | NO | now() |
| leased_until | timestamp with time zone | YES |  |
| lease_owner | text | YES |  |
| attempts | integer | NO | 0 |
| last_error_code | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL aggregate_id`
- `NOT NULL aggregate_type`
- `CHECK ((attempts >= 0))`
- `NOT NULL attempts`
- `NOT NULL available_at`
- `CHECK (((state <> 'leased'::text) OR ((leased_until IS NOT NULL) AND (lease_owner IS NOT NULL))))`
- `NOT NULL created_at`
- `UNIQUE (dedupe_key)`
- `NOT NULL dedupe_key`
- `NOT NULL id`
- `NOT NULL payload`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (recipient_id) REFERENCES app.profiles(id)`
- `CHECK ((state = ANY (ARRAY['pending'::text, 'leased'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])))`
- `NOT NULL state`
- `NOT NULL template_version`
- `NOT NULL topic`

## passes

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| entry_participant_id | uuid | NO |  |
| event_id | uuid | NO |  |
| profile_id | uuid | NO |  |
| version | integer | NO |  |
| token_hash | text | NO |  |
| token_ciphertext | text | NO |  |
| token_key_version | integer | NO |  |
| support_reference | text | NO |  |
| expires_at | timestamp with time zone | NO |  |
| revoked_at | timestamp with time zone | YES |  |
| revocation_reason | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `FOREIGN KEY (entry_participant_id, event_id, profile_id) REFERENCES app.entry_participants(id, event_id, profile_id)`
- `NOT NULL entry_participant_id`
- `UNIQUE (entry_participant_id, version)`
- `NOT NULL event_id`
- `NOT NULL expires_at`
- `UNIQUE (id, event_id, profile_id)`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `NOT NULL profile_id`
- `UNIQUE (support_reference)`
- `NOT NULL support_reference`
- `NOT NULL token_ciphertext`
- `CHECK ((token_hash ~ '^[0-9a-f]{64}$'::text))`
- `UNIQUE (token_hash)`
- `NOT NULL token_hash`
- `CHECK ((token_key_version > 0))`
- `NOT NULL token_key_version`
- `CHECK ((version > 0))`
- `NOT NULL version`

## payment_evidence

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| order_id | uuid | NO |  |
| version | integer | NO |  |
| submitted_by | uuid | NO |  |
| transaction_reference | text | NO |  |
| claimed_amount_paise | bigint | NO |  |
| claimed_paid_at | timestamp with time zone | YES |  |
| receipt_file_id | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((claimed_amount_paise > 0))`
- `NOT NULL claimed_amount_paise`
- `NOT NULL created_at`
- `NOT NULL id`
- `UNIQUE (id, order_id)`
- `FOREIGN KEY (order_id) REFERENCES app.orders(id)`
- `NOT NULL order_id`
- `UNIQUE (order_id, version)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (receipt_file_id) REFERENCES app.files(id)`
- `FOREIGN KEY (submitted_by) REFERENCES app.profiles(id)`
- `NOT NULL submitted_by`
- `NOT NULL transaction_reference`
- `CHECK ((version > 0))`
- `NOT NULL version`

## payment_exceptions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| order_id | uuid | NO |  |
| kind | text | NO |  |
| state | text | NO | 'open'::text |
| assigned_to | uuid | YES |  |
| reason | text | NO |  |
| resolved_by | uuid | YES |  |
| resolved_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (assigned_to) REFERENCES app.profiles(id)`
- `NOT NULL created_at`
- `NOT NULL id`
- `CHECK ((kind = ANY (ARRAY['late_credit'::text, 'underpayment'::text, 'overpayment'::text, 'duplicate_reference'::text, 'wrong_beneficiary'::text, 'missing_reference'::text, 'invalid_evidence'::text, 'other'::text])))`
- `NOT NULL kind`
- `FOREIGN KEY (order_id) REFERENCES app.orders(id)`
- `NOT NULL order_id`
- `PRIMARY KEY (id)`
- `NOT NULL reason`
- `FOREIGN KEY (resolved_by) REFERENCES app.profiles(id)`
- `CHECK ((state = ANY (ARRAY['open'::text, 'in_review'::text, 'resolved'::text])))`
- `NOT NULL state`

## payment_profile_approvals

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| payment_profile_id | uuid | NO |  |
| approver_id | uuid | NO |  |
| outcome | text | NO |  |
| verified_destination | boolean | NO |  |
| evidence_reference | text | NO |  |
| reason | text | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (approver_id) REFERENCES app.profiles(id)`
- `NOT NULL approver_id`
- `NOT NULL created_at`
- `NOT NULL evidence_reference`
- `NOT NULL id`
- `CHECK ((outcome = ANY (ARRAY['approved'::text, 'rejected'::text])))`
- `NOT NULL outcome`
- `UNIQUE (payment_profile_id, approver_id)`
- `FOREIGN KEY (payment_profile_id) REFERENCES app.payment_profiles(id)`
- `NOT NULL payment_profile_id`
- `PRIMARY KEY (id)`
- `NOT NULL reason`
- `NOT NULL verified_destination`

## payment_profiles

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| institution_id | uuid | NO |  |
| version | integer | NO |  |
| beneficiary_name | text | NO |  |
| upi_id | text | NO |  |
| receiving_account_reference | text | NO |  |
| qr_file_id | uuid | NO |  |
| qr_sha256 | text | NO |  |
| state | text | NO | 'draft'::text |
| proposed_by | uuid | NO |  |
| activated_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL beneficiary_name`
- `NOT NULL created_at`
- `UNIQUE (id, institution_id)`
- `NOT NULL id`
- `UNIQUE (id, receiving_account_reference)`
- `FOREIGN KEY (institution_id) REFERENCES app.institutions(id)`
- `NOT NULL institution_id`
- `UNIQUE (institution_id, version)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (proposed_by) REFERENCES app.profiles(id)`
- `NOT NULL proposed_by`
- `FOREIGN KEY (qr_file_id) REFERENCES app.files(id)`
- `NOT NULL qr_file_id`
- `CHECK ((qr_sha256 ~ '^[0-9a-f]{64}$'::text))`
- `NOT NULL qr_sha256`
- `NOT NULL receiving_account_reference`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'pending_approval'::text, 'active'::text, 'retired'::text, 'suspended'::text])))`
- `NOT NULL state`
- `NOT NULL upi_id`
- `CHECK ((version > 0))`
- `NOT NULL version`

## payment_reviews

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| order_id | uuid | NO |  |
| evidence_id | uuid | NO |  |
| reviewer_id | uuid | NO |  |
| outcome | text | NO |  |
| reason | text | NO |  |
| credit_id | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((outcome <> 'verified'::text) OR (credit_id IS NOT NULL)))`
- `NOT NULL created_at`
- `FOREIGN KEY (credit_id) REFERENCES app.bank_credits(id)`
- `NOT NULL evidence_id`
- `FOREIGN KEY (evidence_id, order_id) REFERENCES app.payment_evidence(id, order_id)`
- `NOT NULL id`
- `NOT NULL order_id`
- `CHECK ((outcome = ANY (ARRAY['verified'::text, 'rejected'::text, 'needs_information'::text, 'exception'::text])))`
- `NOT NULL outcome`
- `PRIMARY KEY (id)`
- `NOT NULL reason`
- `FOREIGN KEY (reviewer_id) REFERENCES app.profiles(id)`
- `NOT NULL reviewer_id`

## player_profiles

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| profile_id | uuid | NO |  |
| game | text | NO |  |
| player_uid | text | NO |  |
| display_name | text | NO |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `NOT NULL display_name`
- `CHECK ((game = ANY (ARRAY['free-fire'::text, 'bgmi'::text])))`
- `NOT NULL game`
- `UNIQUE (game, player_uid)`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `NOT NULL player_uid`
- `FOREIGN KEY (profile_id) REFERENCES app.profiles(id)`
- `UNIQUE (profile_id, game)`
- `NOT NULL profile_id`

## poll_evidence

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| award_id | uuid | NO |  |
| official_url | text | NO |  |
| opens_at | timestamp with time zone | NO |  |
| closes_at | timestamp with time zone | NO |  |
| evidence_file_id | uuid | NO |  |
| winner_entry_id | uuid | NO |  |
| recorded_by | uuid | NO |  |
| verified_by | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (award_id, event_id) REFERENCES app.awards(id, event_id)`
- `NOT NULL award_id`
- `CHECK ((closes_at > opens_at))`
- `CHECK (((verified_by IS NULL) OR (verified_by <> recorded_by)))`
- `NOT NULL closes_at`
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `FOREIGN KEY (evidence_file_id) REFERENCES app.files(id)`
- `NOT NULL evidence_file_id`
- `NOT NULL id`
- `NOT NULL official_url`
- `NOT NULL opens_at`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (recorded_by) REFERENCES app.profiles(id)`
- `NOT NULL recorded_by`
- `FOREIGN KEY (verified_by) REFERENCES app.profiles(id)`
- `FOREIGN KEY (winner_entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL winner_entry_id`

## price_options

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_version_id | uuid | NO |  |
| event_id | uuid | NO |  |
| mode | text | NO |  |
| amount_paise | bigint | YES |  |
| enabled | boolean | NO | false |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((amount_paise >= 0))`
- `CHECK (((NOT enabled) OR (amount_paise IS NOT NULL)))`
- `NOT NULL created_at`
- `NOT NULL enabled`
- `NOT NULL event_id`
- `FOREIGN KEY (event_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `UNIQUE (event_version_id, mode)`
- `NOT NULL event_version_id`
- `UNIQUE (id, event_version_id, event_id, mode)`
- `NOT NULL id`
- `CHECK ((mode = ANY (ARRAY['team'::text, 'individual'::text, 'stall'::text, 'entry'::text])))`
- `NOT NULL mode`
- `PRIMARY KEY (id)`

## profiles

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO |  |
| display_name | text | NO |  |
| contact_email | text | NO |  |
| phone | text | YES |  |
| college_id | uuid | YES |  |
| college_name_other | text | YES |  |
| course | text | YES |  |
| year_of_study | text | YES |  |
| college_id_reference | text | YES |  |
| affiliation | text | NO |  |
| status | text | NO | 'active'::text |
| publicity_consent | boolean | NO | false |
| privacy_version | text | YES |  |
| privacy_accepted_at | timestamp with time zone | YES |  |
| row_version | integer | NO | 1 |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((affiliation = ANY (ARRAY['student'::text, 'teacher'::text, 'other'::text])))`
- `NOT NULL affiliation`
- `CHECK (((college_id IS NULL) OR (college_name_other IS NULL)))`
- `FOREIGN KEY (college_id) REFERENCES app.colleges(id)`
- `NOT NULL contact_email`
- `NOT NULL created_at`
- `NOT NULL display_name`
- `FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE RESTRICT`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `NOT NULL publicity_consent`
- `NOT NULL row_version`
- `CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'anonymized'::text])))`
- `NOT NULL status`

## refunds

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| order_id | uuid | NO |  |
| amount_paise | bigint | NO |  |
| reason | text | NO |  |
| requested_by | uuid | NO |  |
| approved_by | uuid | YES |  |
| state | text | NO | 'requested'::text |
| bank_reference | text | YES |  |
| completed_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((amount_paise > 0))`
- `NOT NULL amount_paise`
- `FOREIGN KEY (approved_by) REFERENCES app.profiles(id)`
- `UNIQUE (bank_reference)`
- `CHECK (((approved_by IS NULL) OR (approved_by <> requested_by)))`
- `CHECK (((state <> 'completed'::text) OR ((bank_reference IS NOT NULL) AND (completed_at IS NOT NULL))))`
- `NOT NULL created_at`
- `NOT NULL id`
- `FOREIGN KEY (order_id) REFERENCES app.orders(id)`
- `NOT NULL order_id`
- `PRIMARY KEY (id)`
- `NOT NULL reason`
- `FOREIGN KEY (requested_by) REFERENCES app.profiles(id)`
- `NOT NULL requested_by`
- `CHECK ((state = ANY (ARRAY['requested'::text, 'approved'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'rejected'::text])))`
- `NOT NULL state`

## registration_members

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| registration_id | uuid | NO |  |
| event_id | uuid | NO |  |
| profile_id | uuid | NO |  |
| state | text | NO | 'invited'::text |
| consented_at | timestamp with time zone | YES |  |
| rules_version_id | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((state <> 'accepted'::text) OR ((consented_at IS NOT NULL) AND (rules_version_id IS NOT NULL))))`
- `NOT NULL created_at`
- `NOT NULL event_id`
- `NOT NULL id`
- `UNIQUE (id, registration_id, event_id, profile_id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (profile_id) REFERENCES app.profiles(id)`
- `NOT NULL profile_id`
- `FOREIGN KEY (registration_id, event_id) REFERENCES app.registrations(id, event_id)`
- `NOT NULL registration_id`
- `UNIQUE (registration_id, profile_id)`
- `FOREIGN KEY (rules_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `CHECK ((state = ANY (ARRAY['invited'::text, 'accepted'::text, 'declined'::text, 'removed'::text])))`
- `NOT NULL state`

## registrations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| reference | text | NO |  |
| owner_id | uuid | NO |  |
| event_id | uuid | NO |  |
| event_version_id | uuid | NO |  |
| price_option_id | uuid | NO |  |
| mode | text | NO |  |
| entry_id | uuid | YES |  |
| state | text | NO | 'draft'::text |
| rules_accepted_at | timestamp with time zone | YES |  |
| roster_snapshot | jsonb | YES |  |
| row_version | integer | NO | 1 |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((state <> 'confirmed'::text) OR ((entry_id IS NOT NULL) AND (rules_accepted_at IS NOT NULL))))`
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_version_id, event_id) REFERENCES app.competition_entries(id, event_version_id, event_id)`
- `NOT NULL event_id`
- `NOT NULL event_version_id`
- `UNIQUE (id, entry_id, event_id)`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `CHECK ((mode = ANY (ARRAY['team'::text, 'individual'::text, 'stall'::text, 'entry'::text])))`
- `NOT NULL mode`
- `FOREIGN KEY (owner_id) REFERENCES app.profiles(id)`
- `NOT NULL owner_id`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (price_option_id, event_version_id, event_id, mode) REFERENCES app.price_options(id, event_version_id, event_id, mode)`
- `NOT NULL price_option_id`
- `UNIQUE (reference)`
- `NOT NULL reference`
- `NOT NULL row_version`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'awaiting_members'::text, 'awaiting_allocation'::text, 'waitlisted'::text, 'payment_due'::text, 'payment_review'::text, 'action_required'::text, 'confirmed'::text, 'expired'::text, 'cancelled'::text, 'disqualified'::text])))`
- `NOT NULL state`

## reservations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| entry_id | uuid | NO |  |
| event_id | uuid | NO |  |
| units | integer | NO | 1 |
| state | text | NO | 'held'::text |
| expires_at | timestamp with time zone | NO |  |
| review_deadline_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `NOT NULL expires_at`
- `UNIQUE (id, entry_id, event_id)`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `CHECK ((state = ANY (ARRAY['held'::text, 'review_hold'::text, 'confirmed'::text, 'released'::text, 'expired'::text])))`
- `NOT NULL state`
- `CHECK ((units = 1))`
- `NOT NULL units`

## result_revisions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| revision | integer | NO |  |
| state | text | NO | 'draft'::text |
| calculation_version | text | NO |  |
| proposed_by | uuid | NO |  |
| approved_by | uuid | YES |  |
| published_at | timestamp with time zone | YES |  |
| reason | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (approved_by) REFERENCES app.profiles(id)`
- `NOT NULL calculation_version`
- `CHECK (((approved_by IS NULL) OR (approved_by <> proposed_by)))`
- `CHECK (((state <> 'published'::text) OR ((approved_by IS NOT NULL) AND (published_at IS NOT NULL))))`
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (event_id, revision)`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (proposed_by) REFERENCES app.profiles(id)`
- `NOT NULL proposed_by`
- `CHECK ((revision > 0))`
- `NOT NULL revision`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'proposed'::text, 'published'::text, 'superseded'::text])))`
- `NOT NULL state`

## result_rows

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| result_revision_id | uuid | NO |  |
| event_id | uuid | NO |  |
| entry_id | uuid | NO |  |
| total_marks | numeric | YES |  |
| rank | integer | YES |  |
| tie_reason | text | YES |  |
| source_scorecard_ids | jsonb | NO | '[]'::jsonb |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `CHECK ((rank > 0))`
- `UNIQUE (result_revision_id, entry_id)`
- `FOREIGN KEY (result_revision_id, event_id) REFERENCES app.result_revisions(id, event_id)`
- `NOT NULL result_revision_id`
- `NOT NULL source_scorecard_ids`

## rubric_criteria

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| rubric_id | uuid | NO |  |
| label | text | NO |  |
| max_marks | numeric | NO |  |
| position | integer | NO |  |
| conditional | boolean | NO | false |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL conditional`
- `NOT NULL created_at`
- `NOT NULL id`
- `UNIQUE (id, rubric_id)`
- `NOT NULL label`
- `CHECK ((max_marks > (0)::numeric))`
- `NOT NULL max_marks`
- `PRIMARY KEY (id)`
- `CHECK (("position" > 0))`
- `NOT NULL "position"`
- `FOREIGN KEY (rubric_id) REFERENCES app.rubrics(id)`
- `NOT NULL rubric_id`
- `UNIQUE (rubric_id, "position")`

## rubrics

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_version_id | uuid | NO |  |
| event_id | uuid | NO |  |
| name | text | NO |  |
| max_marks | numeric | NO |  |
| aggregation_policy | jsonb | YES |  |
| conditional_criteria_policy | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `NOT NULL event_id`
- `FOREIGN KEY (event_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `NOT NULL event_version_id`
- `UNIQUE (id, event_id)`
- `UNIQUE (id, event_version_id, event_id)`
- `NOT NULL id`
- `CHECK ((max_marks > (0)::numeric))`
- `NOT NULL max_marks`
- `NOT NULL name`
- `PRIMARY KEY (id)`

## scorecards

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| judge_assignment_id | uuid | NO |  |
| rubric_id | uuid | NO |  |
| revision | integer | NO | 1 |
| state | text | NO | 'draft'::text |
| locked_at | timestamp with time zone | YES |  |
| reopened_reason | text | YES |  |
| reopened_by | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((state <> 'locked'::text) OR (locked_at IS NOT NULL)))`
- `NOT NULL created_at`
- `NOT NULL id`
- `UNIQUE (id, rubric_id)`
- `NOT NULL judge_assignment_id`
- `UNIQUE (judge_assignment_id, revision)`
- `FOREIGN KEY (judge_assignment_id, rubric_id) REFERENCES app.judge_assignments(id, rubric_id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (reopened_by) REFERENCES app.profiles(id)`
- `CHECK ((revision > 0))`
- `NOT NULL revision`
- `NOT NULL rubric_id`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'locked'::text, 'superseded'::text])))`
- `NOT NULL state`

## scores

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| scorecard_id | uuid | NO |  |
| rubric_id | uuid | NO |  |
| criterion_id | uuid | NO |  |
| marks | numeric | NO |  |
| note | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `NOT NULL criterion_id`
- `FOREIGN KEY (criterion_id, rubric_id) REFERENCES app.rubric_criteria(id, rubric_id)`
- `NOT NULL id`
- `CHECK ((marks >= (0)::numeric))`
- `NOT NULL marks`
- `PRIMARY KEY (id)`
- `NOT NULL rubric_id`
- `UNIQUE (scorecard_id, criterion_id)`
- `NOT NULL scorecard_id`
- `FOREIGN KEY (scorecard_id, rubric_id) REFERENCES app.scorecards(id, rubric_id)`

## sessions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| venue_id | uuid | YES |  |
| label | text | NO |  |
| starts_at | timestamp with time zone | NO |  |
| ends_at | timestamp with time zone | NO |  |
| reporting_at | timestamp with time zone | YES |  |
| state | text | NO | 'draft'::text |
| row_version | integer | NO | 1 |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((ends_at > starts_at))`
- `CHECK (((reporting_at IS NULL) OR (reporting_at <= starts_at)))`
- `NOT NULL created_at`
- `NOT NULL ends_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `NOT NULL label`
- `PRIMARY KEY (id)`
- `NOT NULL row_version`
- `NOT NULL starts_at`
- `CHECK ((state = ANY (ARRAY['draft'::text, 'published'::text, 'cancelled'::text, 'completed'::text])))`
- `NOT NULL state`
- `FOREIGN KEY (venue_id) REFERENCES app.venues(id)`

## staff_assignments

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| profile_id | uuid | NO |  |
| institution_id | uuid | NO |  |
| organizer_id | uuid | YES |  |
| event_id | uuid | YES |  |
| role | text | NO |  |
| starts_at | timestamp with time zone | NO |  |
| ends_at | timestamp with time zone | NO |  |
| granted_by | uuid | NO |  |
| reason | text | NO |  |
| revoked_at | timestamp with time zone | YES |  |
| revoked_by | uuid | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((ends_at > starts_at))`
- `CHECK ((((role = 'super_admin'::text) AND (organizer_id IS NULL) AND (event_id IS NULL)) OR ((role <> 'super_admin'::text) AND (organizer_id IS NOT NULL))))`
- `CHECK (((role <> ALL (ARRAY['volunteer'::text, 'judge'::text, 'teacher'::text])) OR (event_id IS NOT NULL)))`
- `NOT NULL created_at`
- `NOT NULL ends_at`
- `FOREIGN KEY (event_id, organizer_id) REFERENCES app.events(id, organizer_id)`
- `FOREIGN KEY (granted_by) REFERENCES app.profiles(id)`
- `NOT NULL granted_by`
- `NOT NULL id`
- `UNIQUE (id, profile_id)`
- `FOREIGN KEY (institution_id) REFERENCES app.institutions(id)`
- `NOT NULL institution_id`
- `FOREIGN KEY (organizer_id, institution_id) REFERENCES app.organizers(id, institution_id)`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (profile_id) REFERENCES app.profiles(id)`
- `NOT NULL profile_id`
- `NOT NULL reason`
- `FOREIGN KEY (revoked_by) REFERENCES app.profiles(id)`
- `CHECK ((role = ANY (ARRAY['teacher'::text, 'volunteer'::text, 'judge'::text, 'event_admin'::text, 'finance_reviewer'::text, 'export_operator'::text, 'super_admin'::text])))`
- `NOT NULL role`
- `NOT NULL starts_at`

## station_hardware_checks

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| station_id | uuid | NO |  |
| event_id | uuid | NO |  |
| session_id | uuid | YES |  |
| asset_code | text | NO |  |
| config_version | text | NO |  |
| inspector_id | uuid | NO |  |
| result | text | NO |  |
| reason | text | YES |  |
| checked_at | timestamp with time zone | NO | now() |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL asset_code`
- `NOT NULL checked_at`
- `NOT NULL config_version`
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `NOT NULL id`
- `FOREIGN KEY (inspector_id) REFERENCES app.profiles(id)`
- `NOT NULL inspector_id`
- `PRIMARY KEY (id)`
- `CHECK ((result = ANY (ARRAY['passed'::text, 'failed'::text, 'flagged'::text])))`
- `NOT NULL result`
- `FOREIGN KEY (session_id) REFERENCES app.sessions(id)`
- `FOREIGN KEY (station_id) REFERENCES app.stations(id)`
- `NOT NULL station_id`

## stations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| event_id | uuid | NO |  |
| venue_id | uuid | YES |  |
| name | text | NO |  |
| kind | text | NO |  |
| active | boolean | NO | true |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL active`
- `NOT NULL created_at`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `UNIQUE (id, event_id)`
- `NOT NULL id`
- `CHECK ((kind = ANY (ARRAY['entry'::text, 'checkpoint'::text, 'helpdesk'::text])))`
- `NOT NULL kind`
- `NOT NULL name`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (venue_id) REFERENCES app.venues(id)`

## team_declarations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| registration_id | uuid | NO |  |
| event_id | uuid | NO |  |
| rules_version_id | uuid | NO |  |
| leader_id | uuid | NO |  |
| declaration_text_version | text | NO |  |
| declaration_hash | text | NO |  |
| ip_address | text | YES |  |
| user_agent | text | YES |  |
| accepted_at | timestamp with time zone | NO | now() |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL accepted_at`
- `NOT NULL created_at`
- `NOT NULL declaration_hash`
- `NOT NULL declaration_text_version`
- `FOREIGN KEY (event_id) REFERENCES app.events(id)`
- `NOT NULL event_id`
- `NOT NULL id`
- `FOREIGN KEY (leader_id) REFERENCES app.profiles(id)`
- `NOT NULL leader_id`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (registration_id) REFERENCES app.registrations(id)`
- `NOT NULL registration_id`
- `UNIQUE (registration_id, rules_version_id)`
- `FOREIGN KEY (rules_version_id, event_id) REFERENCES app.event_versions(id, event_id)`
- `NOT NULL rules_version_id`

## team_invitations

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| registration_id | uuid | NO |  |
| invited_email | text | NO |  |
| invited_by | uuid | NO |  |
| token_hash | text | NO |  |
| expires_at | timestamp with time zone | NO |  |
| accepted_by | uuid | YES |  |
| accepted_at | timestamp with time zone | YES |  |
| revoked_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `FOREIGN KEY (accepted_by) REFERENCES app.profiles(id)`
- `CHECK (((accepted_by IS NULL) = (accepted_at IS NULL)))`
- `NOT NULL created_at`
- `NOT NULL expires_at`
- `NOT NULL id`
- `FOREIGN KEY (invited_by) REFERENCES app.profiles(id)`
- `NOT NULL invited_by`
- `NOT NULL invited_email`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (registration_id) REFERENCES app.registrations(id)`
- `NOT NULL registration_id`
- `CHECK ((token_hash ~ '^[0-9a-f]{64}$'::text))`
- `UNIQUE (token_hash)`
- `NOT NULL token_hash`

## venues

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| institution_id | uuid | NO |  |
| name | text | NO |  |
| directions | text | YES |  |
| accessibility_notes | text | YES |  |
| capacity | integer | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK ((capacity > 0))`
- `NOT NULL created_at`
- `NOT NULL id`
- `FOREIGN KEY (institution_id) REFERENCES app.institutions(id)`
- `NOT NULL institution_id`
- `NOT NULL name`
- `PRIMARY KEY (id)`

## verification_requests

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| profile_id | uuid | NO |  |
| kind | text | NO |  |
| status | text | NO | 'pending'::text |
| reviewed_by | uuid | YES |  |
| reviewed_at | timestamp with time zone | YES |  |
| reason | text | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((reviewed_by IS NULL) OR (reviewed_by <> profile_id)))`
- `NOT NULL created_at`
- `NOT NULL id`
- `CHECK ((kind = ANY (ARRAY['teacher'::text, 'eligibility'::text, 'account_recovery'::text])))`
- `NOT NULL kind`
- `PRIMARY KEY (id)`
- `FOREIGN KEY (profile_id) REFERENCES app.profiles(id)`
- `NOT NULL profile_id`
- `FOREIGN KEY (reviewed_by) REFERENCES app.profiles(id)`
- `CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))`
- `NOT NULL status`

## waitlist_entries

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| entry_id | uuid | NO |  |
| event_id | uuid | NO |  |
| position | bigint | NO |  |
| state | text | NO | 'waiting'::text |
| offered_at | timestamp with time zone | YES |  |
| offer_expires_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `CHECK (((offer_expires_at IS NULL) OR ((offered_at IS NOT NULL) AND (offer_expires_at > offered_at))))`
- `NOT NULL created_at`
- `FOREIGN KEY (entry_id, event_id) REFERENCES app.competition_entries(id, event_id)`
- `UNIQUE (entry_id)`
- `NOT NULL entry_id`
- `NOT NULL event_id`
- `NOT NULL id`
- `PRIMARY KEY (id)`
- `NOT NULL "position"`
- `CHECK ((state = ANY (ARRAY['waiting'::text, 'offered'::text, 'accepted'::text, 'expired'::text, 'withdrawn'::text])))`
- `NOT NULL state`

## webhook_receipts

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() |
| provider | text | NO |  |
| provider_event_id | text | NO |  |
| signature_verified | boolean | NO |  |
| payload_hash | text | NO |  |
| processed_at | timestamp with time zone | YES |  |
| created_at | timestamp with time zone | NO | now() |

Constraints:
- `NOT NULL created_at`
- `NOT NULL id`
- `NOT NULL payload_hash`
- `PRIMARY KEY (id)`
- `NOT NULL provider_event_id`
- `NOT NULL provider`
- `UNIQUE (provider, provider_event_id)`
- `CHECK (signature_verified)`
- `NOT NULL signature_verified`
