# Module 3: The Construction Phase (The PrAPPt Script)

Instructor: ReflecPedago
Duration: 25 Minutes (Lecture + Scripting Exercise)
Prerequisites: [[m2-discovery-phase|Defining the [PRODUCT]]]

---

## Part 1: The Architecture of Reverse Engineering

We have our raw ideas. Now we structure them.

The [[prappt-script|PrAPPt Framework]] is unique because it is designed to be written Backwards (from [[component-product|Product]] to [[component-trigger|Trigger]]), but read by the AI Forwards (from Trigger to Product).

**The Flow:**

[[component-product|[PRODUCT]]] ← [[component-regulation|[REGULATION]]] ← [[component-approach|[APPROACH]]] ← [PURPOSE] ← [[component-persona|[PERSONA]]] ← [[component-trigger|[TRIGGER]]]

**Why [[reverse-engineering|Backwards]]?**

If you don't define the destination first, you might hire a Farmer to do a Chef's job. By defining the [[component-product|[PRODUCT]]] first, we ensure every other component supports that specific outcome.

---

## Part 2: Building the Components

### Step 1: The [[component-product|[PRODUCT]]] (The Output)

This is the single most important section. You are adjusting the "settings" of the output.

- **What goes here?** Specifics. Lists. Formats.
- **CookieAI Example:** It didn't just say "a recipe." It specified: Cookie Name, Difficulty Level (1-5), Quantity, Equipment, Ingredients, Instructions, and Nutrition Facts.
- **The "Extra [[component-regulation|[REGULATION]]]" Hack:** You can add a line here asking the user if they want to change anything _after_ the product is delivered.

### Step 2: The [[component-regulation|[REGULATION]]] (The Rules of Engagement)

This is your safety net. It ensures you and the [[aibou-partner|Aibou]] "don't hate each other".

- **User Navigation:** Define commands like `[back]`, `[restart]`, or `[help]` so the user is never lost.
- **Constraints:** "Do not attempt to 'create' recipes without justification" or "Always confirm with the user".
- **Citation:** Instruct the AI to cite which platform helped perform the [[prappt-script|PrAPPt]].

### Step 3: The [[component-approach|[APPROACH]]] (The Workflow)

How does the [[aibou-partner|Aibou]] get from "Hello" to [[component-product|[PRODUCT]]]?

- **Best Practice:** Use a Step-by-Step workflow. AI loves logical flows.
- **CookieAI Workflow:**
  - Step 1: Greet & Summary.
  - Step 2: Inquire (Indulge vs. Diet).
  - Step 3: Provide 5 Recommendations.
  - Step 4: Confirm & Finalize.

### Step 4: The [PURPOSE] & [[component-persona|[PERSONA]]] (The Soul)

Now that we know _what_ it does and _how_ it does it, we decide _who_ it is.

- **[PURPOSE]:** A single sentence describing the "Why." (e.g., "To spread the joy of sharing cookies").
- **[[component-persona|[PERSONA]]]:**
  - **The Syntax:** "The user understands that you are...".
  - **The Scope:** Narrow the LLM's vast domain. You are not a general assistant; you are "CookieAI," an expert in indulgent yet dietary-restricted baking.

### Step 5: The [[component-trigger|[TRIGGER]]] (The Button)

The simple code that activates the [[prappt-script|script]].

- **Format:** `prappt-CookieAI` or `aibou-cookieai`.

---

## Part 3: The PrAPPt Formula (The Assembly)

Once the components are written, we assemble them into the "System Message" format that the AI can parse.

**The Header:**

```
SYSTEM: [TRIGGER] → Aibou : ([PERSONA], [PURPOSE], {[APPROACH] : [REGULATION]}) = [PRODUCT]
```

This header acts as a "formality and a gesture of manners" to inform the AI exactly how to parse the [[prappt-script|script]].

---

## Module 3 Exercise: Reverse Engineering

**Task:**

We will build a simple "BookFinder [[aibou-partner|Aibou]]." Fill in the blanks below using the logic we just learned.

1. **[[component-product|[PRODUCT]]]**: A list of 3 book recommendations. Each recommendation must include: Title, Author, and _________ (Add one more specific deliverable).

2. **[[component-regulation|[REGULATION]]]**: "Do not recommend books that are part of a series unless _________. " (Add a constraint).

3. **[[component-approach|[APPROACH]]]**:
   - Step 1: Ask the user for their favorite genre.
   - Step 2: _________ (What should the AI ask next to narrow it down?)
   - Step 3: Present the [[component-product|[PRODUCT]]].

4. **[[component-persona|[PERSONA]]]**: "The user understands that you are a _________ librarian who loves obscure literature." (Add an adjective/trait).
