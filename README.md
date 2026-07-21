# GitDventurer ⚔️

Tu perfil de GitHub como **carta de aventurero RPG**: clase, nivel, atributos, rango y logros calculados a partir de tus commits, PRs, reviews, stars y más. Se genera como **SVG** servido por un Cloudflare Worker, así que se puede incrustar en cualquier `README.md` de GitHub o sitio web como una imagen.

<img src="https://gitdventurer.theempire.workers.dev/card/decode9" alt="Carta de aventurero de decode9" />

<details>
  <summary><b>🔄 Voltear la carta — ver el Registro del Gremio</b></summary>
  <br/>
  <img src="https://gitdventurer.theempire.workers.dev/card/decode9/back" alt="Registro del gremio de decode9" />
</details>

*↑ Carta en vivo, generada por este mismo Worker.*

```markdown
![Mi carta de aventurero](https://gitdventurer.theempire.workers.dev/card/<tu-usuario>)
```

## El sistema de juego

Toda la actividad se mide **desde la creación de la cuenta** (de por vida), no solo el último año. Como la API de GitHub limita `contributionsCollection` a rangos de 1 año (y rechaza más de 3 rangos por request), el servicio divide tu antigüedad en rangos anuales y los consulta en lotes de 3 en paralelo, sumando los totales.

### 1. Stats (atributos 0–100)

Cada atributo nace de una métrica y se normaliza a 0–100 con **escala logarítmica**: `100 · log10(1 + valor) / log10(1 + saturación)`. La escala log premia el arranque (pasar de 0 a 100 commits se nota mucho) y evita que las cuentas gigantes aplasten al resto. La *saturación* es el valor con el que el stat llega a 100:

| Stat | Métrica (de por vida salvo indicado) | Satura a 100 con |
|---|---|---|
| ⚔️ **STR** (Fuerza) | Commits + contribuciones privadas | 25.000 |
| 🌀 **DEX** (Destreza) | Racha actual de días consecutivos contribuyendo | 100 días |
| 📚 **INT** (Inteligencia) | Lenguajes distintos entre tus repos propios | 12 lenguajes |
| 🦉 **WIS** (Sabiduría) | Code reviews realizadas | 2.000 reviews |
| ✨ **CHA** (Carisma) | Stars recibidas + followers | 2.000 |
| 🏰 **VIT** (Vitalidad) | Años de antigüedad de la cuenta | 12 años |

> La racha (DEX) perdona el día de hoy si aún no has contribuido, pero se rompe con un día completo en cero.

### 2. XP y niveles

Cada acción da XP según su valor para la comunidad — revisar código de otros vale más que un commit propio:

| Acción | XP |
|---|---|
| Commit / contribución privada | 1 |
| Issue abierto | 3 |
| Star recibida | 4 |
| Pull request | 5 |
| Review de código | 8 |
| PR mergeado en repo ajeno (open source) | 10 |

Subir de nivel cuesta cada vez más: pasar del nivel L al L+1 cuesta `20·(2L−1)` XP, así que **alcanzar el nivel L cuesta `20·(L−1)²` XP acumulada** (crecimiento ~√XP). Ejemplos:

| XP acumulada | Nivel |
|---|---|
| 80 | 3 |
| 500 | 6 |
| 2.000 | 11 |
| 3.920 | 15 |
| 16.820 | 30 |
| 48.020 | 50 |
| 109.520 | 75 |

### 3. Rangos

El rango deriva del nivel y colorea el glow del borde de la tarjeta:

| Rango | Nivel mínimo | XP aprox. | Color |
|---|---|---|---|
| 🥉 Bronce | 1 | 0 | `#cd7f32` |
| 🥈 Plata | 15 | ~3.9k | `#c0c0c0` |
| 🥇 Oro | 30 | ~16.8k | `#f5c542` |
| 💠 Platino | 50 | ~48k | `#7de3f4` |
| 👑 Leyenda | 75 | ~110k | `#c084fc` |

### 4. Clases y títulos evolutivos

Tu clase es la del **atributo más alto** (en empate gana el primero del registro). El título mostrado en la tarjeta **evoluciona con tu rango** — misma clase, cinco identidades:

| Clase (stat) | Bronce | Plata | Oro | Platino | Leyenda |
|---|---|---|---|---|---|
| ⚔️ Guerrero (STR) | Escudero | Guerrero | Caballero | Campeón | Señor de la Guerra |
| 🧭 Explorador (INT) | Rastreador | Explorador | Cazador | Maestro Cartógrafo | Señor de los Caminos |
| 🛡️ Paladín (WIS) | Acólito | Protector | Paladín | Cruzado | Avatar de la Justicia |
| ✨ Mago (CHA) | Aprendiz | Hechicero | Mago | Archimago | Gran Archimago |
| ⚗️ Alquimista (DEX) | Boticario | Alquimista | Maestro Alquimista | Transmutador | Gran Transmutador |
| 🎵 Bardo (VIT) | Juglar | Trovador | Bardo | Virtuoso | Voz de los Reinos |

### 5. Habilidad especial

La combinación de tus **2 stats más altos** desbloquea una de 15 habilidades (chip dorado en la tarjeta):

| Combinación | Habilidad | | Combinación | Habilidad |
|---|---|---|---|---|
| STR+DEX | 🌀 Danza de Espadas | | DEX+VIT | ⛓️ Resistencia Férrea |
| STR+INT | 🔨 Forja Arcana | | INT+WIS | 👁️ Ojo Omnisciente |
| STR+WIS | 🎯 Golpe Certero | | INT+CHA | 💫 Elocuencia Arcana |
| STR+CHA | 📣 Grito de Guerra | | INT+VIT | 📖 Memoria Ancestral |
| STR+VIT | 🧱 Muralla Inquebrantable | | WIS+CHA | 🔮 Voz del Oráculo |
| DEX+INT | 🏹 Flecha Rúnica | | WIS+VIT | 🗿 Guardián Eterno |
| DEX+WIS | ⚡ Parada Perfecta | | CHA+VIT | 🌟 Leyenda Viva |
| DEX+CHA | 🌙 Paso Sombrío | | | |

### 6. Logros

Badges desbloqueables (se muestran los primeros que quepan en la tarjeta):

| Logro | Condición |
|---|---|
| ⚔️ Slayer de 1000 commits | ≥1.000 commits |
| 🏆 Campeón de 100 PRs | ≥100 PRs |
| 🛡️ Guardián del Código | ≥50 reviews |
| ✨ Coleccionista de Estrellas | ≥100 stars |
| 🔥 Llama Eterna | Racha ≥30 días |
| 📜 Políglota Arcano | ≥5 lenguajes |
| 🗡️ Caballero Open Source | ≥10 PRs mergeados en repos ajenos |
| 🏰 Veterano del Reino | Cuenta ≥5 años |

Todo el sistema vive en registros extensibles (`src/config/`): añadir una clase, habilidad, rango o logro es añadir una entrada — los servicios no cambian.

## 🔒 Contribuciones privadas en tu ficha

Tu actividad en repos privados **puede contar para STR y XP sin exponer nada sensible** — sin tokens, sin OAuth, sin darle acceso a nadie:

1. Ve a **GitHub → Settings → Public profile → Contributions & Activity**
2. Activa **"Include private contributions on my profile"**
3. Listo: tu próxima ficha (el caché rota cada 6 h) incluirá el **conteo agregado** de tus contribuciones privadas

**Qué se expone y qué no:** únicamente el *número total* de contribuciones (p. ej. "2.941"), que es exactamente lo que GitHub ya muestra en tu gráfico de contribuciones al activar ese ajuste. Nunca se exponen nombres de repos, código ni detalles. Es revocable al instante desactivando el ajuste.

Sin el ajuste activado, la ficha funciona igual pero solo con tu actividad pública. (El dueño del Worker es la excepción: su propio token ve sus privadas siempre.)

## Endpoints

```
GET /card/:username         → SVG frente (README, <img>, <object>)
GET /card/:username/back    → SVG reverso: registro del gremio (métricas crudas + hazañas)
GET /card/:username/embed   → HTML interactivo (iframe: tilt 3D + flip al click)
```

| Query param | Descripción |
|---|---|
| `theme` | Theme visual (por defecto `dark-fantasy`) |
| `demo=1` | Métricas de demostración, sin token ni llamadas a GitHub |

### Dónde incrustar cada uno

- **README de GitHub** — imagen (GitHub no ejecuta JS ni pasa eventos al SVG; verás el diseño completo y las animaciones de entrada, sin hover):
  ```markdown
  ![Mi carta](https://gitdventurer.theempire.workers.dev/card/<usuario>)
  ```
- **README con "voltear al click"** — GitHub envuelve toda imagen en un enlace a su URL (un click en la carta siempre la abre), así que el volteo va en el **texto del `<summary>`**, el único click que un README respeta:
  ```html
  <img src="https://gitdventurer.theempire.workers.dev/card/<usuario>" alt="Carta de aventurero" />

  <details>
    <summary><b>🔄 Voltear la carta — ver el Registro del Gremio</b></summary>
    <br/>
    <img src="https://gitdventurer.theempire.workers.dev/card/<usuario>/back" alt="Registro del gremio" />
  </details>
  ```
- **Sitio web, versión ligera con hover** — `<object>` deja que el SVG reciba el cursor: el glow del rango se intensifica, el sello gira y las barras brillan:
  ```html
  <object data="https://gitdventurer.theempire.workers.dev/card/<usuario>" type="image/svg+xml"></object>
  ```
- **Sitio web, versión gremio 3D** — iframe con la carta en capas: tilt que sigue al puntero, parallax de profundidad (marco → marca de agua → stats → sello), brillo especular y **flip de 180° al click** que muestra el registro del gremio. Respeta `prefers-reduced-motion` (el flip se mantiene, sin animación):
  ```html
  <iframe src="https://gitdventurer.theempire.workers.dev/card/<usuario>/embed"
    width="540" height="340" frameborder="0"></iframe>
  ```

Las fichas se cachean 6 h en el edge (los errores solo 60 s). Los errores se devuelven como SVG temático — nunca una imagen rota.

**Resiliencia ante los límites de GitHub:** el presupuesto de la API para `contributionsCollection` es dinámico (depende del volumen de la cuenta) y además hay un límite secundario anti-ráfagas. El servicio responde con: pool de concurrencia limitada, divide-y-vencerás (lote → años individuales), reintentos con backoff, **caché por año** (los años históricos no cambian: 7 días) y lápidas de 24 h para años incomputables. Las cuentas gigantes pueden salir parciales en la primera carga (caché corto de 2 min) y **convergen solas** en la siguiente.

## Desarrollo

```bash
npm install
npm run dev                 # wrangler dev en http://localhost:8787
curl "http://localhost:8787/card/quien-sea?demo=1" -o card.svg   # sin token
```

Para datos reales crea `.dev.vars` en la raíz:

```
GITHUB_TOKEN=ghp_xxx   # PAT con permisos de solo lectura pública
```

```bash
npm test                # tests del scoring (Vitest)
npm run typecheck       # TypeScript estricto
```

## Deploy

```bash
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npm run deploy
```

El free tier de Workers (100k requests/día) es más que suficiente gracias al caché.

## Estructura

```
src/
├── controllers/   # Handlers HTTP (Hono)
├── services/      # GitHub GraphQL, scoring RPG, orquestador
├── views/         # SVG: tarjeta, error, componentes y themes
├── config/        # Registros extensibles: clases, rangos, logros
├── utils/         # Matemática, formato, caché edge
├── types/         # Contratos e interfaces compartidos
└── index.ts       # Entry point del Worker
tests/             # Tests de la lógica de scoring
```

Extender es añadir entradas de registro: un logro nuevo → una entrada en `achievements.config.ts`; un theme nuevo → una entrada en `views/themes/`.
