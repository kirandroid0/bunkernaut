import fs from 'fs'
import path from 'path'

/** Bunkernaut palette */
const C = {
  cream: '#EFF1ED',
  dark: '#373D20',
  olive: '#717744',
  sage: '#BCBD8B',
  brown: '#766153',
  black: '#1a1a14',
}

const dir = path.join('public', 'assets', 'pixel')

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`
}

function frog(mood) {
  const body = C.olive
  const belly = C.sage
  const eye = C.black
  const mouth =
    mood === 'sparkly'
      ? `<rect x="52" y="68" width="24" height="6" fill="${C.dark}"/><rect x="16" y="20" width="10" height="10" fill="${C.sage}"/><rect x="102" y="16" width="10" height="10" fill="${C.sage}"/><rect x="18" y="22" width="6" height="6" fill="${C.cream}"/><rect x="104" y="18" width="6" height="6" fill="${C.cream}"/>`
      : mood === 'happy'
        ? `<rect x="48" y="70" width="32" height="6" fill="${C.dark}"/>`
        : mood === 'nervous'
          ? `<rect x="54" y="74" width="20" height="4" fill="${C.brown}"/><rect x="28" y="48" width="6" height="2" fill="${C.brown}"/><rect x="94" y="48" width="6" height="2" fill="${C.brown}"/>`
          : `<rect x="46" y="58" width="14" height="3" fill="${eye}"/><rect x="68" y="58" width="14" height="3" fill="${eye}"/><rect x="58" y="76" width="12" height="4" fill="${eye}"/><rect x="92" y="18" width="8" height="4" fill="${C.sage}"/><rect x="98" y="12" width="6" height="4" fill="${C.sage}"/>`

  const frogColor = mood === 'sleepy' ? C.brown : body

  return svg(
    128,
    128,
    `<rect width="128" height="128" fill="none"/>
    <rect x="40" y="24" width="48" height="14" fill="${frogColor}"/>
    <rect x="32" y="38" width="64" height="52" fill="${frogColor}"/>
    <rect x="36" y="54" width="20" height="16" fill="${belly}"/>
    <rect x="72" y="54" width="20" height="16" fill="${belly}"/>
    <rect x="44" y="46" width="10" height="10" fill="${eye}"/>
    <rect x="74" y="46" width="10" height="10" fill="${eye}"/>
    <rect x="46" y="48" width="4" height="4" fill="${C.cream}"/>
    <rect x="76" y="48" width="4" height="4" fill="${C.cream}"/>
    ${mouth}`,
  )
}

const files = {
  'mascot-sparkly.svg': frog('sparkly'),
  'mascot-happy.svg': frog('happy'),
  'mascot-nervous.svg': frog('nervous'),
  'mascot-sleepy.svg': frog('sleepy'),

  'nav-home.svg': svg(
    32,
    32,
    `<rect x="4" y="15" width="24" height="13" fill="${C.olive}"/>
     <polygon points="16,4 28,15 4,15" fill="${C.dark}"/>
     <rect x="13" y="20" width="6" height="8" fill="${C.cream}"/>`,
  ),
  'nav-today.svg': svg(
    32,
    32,
    `<rect x="5" y="7" width="22" height="20" fill="${C.cream}" stroke="${C.dark}" stroke-width="2"/>
     <rect x="5" y="7" width="22" height="7" fill="${C.olive}"/>
     <rect x="10" y="18" width="4" height="4" fill="${C.sage}"/>
     <rect x="18" y="18" width="4" height="4" fill="${C.sage}"/>`,
  ),
  'nav-courses.svg': svg(
    32,
    32,
    `<rect x="7" y="5" width="18" height="22" fill="${C.olive}"/>
     <rect x="10" y="9" width="12" height="2" fill="${C.cream}"/>
     <rect x="10" y="13" width="12" height="2" fill="${C.cream}"/>
     <rect x="10" y="17" width="8" height="2" fill="${C.sage}"/>`,
  ),
  'nav-stats.svg': svg(
    32,
    32,
    `<rect x="5" y="21" width="5" height="7" fill="${C.sage}"/>
     <rect x="13" y="15" width="5" height="13" fill="${C.olive}"/>
     <rect x="21" y="9" width="5" height="19" fill="${C.dark}"/>`,
  ),
  'nav-settings.svg': svg(
    32,
    32,
    `<rect x="11" y="11" width="10" height="10" fill="${C.brown}"/>
     <rect x="14" y="3" width="4" height="5" fill="${C.dark}"/>
     <rect x="14" y="24" width="4" height="5" fill="${C.dark}"/>
     <rect x="3" y="14" width="5" height="4" fill="${C.dark}"/>
     <rect x="24" y="14" width="5" height="4" fill="${C.dark}"/>`,
  ),

  'status-present.svg': svg(
    24,
    24,
    `<rect x="3" y="3" width="18" height="18" fill="${C.olive}"/>
     <rect x="7" y="11" width="4" height="4" fill="${C.cream}"/>
     <rect x="11" y="7" width="4" height="8" fill="${C.cream}"/>`,
  ),
  'status-absent.svg': svg(
    24,
    24,
    `<rect x="3" y="3" width="18" height="18" fill="${C.brown}"/>
     <rect x="6" y="6" width="12" height="3" fill="${C.cream}"/>
     <rect x="6" y="15" width="12" height="3" fill="${C.cream}"/>`,
  ),
  'status-cancelled.svg': svg(
    24,
    24,
    `<rect x="3" y="3" width="18" height="18" fill="${C.sage}"/>
     <rect x="5" y="10" width="14" height="4" fill="${C.dark}"/>`,
  ),
  'status-holiday.svg': svg(
    24,
    24,
    `<rect x="3" y="3" width="18" height="18" fill="${C.cream}"/>
     <rect x="6" y="8" width="12" height="8" fill="${C.olive}"/>
     <rect x="10" y="4" width="4" height="4" fill="${C.dark}"/>`,
  ),

  'empty-courses.svg': svg(
    96,
    96,
    `<rect x="20" y="12" width="56" height="72" fill="${C.olive}"/>
     <rect x="26" y="20" width="44" height="6" fill="${C.cream}"/>
     <rect x="26" y="32" width="44" height="4" fill="${C.sage}"/>
     <rect x="26" y="40" width="32" height="4" fill="${C.sage}"/>
     <rect x="26" y="48" width="40" height="4" fill="${C.sage}"/>
     <rect x="48" y="62" width="20" height="16" fill="${C.dark}"/>`,
  ),
  'empty-today.svg': svg(
    96,
    96,
    `<rect x="18" y="22" width="60" height="52" fill="${C.cream}" stroke="${C.dark}" stroke-width="4"/>
     <rect x="18" y="22" width="60" height="14" fill="${C.olive}"/>
     <rect x="28" y="44" width="10" height="10" fill="${C.sage}"/>
     <rect x="43" y="44" width="10" height="10" fill="${C.sage}"/>
     <rect x="58" y="44" width="10" height="10" fill="${C.sage}"/>`,
  ),
  'empty-stats.svg': svg(
    96,
    96,
    `<rect x="16" y="58" width="14" height="24" fill="${C.sage}"/>
     <rect x="40" y="38" width="14" height="44" fill="${C.olive}"/>
     <rect x="64" y="22" width="14" height="60" fill="${C.dark}"/>
     <rect x="12" y="84" width="72" height="4" fill="${C.brown}"/>`,
  ),

  'app-icon.svg': svg(
    512,
    512,
    `<rect width="512" height="512" fill="${C.cream}"/>
     <rect x="156" y="108" width="200" height="64" fill="${C.olive}"/>
     <rect x="128" y="172" width="256" height="220" fill="${C.olive}"/>
     <rect x="188" y="208" width="48" height="48" fill="${C.dark}"/>
     <rect x="276" y="208" width="48" height="48" fill="${C.dark}"/>
     <rect x="196" y="300" width="120" height="24" fill="${C.sage}"/>`,
  ),

  'icon-sun.svg': svg(
    24,
    24,
    `<rect x="9" y="9" width="6" height="6" fill="${C.olive}"/>
     <rect x="10" y="2" width="4" height="3" fill="${C.dark}"/>
     <rect x="10" y="19" width="4" height="3" fill="${C.dark}"/>
     <rect x="2" y="10" width="3" height="4" fill="${C.dark}"/>
     <rect x="19" y="10" width="3" height="4" fill="${C.dark}"/>`,
  ),
  'icon-moon.svg': svg(
    24,
    24,
    `<rect x="8" y="5" width="10" height="14" fill="${C.olive}"/>
     <rect x="5" y="5" width="6" height="14" fill="${C.cream}"/>`,
  ),

  'fx-sparkle-1.svg': svg(
    16,
    16,
    `<rect x="7" y="2" width="2" height="12" fill="${C.sage}"/>
     <rect x="2" y="7" width="12" height="2" fill="${C.olive}"/>`,
  ),
  'fx-sparkle-2.svg': svg(
    16,
    16,
    `<rect x="6" y="6" width="4" height="4" fill="${C.olive}"/>
     <rect x="7" y="3" width="2" height="10" fill="${C.sage}"/>`,
  ),
  'fx-sparkle-3.svg': svg(
    16,
    16,
    `<rect x="4" y="7" width="8" height="2" fill="${C.olive}"/>
     <rect x="7" y="4" width="2" height="8" fill="${C.sage}"/>
     <rect x="6" y="6" width="4" height="4" fill="${C.cream}"/>`,
  ),
}

for (const [name, content] of Object.entries(files)) {
  const out = path.join(dir, name)
  const base = name.replace(/\.svg$/i, '')
  const hasUserAsset = ['.png', '.gif'].some((ext) =>
    fs.existsSync(path.join(dir, base + ext)),
  )
  // Never regenerate mascot SVGs — user provides GIF/PNG art
  if (name.startsWith('mascot-')) {
    console.log(`skip ${name} — mascot art is user-provided`)
    continue
  }
  if (hasUserAsset) {
    console.log(`skip ${name} — keeping your ${base}.png/.gif`)
    continue
  }
  fs.writeFileSync(out, content)
}

console.log(`Created ${Object.keys(files).length} SVG placeholders in Bunkernaut palette`)
