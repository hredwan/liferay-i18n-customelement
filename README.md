# i18n Custom Element POC

Demonstrates `Liferay.Language.get()` resolving translations inside a React
custom element client extension, by having a Liferay fragment — placed in
the site's **Master Page Template** — prime `Liferay.Language._cache`
server-side before any page renders. Because the priming happens at the
master-page level, the element localizes correctly even when added to a
page as a **plain widget** (its default placement), not only when embedded
inside its own fragment.

- `client-extensions/i18n-poc-demo/` — the `<i18n-poc-demo>` custom element.
- `language/` — a [Language Client Extension](https://learn.liferay.com/w/dxp/development/configuration-as-code/using-a-language-client-extension)
  (config-as-code, lives at the workspace root per Liferay's convention —
  not inside the element's own folder). `Language.properties` here is the
  single source of truth for this element's own `i18npoc.*` keys, with
  English values. The reused standard keys (`save`, `cancel`, `welcome`)
  are NOT in here — they already exist in Liferay's own language bundle.
  `Language_ar_SA.properties` holds hand-written Arabic translations for
  the same two keys (no machine translation configured in this workspace).
- `fragments/i18n-priming-collection/` — the priming-only fragment (renders
  nothing, just fills the cache) plus `generate-keys.js`, which regenerates
  the fragment's key list from `language/Language.properties` (plus a small
  hardcoded list of the reused standard keys) at build time.

## Build + deploy

```sh
# 1. Custom element
cd client-extensions/i18n-poc-demo
npm install
npm run build
cd ../..
blade gw deploy

# 2. Language Client Extension (seeds Language Override for i18npoc.* keys)
cd language
../gradlew clean deploy
cd ..

# 3. Priming fragment (regenerates keys, zips for manual import — see below)
fragments/build-fragment-zip.sh
```

`blade gw deploy` packages and deploys every client extension in the
workspace, copying the resulting zip to the running server's
`osgi/client-extensions`. Confirm `STARTED i18npocdemo` in
`bundles/tomcat/logs/catalina.out`.

The Language Client Extension is deployed differently — it's not a
`client-extensions/` folder, so it isn't picked up by `blade gw deploy`.
Running `../gradlew clean deploy` from inside `language/` imports
`Language.properties` and `Language_ar_SA.properties` as Language Override
entries via the `/o/language/v1.0/` headless API. This is what seeds
`i18npoc.greeting` and `i18npoc.magic.button` — no manual Control Panel
step needed. (Liferay also supports `../gradlew buildLang` to
machine-translate into every enabled locale automatically, but that needs
a translator API key configured — `microsoft.translator.subscription.key`
is empty in this workspace's `gradle.properties` — so `Language_ar_SA.properties`
here is hand-written instead of generated.)

Fragments are **not** client extensions and aren't deployed via `blade gw`
either. The Fragments Toolkit CLI is deprecated (2024.Q1+/GA112+), so
`fragments/build-fragment-zip.sh` runs `generate-keys.js` (rewriting the
`GENERATED KEYS` block in the fragment's `index.html` from
`language/Language.properties`), then zips the collection into
`fragments/dist/i18n-priming-collection.zip` in the format the Fragments
app's Import option expects.

## Manual portal steps

1. **Import the fragment** — Site Builder > Page Fragments > Import, upload
   `fragments/dist/i18n-priming-collection.zip`.

2. **Add it to the site's Master Page Template** — Site Menu > Design >
   Page Templates > **Masters** tab:
   - Open an existing master (or **Add** a new one) and enter edit mode.
   - If the drop zone restricts which fragments are allowed, click
     **Configure Allowed Fragments** and enable "I18n Priming Fragment".
   - Drag **I18n Priming Fragment** into the master (anywhere — it renders
     nothing visible) and Publish/Save.
   - Make sure the page(s) you test with actually use this master (Page
     Templates assign a master; a plain Site Page can also have its master
     set under Page Settings).

3. **Add the element as a plain widget** — open a Site Page (using that
   master) in edit mode, open the Widgets sidebar, find **I18n POC Demo**
   under Client Extensions, and drag it onto the page body like any other
   widget — do **not** use a fragment to embed it.

4. **Switch locale** — use the page's language switcher to change to
   Arabic and confirm all five strings translate and the element flips to
   `dir="rtl"`.

## Adding a new key

1. Add the key (and its English value) to `language/Language.properties`
   (and, if you want a real non-machine-translated Arabic string right
   away, to `language/Language_ar_SA.properties` too).
2. Add the same key/value to `FALLBACKS` in
   `client-extensions/i18n-poc-demo/src/i18n.ts` (the one place that still
   has to be kept in sync by hand — a comment in each file points at the
   other).
3. Re-deploy the Language Client Extension: `cd language && ../gradlew clean deploy && cd ..`.
4. Run `fragments/build-fragment-zip.sh` — the new key appears in the
   priming fragment's generated block automatically, no manual edit.
5. Re-import `fragments/dist/i18n-priming-collection.zip` via Site Builder >
   Page Fragments > Import. Re-importing a fragment with the same
   `fragmentEntryKey` updates it in place everywhere it's used (including
   inside the master page), so you don't need to re-add it to the master.

## Editing translations later

Deploying the Language Client Extension only *seeds* Language Override —
after that, `i18npoc.greeting` and `i18npoc.magic.button` can be edited
directly in Control Panel > Localization > Language Override for any
locale, **with no redeploy of the custom element, the language client
extension, or the fragment needed**. The fragment's script re-reads the
override on every page render, so changes show up on next page load.

## Without the priming fragment

A page whose master page template doesn't include the priming fragment
(or a standalone/local dev render) never fills `Liferay.Language._cache`,
so `<i18n-poc-demo>` falls back to its bundled English defaults rather than
showing raw translation keys — regardless of whether the element was added
as a widget or inside a fragment.
