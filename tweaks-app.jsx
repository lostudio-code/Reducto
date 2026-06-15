/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect, TweakToggle */
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#9d17a0",
  "headingFont": "Schibsted Grotesk",
  "heroTheme": "plum",
  "heroLayout": "split",
  "motion": true
}/*EDITMODE-END*/;

// Accent swatch -> derived bright + glow shades
const ACCENTS = {
  "#9d17a0": { bright: "#c721c9", glow: "#e24fe4" }, // Magenta (brand)
  "#7a1fd6": { bright: "#9b46f0", glow: "#b878ff" }, // Electric violet
  "#c2691f": { bright: "#df8534", glow: "#f0a860" }, // Ember (brand alt)
  "#1b90a2": { bright: "#27adc0", glow: "#52cdde" }, // Teal
};

function applyTweaks(t) {
  const root = document.documentElement;
  // Accent
  const a = ACCENTS[t.accent] || ACCENTS["#9d17a0"];
  root.style.setProperty("--magenta", t.accent);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--magenta-bright", a.bright);
  root.style.setProperty("--magenta-glow", a.glow);
  // Heading / sans font
  root.style.setProperty("--font-sans", `'${t.headingFont}', ui-sans-serif, system-ui, sans-serif`);
  // Hero theme
  document.body.classList.remove("hero-theme-midnight", "hero-theme-aubergine");
  if (t.heroTheme === "midnight") document.body.classList.add("hero-theme-midnight");
  if (t.heroTheme === "aubergine") document.body.classList.add("hero-theme-aubergine");
  // Hero layout
  document.body.classList.toggle("hero-centered", t.heroLayout === "centered");
  // Motion
  root.classList.toggle("no-motion", !t.motion);
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTweaks(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={t.accent}
        options={["#9d17a0", "#7a1fd6", "#c2691f", "#1b90a2"]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSelect label="Heading font" value={t.headingFont}
        options={["Schibsted Grotesk", "Space Grotesk", "Geist"]}
        onChange={(v) => setTweak("headingFont", v)} />

      <TweakSection label="Hero — visual direction" />
      <TweakRadio label="Backdrop" value={t.heroTheme}
        options={["plum", "midnight", "aubergine"]}
        onChange={(v) => setTweak("heroTheme", v)} />
      <TweakRadio label="Layout" value={t.heroLayout}
        options={["split", "centered"]}
        onChange={(v) => setTweak("heroLayout", v)} />

      <TweakSection label="Motion" />
      <TweakToggle label="Animations" value={t.motion}
        onChange={(v) => setTweak("motion", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<TweaksApp />);
