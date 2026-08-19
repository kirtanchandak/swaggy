# Conversational Swiggy Ordering — MVP Plan

## 1. Product

Build a web app where users can connect their Swiggy account and **order food entirely through a conversational AI interface**.

Example:

> User: "I want something spicy under ₹400."

The agent:

1. Searches Swiggy
2. Finds relevant options
3. Shows the user the best choices
4. Adds the selected item to cart
5. Checks eligible discounts/coupons
6. Shows the final price
7. Gets explicit confirmation
8. Places the order
9. Tracks the order

**V1 is Swiggy-only.**

Do not build WhatsApp, Telegram, or other providers yet.

---

## 2. Goal

The goal of V1 is to prove one complete flow:

**Discover → Compare → Cart → Discount → Confirm → Order → Track**

The app should feel like:

> **"ChatGPT for ordering on Swiggy."**

The chat is the primary interface. Do not build a traditional Swiggy clone.

---

## 3. Tech Stack

Recommended:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Server-side API routes / server actions
* LLM with tool calling
* Swiggy MCP
* PostgreSQL only if persistence is required
* Secure server-side OAuth/session storage

Keep the backend thin.

The application should use **Swiggy MCP rather than recreating Swiggy's APIs**.

---

## 4. Architecture

```text
                    ┌──────────────────┐
                    │   Next.js Web UI │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Agent Runtime  │
                    │                  │
                    │  LLM + Tool Loop │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Swiggy MCP    │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             ▼               ▼                ▼
          Search            Cart           Checkout
                                             │
                                           Order
```

Keep the agent layer simple and Swiggy-specific for V1.

Do not prematurely create a generic multi-provider commerce abstraction.

---

## 5. Core Agent Capabilities

### Discovery

The user should be able to say:

* "Find me a good biryani under ₹400."
* "I want something vegetarian and spicy."
* "What can I get nearby?"
* "Find me something for dinner."

### Comparison

Examples:

* "Which one has the best rating?"
* "What's the cheapest?"
* "Which one will arrive fastest?"
* "Compare the first two."

### Cart

Examples:

* "Add that."
* "Add two."
* "Remove the Coke."
* "What's in my cart?"
* "What's the total?"

### Discounts

Examples:

* "Find the best coupon."
* "Apply the best discount."
* "What's the final price?"
* "Can I get this under ₹300?"

The agent should use Swiggy's available discount/coupon capabilities rather than inventing discounts.

### Checkout

Examples:

* "Order it."
* "Place the order."

The agent **must ask for explicit confirmation immediately before placing an order**.

Never place an order simply because the user expressed interest in an item.

### Order Tracking

Examples:

* "Where is my order?"
* "What's the ETA?"
* "Show me my latest order."

---

## 6. User Experience

### Landing Page

Keep it extremely simple.

```text
┌─────────────────────────────────────┐
│                                     │
│        Swiggy, but you just talk.  │
│                                     │
│          [ Connect Swiggy ]         │
│                                     │
└─────────────────────────────────────┘
```

After connecting:

```text
┌─────────────────────────────────────┐
│                                     │
│       What are you craving?         │
│                                     │
│  "Something spicy under ₹400"       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🍛 Chicken Biryani                 │
│  ₹349                               │
│  4.4 ⭐ · 30 min                    │
│                                     │
│  ₹349 → ₹249 with eligible offer   │
│                                     │
│  [ Add to cart ]                    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│       Type a message...             │
└─────────────────────────────────────┘
```

The UI should prioritize:

* Conversation
* Food/product cards
* Cart state
* Final price
* Confirmation

Avoid unnecessary dashboards and settings.

---

## 7. Authentication

Use Swiggy's provided OAuth/redirect mechanism.

Requirements:

* Never ask users for Swiggy passwords.
* Never expose access tokens to the browser.
* Store credentials/tokens securely on the server.
* Support multiple users.
* Never hardcode a personal Swiggy account.
* Each user should authorize their own Swiggy account.

Use the Swiggy developer documentation to determine the exact OAuth and MCP authentication flow.

Do not assume that the Builders page URL itself is the application's callback URL without verifying Swiggy's documentation.

---

## 8. Important Safety / Confirmation Rules

The agent can freely:

* Search
* Compare
* Recommend
* Build carts
* Check discounts

But ordering is a consequential action.

Therefore:

```text
User: "Get me the biryani."

Agent:
"Added Chicken Biryani to your cart.

Subtotal: ₹349
Discount: ₹100
Delivery: ₹30
Total: ₹279

Place the order?"

[ Confirm Order ] [ Cancel ]
```

Only after explicit confirmation should the agent invoke the order-placement tool.

---

## 9. V1 Scope

### Must Have

* [ ] Landing page
* [ ] Swiggy account connection
* [ ] Secure user session
* [ ] Chat interface
* [ ] LLM tool calling
* [ ] Swiggy MCP integration
* [ ] Restaurant/food search
* [ ] Menu exploration
* [ ] Product/restaurant result cards
* [ ] Add/remove cart items
* [ ] Cart summary
* [ ] Discount/coupon handling where supported
* [ ] Final price calculation/display
* [ ] Explicit order confirmation
* [ ] Order placement
* [ ] Order status/tracking

### Do Not Build Yet

* [ ] WhatsApp
* [ ] Telegram
* [ ] Discord
* [ ] Voice
* [ ] Zomato
* [ ] Other food providers
* [ ] Grocery providers
* [ ] Autonomous ordering
* [ ] Mobile app
* [ ] Complex recommendation engine
* [ ] Long-term food preferences/memory
* [ ] Generic multi-provider abstraction

---

## 10. Suggested Project Structure

```text
app/
├── page.tsx
├── chat/
│   └── page.tsx
├── api/
│   ├── chat/
│   ├── auth/
│   └── swiggy/
│
components/
├── chat/
├── food-card/
├── cart/
├── order-confirmation/
└── ui/
│
lib/
├── agent/
├── swiggy/
├── auth/
└── db/
│
types/
└── index.ts
```

Keep Swiggy-specific logic isolated under `lib/swiggy/`.

---

## 11. Development Order

### Phase 1 — Understand Swiggy MCP

Before writing the application:

1. Read Swiggy MCP documentation.
2. Identify all available MCP servers/tools.
3. Understand authentication.
4. Understand OAuth/delegated authorization.
5. Identify tools for:

   * Search
   * Restaurant/menu
   * Cart
   * Discounts
   * Checkout
   * Order status
6. Build a minimal local MCP test client.

Do not guess tool names or capabilities.

---

### Phase 2 — Basic Agent

Build a simple agent that can:

```text
User
 ↓
LLM
 ↓
Swiggy MCP
 ↓
Tool result
 ↓
LLM
 ↓
User
```

Test basic natural-language queries.

---

### Phase 3 — Web UI

Build:

* Landing page
* Swiggy connection
* Chat interface
* Streaming responses
* Food/product cards
* Cart state

Make the interface polished but minimal.

---

### Phase 4 — Complete Ordering Flow

Implement:

```text
Search
  ↓
Choose
  ↓
Add to cart
  ↓
Apply/check discount
  ↓
Show final amount
  ↓
Ask confirmation
  ↓
Place order
  ↓
Track order
```

This is the most important milestone.

---

### Phase 5 — Testing

Test conversational edge cases:

* User changes their mind.
* User removes an item.
* Item becomes unavailable.
* Coupon isn't eligible.
* Price changes.
* Restaurant closes.
* Multiple restaurants match.
* User asks for something outside their budget.
* User says "order it" before a specific item is selected.
* User cancels before confirmation.
* User cancels after ordering, if cancellation is supported.

The agent should never silently make an expensive or irreversible decision.

---

## 12. V2 — Messaging Interfaces

Once the web MVP works, expose the **same agent backend** through messaging platforms.

```text
                    ┌──────────────┐
                    │ Core Agent   │
                    └──────┬───────┘
                           │
                    ┌──────▼──────┐
                    │ Swiggy MCP  │
                    └──────▲──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
             Web        WhatsApp     Telegram
```

The important architecture decision:

> **Interfaces should be thin adapters around the same core agent.**

Don't duplicate the ordering logic for each platform.

---

## 13. V3 — Other Providers

Only after the Swiggy version has proven useful should we consider:

* Zomato
* Other food providers
* Grocery providers
* Restaurant-native ordering

At that point we can introduce a provider abstraction.

For V1, **do not build this abstraction**.

---

## 14. Final Product Vision

The long-term product is not:

> "Another Swiggy chatbot."

It is:

> **A conversational interface for commerce, starting with Swiggy.**

The user shouldn't have to learn where the provider's buttons are.

They should simply say:

> "I'm hungry."

And the agent handles the rest.

But V1 should remain ruthlessly focused:

> **One provider. One web app. One complete ordering flow.**

Use this as the offical docs to check and build everything - 

Docs - https://mcp.swiggy.com/builders/docs/
