# Spritebury — Codex Planning Prompt and Recommended Tech Stack

Use this file as the first planning brief for VS Code Codex. The goal is to make Spritebury a browser-based, early-2000s-style virtual city game where players live in one shared city, own avatars, clothes, pets, homes, furniture, vehicles, and earn fake in-game money through jobs.

The game should be treated less like an animated game engine and more like a multiplayer social web app with a game economy, persistent ownership, and real-time presence.

---

## 1. Copy/paste prompt for VS Code Codex

```text
You are a senior full-stack web architect and technical planning assistant. Do not implement the game yet. First create a thorough implementation plan for a browser-based pixel-art virtual city game called Spritebury.

Project summary:
Spritebury is a nostalgic early/mid-2000s-style virtual city community game. Each player has an account, a profile, a static pixel-art avatar, outfits, pets, cars, a home/apartment, furniture, fake in-game currency, jobs, shop purchases, and social features. Players do not own the whole city. They live inside a shared city. The city is a set of public and private locations such as Town Square, Boutique, Pet Shop, Cafe, Apartments, Job Office, and player homes.

Important gameplay constraint:
There is no animation requirement for the MVP. Sprites can be static. The important work is data modeling, ownership correctness, transactions, multiplayer presence, profile/inventory management, and a clean structure for future expansion.

Create a set of markdown planning documents before writing code:
1. docs/01-product-vision.md
2. docs/02-recommended-tech-stack.md
3. docs/03-architecture.md
4. docs/04-data-model.md
5. docs/05-api-and-game-actions.md
6. docs/06-realtime-multiplayer.md
7. docs/07-testing-strategy.md
8. docs/08-implementation-roadmap.md
9. docs/09-security-and-anti-cheat.md
10. docs/10-content-pipeline.md

Recommended stack to evaluate and use unless there is a strong reason not to:
- TypeScript everywhere.
- Next.js App Router for the web app.
- React components for static pixel-art screens and UI.
- Supabase for hosted PostgreSQL, Auth, Storage, and Realtime.
- Drizzle ORM or SQL migrations for schema control; prefer explicit SQL migrations for RLS policies, constraints, and game transactions.
- Vitest for unit tests.
- Playwright for E2E tests.
- Zod or similar validation for server command inputs.

Core architectural requirements:
- PostgreSQL is the source of truth for accounts, profiles, avatars, inventory, wallets, jobs, purchases, pets, homes, furniture, vehicles, friendships, and chat history.
- The client must never be trusted to grant money, items, pets, vehicles, furniture, or job rewards.
- All economy-changing actions must run as server-authoritative commands inside database transactions.
- Every currency change must create a currency ledger entry.
- Purchases must be idempotent where appropriate and protected against double spending.
- Inventory ownership must be represented as ownership records, not just arrays inside a player object.
- Catalog definitions and player-owned instances must be separate tables.
- Realtime multiplayer should separate ephemeral online presence from permanent player data.
- Presence/chat/location changes can be realtime, but persistent ownership is written transactionally to the database.
- Design for TDD: include unit, integration, E2E, RLS, and concurrency tests before implementation tasks.

MVP features to plan:
1. Opening screen with Play / Login / Create Avatar.
2. Auth and account/profile creation.
3. Avatar creation using static outfit sprites.
4. Player profile page with avatar, bio, currency, badges, pets, and public items.
5. Town Square location with visible online players.
6. Boutique shop: buy clothing/outfit items with fake currency.
7. Wardrobe: equip owned outfits.
8. Jobs: perform simple cooldown-based jobs to earn fake currency.
9. Pet shop: adopt a pet.
10. Apartments: each player owns a default home room.
11. Furniture inventory and basic room decoration.
12. Friends list and basic chat.

Plan the database carefully. Include suggested tables, columns, relationships, constraints, indexes, and transaction boundaries.

Data modeling priorities:
- profiles
- avatars
- avatar_appearances or equipped_items
- asset_catalog
- item_catalog
- inventory_items
- wallets
- currency_ledger
- jobs
- job_runs
- shops
- shop_items
- purchase_transactions
- pets and player_pets
- vehicles and player_vehicles
- homes, rooms, furniture_catalog, furniture_inventory, placed_furniture
- locations
- friendships
- chat_messages
- moderation_reports
- audit_logs

For each game action, define:
- Input payload
- Auth requirements
- Server validation
- Database transaction steps
- Realtime events emitted after commit
- Tests required

Required game actions:
- createProfile
- createAvatar
- enterLocation
- leaveLocation
- buyItem
- equipItem
- unequipItem
- saveOutfit
- startJob
- completeJob
- adoptPet
- buyFurniture
- placeFurniture
- moveFurniture
- removeFurniture
- sendChatMessage
- sendFriendRequest
- acceptFriendRequest
- updateProfile

Testing requirements:
Use TDD. For each feature, first write or plan tests.
Include:
- Unit tests for validators and economy calculations.
- Integration tests for database commands and transaction safety.
- E2E tests for signup, avatar creation, buying clothing, equipping clothing, earning job money, adopting a pet, entering a room, and seeing another player online.
- Concurrency tests proving two simultaneous purchases cannot overspend a wallet.
- Security tests proving a player cannot mutate another player’s inventory, wallet, home, pet, or profile.

Implementation style:
- Keep domain logic out of React components.
- Use a src/server/game-actions directory for server-authoritative commands.
- Use a src/domain directory for pure types, constants, validators, and testable logic.
- Use a src/components directory for UI.
- Use a src/features directory for feature-specific UI and hooks.
- Use migrations and seed scripts for catalog data.
- Use clear naming and comments only for non-obvious logic.

Deliver a practical phased roadmap:
Phase 0: Repo setup, linting, testing, environment variables.
Phase 1: Database schema and seed data.
Phase 2: Auth, profiles, avatars.
Phase 3: Static city screens and location routing.
Phase 4: Inventory, wardrobe, shop, purchases.
Phase 5: Jobs and currency ledger.
Phase 6: Realtime location presence and chat.
Phase 7: Pets, homes, furniture.
Phase 8: Admin/content tooling, moderation, deployment hardening.

Output all documents in markdown. Do not write production code yet except tiny illustrative pseudocode or schema examples where useful.
```

---

## 2. Recommended stack

### Primary recommendation

Use this stack for the MVP:

| Layer | Recommendation | Why it fits Spritebury |
|---|---|---|
| Language | TypeScript | One type system across frontend, backend commands, validation, tests, and schema helpers. |
| Frontend | Next.js App Router + React | Spritebury is a web app with static pixel-art screens, menus, profiles, shops, and forms. It does not need a heavy game engine for the MVP. |
| Styling | Tailwind CSS plus CSS modules for pixel-specific styling | Fast UI building, while still allowing exact pixel-art classes like `image-rendering: pixelated`. |
| Database | PostgreSQL, hosted through Supabase | Relational data is the correct fit for ownership, inventory, currency ledger, jobs, friendships, homes, furniture, and transactions. |
| Auth | Supabase Auth | Avoid building login/session infrastructure from scratch. |
| Realtime | Supabase Realtime Presence/Broadcast/Postgres Changes | Good fit for online players in rooms, lightweight chat, notifications, and room updates. |
| File/assets | Supabase Storage or local `/public/assets` during MVP | Store generated spritesheets, backgrounds, item icons, pet sprites, and furniture sprites. |
| ORM/schema | Drizzle ORM + SQL migrations, or SQL-first migrations with generated TypeScript types | SQL clarity matters because game correctness depends on constraints, transactions, indexes, RLS policies, and ledger rules. |
| Validation | Zod | Validate every server command input before touching the database. |
| Unit tests | Vitest | Fast TypeScript tests for validators, pricing rules, economy helpers, and pure domain logic. |
| E2E tests | Playwright | Test real browser flows: login, create avatar, buy item, equip item, earn money, join location. |
| Deployment | Vercel for Next.js + Supabase hosted backend | Low-ops path for a solo/freelance project. |

### Why not start with Phaser/PixiJS?

Do not start with a canvas game engine unless you later need map scrolling, animated movement, collision, pathfinding, or large tile maps. The MVP screens can be built with regular React components and static pixel-art images.

For Spritebury, the hard parts are:

- correct persistent player data;
- inventory and ownership;
- fake currency ledger;
- purchase/job transactions;
- multiplayer presence;
- social features;
- moderation and safety.

A canvas engine would not solve those problems. It would add complexity too early.

### When to add a rendering engine later

Add PixiJS or Phaser later only if the game needs:

- animated walking;
- drag-and-drop map placement at high scale;
- scrolling tile maps;
- collision zones;
- visual effects;
- many moving objects at once.

Until then, use static layered DOM or static `<img>` sprites with CSS.

---

## 3. Game architecture overview

Spritebury should use a server-authoritative architecture.

```text
Browser / React UI
  |
  | reads public catalog data, profile data, location state
  | sends user intentions: buy item, equip item, complete job, enter room
  v
Next.js server actions / route handlers
  |
  | validates auth, validates payloads, runs game command logic
  v
PostgreSQL / Supabase
  |
  | persistent source of truth: players, inventory, wallets, ledgers, homes
  v
Realtime channel events
  |
  | presence, room updates, chat notifications after committed changes
  v
Browser updates UI
```

The client should send intentions, not results.

Bad:

```json
{ "playerId": "p1", "newBalance": 999999 }
```

Good:

```json
{ "action": "completeJob", "jobId": "cafe_shift" }
```

The server then decides whether the player is allowed to complete the job, how much money to award, and what ledger entry to create.

---

## 4. Core product model

### One shared city, many player lives

Spritebury is not a city-builder where one player owns a city. It is a shared city/community world.

Players have:

- profile;
- avatar;
- wardrobe/outfits;
- inventory;
- fake money;
- jobs/job history;
- pets;
- vehicles;
- home/apartment;
- furniture;
- friends;
- chat/messages;
- achievements/badges later.

The city has:

- public locations;
- shops;
- jobs;
- NPC/service buildings;
- seasonal events later;
- shared chat/presence per room/location.

---

## 5. Data modeling principles

### 5.1 Separate catalog definitions from player ownership

A catalog item defines what an item is. An inventory item proves a player owns it.

Example:

```text
item_catalog
- id: "outfit_red_hoodie"
- name: "Red Hoodie Outfit"
- category: "outfit"
- price: 120
- asset_id: "asset_red_hoodie_sprite"

inventory_items
- id: uuid
- player_id: uuid
- item_catalog_id: "outfit_red_hoodie"
- quantity: 1
- acquired_at: timestamp
- source: "shop_purchase"
```

Do not store ownership as a JSON array on the profile like this:

```json
{
  "ownedItems": ["red_hoodie", "blue_jeans", "dog_pet"]
}
```

That becomes hard to query, secure, audit, index, and migrate.

### 5.2 Use a ledger for fake currency

A wallet balance is useful for fast display, but every balance change should also create a ledger row.

```text
wallets
- player_id
- balance
- updated_at

currency_ledger
- id
- player_id
- amount_delta
- reason
- related_entity_type
- related_entity_id
- idempotency_key
- created_at
```

Rules:

- Job rewards create positive ledger entries.
- Purchases create negative ledger entries.
- Admin grants create positive ledger entries with an admin reason.
- Refunds create positive ledger entries linked to the original transaction.
- No client action directly sets balance.

### 5.3 Use database transactions for economy changes

Buying an item should be one atomic transaction:

1. Authenticate player.
2. Load shop item and current price.
3. Lock the player wallet row.
4. Check balance.
5. Insert purchase transaction.
6. Insert inventory ownership record.
7. Insert negative currency ledger entry.
8. Update wallet balance.
9. Commit.
10. Emit realtime notification after commit.

If any step fails, the item must not be granted and the money must not be removed.

### 5.4 Keep presence ephemeral

A player being online in Town Square is not the same as owning an item.

Persistent data:

- profiles;
- inventory;
- wallet;
- homes;
- pets;
- chat history, if stored.

Ephemeral realtime data:

- currently online;
- current location presence;
- typing status;
- temporary cursor/hover/selection state;
- last heartbeat.

Use Realtime Presence for online room membership. Use the database for durable state.

---

## 6. Suggested database tables

The table names below are intentionally explicit. Codex should refine them into migrations.

### 6.1 Accounts and profiles

`auth.users` is handled by Supabase Auth.

```text
profiles
- id uuid primary key references auth.users(id)
- username text unique not null
- display_name text not null
- bio text
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
- avatar_id uuid null
- home_id uuid null
- is_banned boolean not null default false
```

### 6.2 Avatars

```text
avatars
- id uuid primary key
- player_id uuid not null references profiles(id)
- base_type text not null
- current_outfit_item_id uuid null references inventory_items(id)
- skin_tone text
- hair_style text
- hair_color text
- eye_style text
- created_at timestamptz
- updated_at timestamptz
```

For the first MVP, use precomposed full-body outfit sprites. Later, you can support layered clothing.

```text
equipped_items
- id uuid primary key
- avatar_id uuid not null references avatars(id)
- slot text not null
- inventory_item_id uuid not null references inventory_items(id)
- equipped_at timestamptz
unique(avatar_id, slot)
```

Suggested slots:

- full_outfit
- hair
- top
- bottom
- shoes
- accessory_head
- accessory_face
- accessory_back
- pet_companion

For MVP, only `full_outfit` is required.

### 6.3 Assets

```text
asset_catalog
- id text primary key
- asset_type text not null
- storage_path text not null
- width integer
- height integer
- frame_width integer
- frame_height integer
- metadata jsonb not null default '{}'
- created_at timestamptz
```

Examples of `asset_type`:

- opening_screen
- avatar_full_body_sprite
- avatar_outfit_sprite
- clothing_layer
- pet_sprite
- furniture_sprite
- vehicle_sprite
- room_background
- item_icon

### 6.4 Items and inventory

```text
item_catalog
- id text primary key
- name text not null
- description text
- category text not null
- slot text null
- asset_id text references asset_catalog(id)
- rarity text not null default 'common'
- default_price integer not null default 0
- is_tradeable boolean not null default false
- is_active boolean not null default true
- metadata jsonb not null default '{}'
- created_at timestamptz
```

```text
inventory_items
- id uuid primary key
- player_id uuid not null references profiles(id)
- item_catalog_id text not null references item_catalog(id)
- quantity integer not null default 1
- acquired_source text not null
- acquired_at timestamptz not null default now()
- metadata jsonb not null default '{}'
```

Indexes:

```text
index inventory_items_player_id_idx on inventory_items(player_id)
index inventory_items_player_catalog_idx on inventory_items(player_id, item_catalog_id)
```

For non-stackable items like pets, cars, and unique furniture, use `quantity = 1` and store instance metadata where needed.

### 6.5 Wallet and currency ledger

```text
wallets
- player_id uuid primary key references profiles(id)
- balance integer not null default 0
- updated_at timestamptz not null default now()
check(balance >= 0)
```

```text
currency_ledger
- id uuid primary key
- player_id uuid not null references profiles(id)
- amount_delta integer not null
- balance_after integer not null
- reason text not null
- related_entity_type text
- related_entity_id text
- idempotency_key text unique
- created_at timestamptz not null default now()
```

Reasons:

- signup_bonus
- job_reward
- item_purchase
- pet_adoption
- furniture_purchase
- admin_grant
- refund

### 6.6 Shops and purchases

```text
shops
- id text primary key
- name text not null
- location_id text
- is_active boolean not null default true
```

```text
shop_items
- id uuid primary key
- shop_id text references shops(id)
- item_catalog_id text references item_catalog(id)
- price integer not null
- currency_type text not null default 'coins'
- starts_at timestamptz null
- ends_at timestamptz null
- is_active boolean not null default true
unique(shop_id, item_catalog_id)
```

```text
purchase_transactions
- id uuid primary key
- player_id uuid references profiles(id)
- shop_item_id uuid references shop_items(id)
- item_catalog_id text references item_catalog(id)
- price_paid integer not null
- inventory_item_id uuid references inventory_items(id)
- currency_ledger_id uuid references currency_ledger(id)
- idempotency_key text unique
- created_at timestamptz not null default now()
```

### 6.7 Jobs

```text
jobs
- id text primary key
- name text not null
- description text
- location_id text
- base_reward integer not null
- cooldown_seconds integer not null default 3600
- duration_seconds integer not null default 0
- min_level integer not null default 1
- is_active boolean not null default true
```

```text
job_runs
- id uuid primary key
- player_id uuid references profiles(id)
- job_id text references jobs(id)
- status text not null
- started_at timestamptz not null default now()
- completed_at timestamptz null
- reward_amount integer null
- currency_ledger_id uuid null references currency_ledger(id)
- idempotency_key text unique
```

Statuses:

- started
- completed
- cancelled
- failed

For simple MVP jobs, use instant jobs with cooldown. Later, add timed jobs.

### 6.8 Locations and realtime rooms

```text
locations
- id text primary key
- name text not null
- description text
- background_asset_id text references asset_catalog(id)
- location_type text not null
- max_players integer null
- is_public boolean not null default true
- sort_order integer not null default 0
```

Examples:

- town_square
- boutique
- pet_shop
- cafe
- apartments_lobby
- job_office
- player_home

Location presence should use Supabase Realtime Presence. For each location, use a channel such as:

```text
location:town_square
location:boutique
home:{home_id}
```

The database does not need to write every presence heartbeat.

### 6.9 Pets

```text
pet_catalog
- id text primary key
- name text not null
- species text not null
- asset_id text references asset_catalog(id)
- price integer not null
- is_active boolean not null default true
- metadata jsonb not null default '{}'
```

```text
player_pets
- id uuid primary key
- player_id uuid references profiles(id)
- pet_catalog_id text references pet_catalog(id)
- nickname text
- adopted_at timestamptz not null default now()
- is_equipped boolean not null default false
- metadata jsonb not null default '{}'
```

### 6.10 Vehicles

```text
vehicle_catalog
- id text primary key
- name text not null
- asset_id text references asset_catalog(id)
- price integer not null
- is_active boolean not null default true
- metadata jsonb not null default '{}'
```

```text
player_vehicles
- id uuid primary key
- player_id uuid references profiles(id)
- vehicle_catalog_id text references vehicle_catalog(id)
- nickname text
- acquired_at timestamptz not null default now()
- is_equipped boolean not null default false
- metadata jsonb not null default '{}'
```

### 6.11 Homes and furniture

```text
homes
- id uuid primary key
- player_id uuid references profiles(id)
- name text not null default 'My Apartment'
- visibility text not null default 'friends'
- created_at timestamptz
- updated_at timestamptz
```

```text
home_rooms
- id uuid primary key
- home_id uuid references homes(id)
- name text not null
- room_template_id text
- background_asset_id text references asset_catalog(id)
- created_at timestamptz
```

```text
furniture_catalog
- id text primary key
- name text not null
- category text not null
- asset_id text references asset_catalog(id)
- price integer not null
- width_grid integer not null default 1
- height_grid integer not null default 1
- is_active boolean not null default true
- metadata jsonb not null default '{}'
```

```text
furniture_inventory
- id uuid primary key
- player_id uuid references profiles(id)
- furniture_catalog_id text references furniture_catalog(id)
- acquired_at timestamptz not null default now()
- acquired_source text not null
- metadata jsonb not null default '{}'
```

```text
placed_furniture
- id uuid primary key
- room_id uuid references home_rooms(id)
- furniture_inventory_id uuid references furniture_inventory(id)
- x integer not null
- y integer not null
- z_index integer not null default 0
- rotation text null
- placed_at timestamptz not null default now()
unique(furniture_inventory_id)
```

The `unique(furniture_inventory_id)` rule prevents one owned chair from being placed in two rooms at the same time.

### 6.12 Friends and chat

```text
friendships
- id uuid primary key
- requester_id uuid references profiles(id)
- addressee_id uuid references profiles(id)
- status text not null
- created_at timestamptz
- updated_at timestamptz
unique(requester_id, addressee_id)
```

Statuses:

- pending
- accepted
- blocked
- rejected

```text
chat_messages
- id uuid primary key
- sender_id uuid references profiles(id)
- channel_type text not null
- channel_id text not null
- body text not null
- created_at timestamptz not null default now()
- deleted_at timestamptz null
```

Chat must have moderation and rate limits before public release.

### 6.13 Audit and moderation

```text
audit_logs
- id uuid primary key
- actor_player_id uuid null references profiles(id)
- action text not null
- target_type text
- target_id text
- metadata jsonb not null default '{}'
- created_at timestamptz not null default now()
```

```text
moderation_reports
- id uuid primary key
- reporter_id uuid references profiles(id)
- reported_player_id uuid references profiles(id)
- reason text not null
- details text
- status text not null default 'open'
- created_at timestamptz not null default now()
```

---

## 7. Game actions and transaction boundaries

### 7.1 `buyItem`

Input:

```ts
{
  shopItemId: string;
  idempotencyKey: string;
}
```

Server steps:

1. Require logged-in player.
2. Validate payload.
3. Begin DB transaction.
4. Load active `shop_items` row and linked `item_catalog` row.
5. Lock player wallet row.
6. Reject if balance is too low.
7. Insert `inventory_items` row.
8. Insert `purchase_transactions` row.
9. Insert `currency_ledger` negative row.
10. Update wallet balance.
11. Commit.
12. Emit realtime event: `inventory_updated`, `wallet_updated`.

Tests:

- Can buy item with enough money.
- Cannot buy inactive item.
- Cannot buy with insufficient money.
- Two simultaneous purchases cannot overspend.
- Reusing same idempotency key does not duplicate item/money changes.
- Player cannot buy on behalf of another player.

### 7.2 `completeJob`

Input:

```ts
{
  jobId: string;
  idempotencyKey: string;
}
```

Server steps:

1. Require logged-in player.
2. Validate job exists and is active.
3. Check cooldown from latest completed job run.
4. Begin DB transaction.
5. Lock wallet row.
6. Insert `job_runs` completed row.
7. Insert positive `currency_ledger` row.
8. Update wallet balance.
9. Commit.
10. Emit realtime event: `wallet_updated`, `job_completed`.

Tests:

- Completing a job gives correct reward.
- Cooldown prevents repeated farming.
- Client cannot choose reward amount.
- Double submit does not double reward.

### 7.3 `equipItem`

Input:

```ts
{
  inventoryItemId: string;
  slot: string;
}
```

Server steps:

1. Require logged-in player.
2. Validate inventory item belongs to player.
3. Validate item category fits slot.
4. Upsert `equipped_items` for avatar/slot.
5. Update avatar `updated_at`.
6. Emit `avatar_updated`.

Tests:

- Player can equip owned outfit.
- Player cannot equip another player’s item.
- Item must match slot.
- Equipping one full outfit replaces previous full outfit.

### 7.4 `enterLocation`

Input:

```ts
{
  locationId: string;
}
```

Server/realtime steps:

1. Require logged-in player.
2. Validate location exists and is accessible.
3. Join realtime presence channel for `location:{locationId}`.
4. Presence payload includes player id, username, avatar sprite, equipped outfit, and small status.
5. Client renders online players from presence state.

The database does not need to store a row every time someone enters a public room unless you want last-known location for profiles.

### 7.5 `placeFurniture`

Input:

```ts
{
  roomId: string;
  furnitureInventoryId: string;
  x: number;
  y: number;
  zIndex: number;
}
```

Server steps:

1. Require logged-in player.
2. Validate room belongs to player or player has edit permission.
3. Validate furniture belongs to player.
4. Validate placement grid bounds.
5. Upsert/insert `placed_furniture`.
6. Emit room update.

Tests:

- Can place owned furniture in own room.
- Cannot place another player’s furniture.
- Cannot place furniture outside bounds.
- Same furniture cannot be placed twice.

---

## 8. Frontend structure

Recommended folders:

```text
src/
  app/
    page.tsx
    login/
    create-avatar/
    city/[locationId]/
    profile/[username]/
    wardrobe/
    shop/[shopId]/
    home/[homeId]/
  components/
    PixelButton.tsx
    PixelPanel.tsx
    AvatarSprite.tsx
    SpriteSheetImage.tsx
    CurrencyBadge.tsx
  domain/
    types.ts
    constants.ts
    economy.ts
    validators.ts
  features/
    auth/
    avatar/
    city/
    inventory/
    jobs/
    shops/
    pets/
    homes/
    friends/
    chat/
  server/
    db/
    game-actions/
      buyItem.ts
      equipItem.ts
      completeJob.ts
      adoptPet.ts
      placeFurniture.ts
    auth/
  tests/
    unit/
    integration/
    e2e/
```

### Pixel-art rendering notes

Use CSS like:

```css
.pixel-art {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

For MVP, the simplest avatar rendering is one image per precomposed outfit sprite.

Later, if you generate clothing layers that fit perfectly, render the avatar with stacked absolute-positioned layers:

```text
base body
hair
top
bottom
shoes
accessory
pet companion
```

Do not block the MVP on layered clothing if the generated clothing sheets do not align perfectly yet.

---

## 9. Realtime multiplayer plan

Spritebury does not need twitch/action multiplayer. It needs social multiplayer.

Realtime features for MVP:

- See who is online in the same location.
- See chat messages in a room.
- See lightweight notifications such as “Luba bought a new pet” if desired.
- See avatar/outfit update after a player changes clothes.

Use channels:

```text
location:town_square
location:boutique
location:pet_shop
location:cafe
home:{home_id}
dm:{friendship_id}
player:{player_id}
```

Presence payload should be small:

```ts
{
  playerId: string;
  username: string;
  displayName: string;
  avatarAssetId: string;
  outfitAssetId: string;
  status?: string;
}
```

Do not put full inventories, wallets, or private data in presence payloads.

---

## 10. Security and anti-cheat rules

Core rules:

1. Never trust the client for money, inventory, rewards, cooldowns, item ownership, or permissions.
2. Validate every command server-side.
3. Use RLS policies so players can only read/write allowed rows.
4. Use service-role server code only for controlled server commands.
5. Every economy mutation must be logged.
6. Use idempotency keys for purchase/job endpoints.
7. Add rate limits for chat, purchases, job completion, and profile updates.
8. Keep admin actions separate from player actions.
9. Do not expose service-role keys to the browser.
10. Add moderation before enabling public chat.

---

## 11. Testing strategy

### Unit tests with Vitest

Test pure functions:

- price calculation;
- cooldown calculation;
- item-slot compatibility;
- profile validation;
- username validation;
- furniture placement bounds;
- currency ledger helper rules.

### Integration tests

Test database-backed game commands:

- `buyItem` creates inventory + purchase + ledger + wallet update.
- `completeJob` creates job run + ledger + wallet update.
- `equipItem` only accepts owned items.
- `placeFurniture` only accepts owned furniture.
- RLS denies cross-player access.

### E2E tests with Playwright

Test flows:

1. New user signs up.
2. User creates profile.
3. User creates avatar.
4. User enters Town Square.
5. User opens Boutique.
6. User buys an outfit.
7. User equips outfit.
8. User completes Cafe job.
9. User adopts pet.
10. User places furniture in home.
11. Two browser contexts enter same location and see each other online.

### Concurrency tests

Must-have economy tests:

- Two simultaneous purchases with one item’s worth of balance: only one succeeds.
- Two simultaneous job completions: only one reward is granted if cooldown applies.
- Repeated same idempotency key: no duplicate money or item.

---

## 12. Implementation roadmap

### Phase 0 — Project foundation

- Create Next.js app with TypeScript.
- Add linting/formatting.
- Add Vitest.
- Add Playwright.
- Add Supabase client setup.
- Add environment variable schema.
- Add `/docs` planning files.
- Add `public/assets` with generated opening screen and sprite sheets.

### Phase 1 — Database and seed data

- Create base migrations.
- Create RLS policies.
- Seed locations: Town Square, Boutique, Pet Shop, Cafe, Apartments.
- Seed starter jobs.
- Seed starter items/outfits.
- Seed starter pet catalog.
- Seed default furniture.

### Phase 2 — Auth, profiles, avatars

- Login/signup.
- Create profile.
- Create avatar.
- Default wallet.
- Default home.
- Default outfit.

### Phase 3 — Static city UI

- Opening screen.
- Main city navigation.
- Location screens.
- Pixel UI components.
- Avatar rendering.

### Phase 4 — Inventory, wardrobe, shops

- Inventory page.
- Boutique shop.
- Buy item command.
- Wardrobe equip command.
- Profile avatar updates.

### Phase 5 — Jobs and fake economy

- Job Office or Cafe job.
- Complete job command.
- Cooldowns.
- Currency ledger view for debugging/admin.

### Phase 6 — Realtime rooms and chat

- Location presence.
- Room chat.
- Online player list.
- Friend request system.

### Phase 7 — Pets, homes, furniture

- Pet adoption.
- Equip visible pet companion.
- Default apartment.
- Furniture inventory.
- Place furniture in room.

### Phase 8 — Admin/content tooling

- Admin-only catalog editor.
- Item activation/deactivation.
- Price changes.
- Moderation reports.
- Ban/mute tools.

### Phase 9 — Deployment hardening

- Production environment variables.
- Database backups.
- RLS audit.
- Rate limiting.
- Error logging.
- Analytics.
- Load testing for realtime rooms.

---

## 13. MVP scope boundaries

Include in MVP:

- static screens;
- static avatars;
- precomposed outfit sprites;
- fake money;
- jobs with cooldowns;
- shopping;
- inventory;
- profile;
- basic homes;
- basic furniture placement;
- presence in locations;
- basic chat.

Do not include in MVP:

- real-money purchases;
- trading between players;
- animated walking;
- open-world map movement;
- complex pathfinding;
- auction house;
- user-generated image uploads;
- mobile app;
- complex layered clothing if sprites do not fit perfectly yet.

---

## 14. Important design decision: precomposed outfits first

Because clothing-overlay alignment is difficult with generated pixel art, use full precomposed character outfit sprites for MVP.

That means each outfit item points to a full avatar image/sprite that already includes the clothes.

Example:

```text
item_catalog.id = outfit_red_hoodie_boy
item_catalog.category = outfit
item_catalog.slot = full_outfit
asset_catalog.storage_path = /assets/avatars/boy_red_hoodie.png
```

This gives you clean visuals immediately. Later, once you have a more controlled art pipeline, you can support separate clothing layers.

---

## 15. References checked for stack planning

These references were checked while preparing this stack recommendation:

- Next.js App Router installation docs: https://nextjs.org/docs/app/getting-started/installation
- Supabase Realtime docs: https://supabase.com/docs/guides/realtime
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Supabase Storage docs: https://supabase.com/docs/guides/storage
- Drizzle ORM overview: https://orm.drizzle.team/docs/overview
- Drizzle migrations docs: https://orm.drizzle.team/docs/migrations
- Prisma supported databases docs: https://www.prisma.io/docs/orm/reference/supported-databases
- Socket.IO rooms docs, useful if replacing Supabase Realtime with a custom WebSocket server later: https://socket.io/docs/v4/rooms/
- Vitest getting started: https://vitest.dev/guide/
- Playwright installation/getting started: https://playwright.dev/docs/intro
```
