// Konfiguracja gry
const CONFIG = {
  canvas: {
    width: 1280,
    height: 720,
  },
  player: {
    speed: 4,
    size: 32,
  },
  sound: true,
}

// Główny obiekt gry
const game = {
  canvas: null,
  ctx: null,
  player: {
    x: 400,
    y: 300,
    direction: "down",
    isMoving: false,
    health: 100,
    maxHealth: 100,
    animationFrame: 0,
    lastFrameTime: 0,
  },
  score: 0,
  currentEra: "museum",
  keys: {},
  npcs: [],
  enemies: [],
  quests: [],
  currentDialog: null,
  dialogIndex: 0,
  soundEnabled: true,
  correctAnswers: 0,
  quizzesCompleted: 0,
  totalQuizzes: 8,
  lastEnemyAttack: 0,
  enemyAttackCooldown: 1500,
  audioContext: null,
  lastStepTime: 0,
  stepCooldown: 100,
  allQuestsCompletedDialogShown: false, // track if final dialog was shown

  // Inicjalizacja gry
  init() {
    this.canvas = document.getElementById("game-canvas")
    this.ctx = this.canvas.getContext("2d")
    this.canvas.width = CONFIG.canvas.width
    this.canvas.height = CONFIG.canvas.height

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    this.setupEventListeners()
    this.initQuests()
    this.initNPCs()
    this.initEnemies()
  },

  // Start gry
  startGame() {
    document.getElementById("start-screen").classList.remove("active")
    document.getElementById("game-screen").classList.add("active")
    this.init()
    this.gameLoop()
    this.speak("Witaj, podróżniku czasu! Twoją misją jest naprawienie błędów w historii.")
    this.showQuestNotification("Nowy Quest: Znajdź maszynę czasu w muzeum!")
  },

  // Instrukcje
  showInstructions() {
    document.getElementById("start-screen").classList.remove("active")
    document.getElementById("instructions-screen").classList.add("active")
  },

  hideInstructions() {
    document.getElementById("instructions-screen").classList.remove("active")
    document.getElementById("start-screen").classList.add("active")
  },

  // Słuchacze zdarzeń
  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true

      if (e.key === "e" || e.key === "E") {
        console.log("[v0] Klawisz E naciśnięty!")
        this.interact()
      }

      if (e.key === " ") {
        this.attack()
      }

      if (e.key === "Enter") {
        this.continueDialog()
      }
    })

    document.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false
    })
  },

  // Inicjalizacja questów
  initQuests() {
    this.quests = [
      {
        id: 1,
        title: "Odkrycie Maszyny Czasu",
        description: "Znajdź profesora i dowiedz się o maszynie czasu.",
        completed: false,
        era: "museum",
        questType: "talk", // add quest type
      },
      {
        id: 2,
        title: "Test Wiedzy - Nowożytność",
        description: "Zdaj quiz o nowożytności u profesora.",
        completed: false,
        era: "museum",
        questType: "quiz", // add quest type
      },
      {
        id: 3,
        title: "Tajemnice Faraona",
        description: "Porozmawiaj z Tutanchamonem i poznaj tajemnice Egiptu.",
        completed: false,
        era: "egypt",
        questType: "talk",
      },
      {
        id: 4,
        title: "Wiedza o Piramidach",
        description: "Rozwiąż quiz o starożytnym Egipcie.",
        completed: false,
        era: "egypt",
        questType: "quiz",
      },
      {
        id: 5,
        title: "Pokonaj Error Faraona",
        description: "Zniszcz błąd historyczny w Egipcie.",
        completed: false,
        era: "egypt",
        questType: "fight",
      },
      {
        id: 6,
        title: "Rycerz i Smok",
        description: "Pomóż rycerzowi i poznaj historię średniowiecza.",
        completed: false,
        era: "medieval",
        questType: "talk",
      },
      {
        id: 7,
        title: "Bitwa pod Grunwaldem",
        description: "Rozwiąż quiz o średniowieczu.",
        completed: false,
        era: "medieval",
        questType: "quiz",
      },
      {
        id: 8,
        title: "Pokonaj Error Smoka",
        description: "Zniszcz błąd historiczny w średniowieczu.",
        completed: false,
        era: "medieval",
        questType: "fight",
      },
      {
        id: 9,
        title: "Spotkanie z Geniuszem",
        description: "Porozmawiaj z Leonardem da Vinci.",
        completed: false,
        era: "renaissance",
        questType: "talk",
      },
      {
        id: 10,
        title: "Sztuka Renesansu",
        description: "Rozwiąż quiz o renesansie.",
        completed: false,
        era: "renaissance",
        questType: "quiz",
      },
      {
        id: 11,
        title: "Pokonaj Error Leonarda",
        description: "Zniszcz ostatni błąd historyczny.",
        completed: false,
        era: "renaissance",
        questType: "fight",
      },
    ]
  },

  // Inicjalizacja NPC
  initNPCs() {
    this.npcs = [
      {
        name: "Profesor Nieradko",
        x: 600,
        y: 300,
        era: "museum",
        color: "#4ade80",
        dialog: [
          "Witaj młody badaczu! Jestem Profesor Nieradko.",
          "Odkryłem coś niewiarygodnego - maszyna czasu jest PRAWDZIWA!",
          "Ale ktoś manipulował historią... Wszędzie są ERRORY HISTORYCZNE!",
          "Te plugawe stwory zmieniają fakty i niszczą przeszłość!",
          "Musisz podróżować przez epoki i naprawić te pomyłki.",
          "Ale najpierw muszę sprawdzić twoją wiedzę. Gotowy na pierwszy quiz?",
        ],
        quiz: {
          question: "W którym roku Krzysztof Kolumb odkrył Amerykę?",
          answers: ["1492", "1500", "1776", "1066"],
          correct: 0,
        },
        secondDialog: [
          "Świetnie! Widzę, że znasz się na historii!",
          "Twoja wiedza będzie bezcenna w tej misji.",
          "Ale zanim wyślesz się w świat, powinienem dać ci więcej informacji.",
          "Historia rozpadła się na trzy główne epoki pełne błędów...",
          "W starożytnym Egipcie Faraon Tutanchamon walczy z Errorem Faraona!",
          "W średniowieczu Rycerz Lancelot broni swojej wioski przed Error Smokiem!",
          "A w renesansie Leonardo da Vinci szuka kradzieży swoich arcydzieł!",
          "Każdą z tych epok czeka quiz sprawdzający twoją wiedzę.",
          "Teraz przejdź ostateczny test - odpowiedz na drugie pytanie!",
        ],
        secondQuiz: {
          question: "Kto był pierwszym prezydentem USA?",
          answers: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"],
          correct: 0,
        },
        thirdDialog: [
          "Fantastycznie! Wróciłeś z sukcesem!",
          "Pokonałeś wszystkie Errory Historyczne w trzech epokach!",
          "Tutanchamon, Lancelot i Leonardo są bezpieczni!",
          "Historia została naprawiona i przyszłość jest uratowana!",
          "Twoja wiedza, odwaga i determinacja uczyniły Cię bohaterem czasów!",
          "Będziesz na zawsze pamiętany jako ten, który naprawił przeszłość!",
          "Gratuluję! Misja ukończona! 🎉",
        ],
        interacted: false,
        quizzesDone: 0,
      },
      {
        name: "Faraon Tutanchamon",
        x: 700,
        y: 350,
        era: "egypt",
        color: "#fbbf24",
        dialog: [
          "Witaj, śmiertelniku! Jestem Tutanchamon, władca Egiptu!",
          "Piramidy są ozdobą mojego królestwa...",
          "Ale ERROR HISTORYCZNY pojawił się na moich ziemiach!",
          "To plugastwo zmienia nasze święte teksty i kradnie artefakty!",
          "Najpierw udowodnij, że znasz historię Egiptu!",
        ],
        quiz: {
          question: "Ile lat budowano Wielką Piramidę w Gizie?",
          answers: ["Około 20 lat", "100 lat", "5 lat", "200 lat"],
          correct: 0,
        },
        secondDialog: [
          "Imponujące! Jesteś mądrzejszy niż myślałem!",
          "Ale to było tylko preludium do największej próby.",
          "Historia Egiptu jest zagrożona przez siłę, którą stworzył Error Historyczny.",
          "Ten twór ma dostęp do całej naszej przeszłości i szpąci fakty!",
          "Musisz rozwiązać jeszcze jedno pytanie - tym razem bardziej skomplikowane.",
          "Będzie to ostatni sprawdzian przed walką z wrogiem!",
        ],
        secondQuiz: {
          question: "Jak nazywa się pismo starożytnych Egipcjan?",
          answers: ["Hieroglify", "Cyrylica", "Łacina", "Runy"],
          correct: 0,
        },
        interacted: false,
        quizzesDone: 0,
      },
      {
        name: "Rycerz Lancelot",
        x: 500,
        y: 400,
        era: "medieval",
        color: "#60a5fa",
        dialog: [
          "Witaj, dzielny wojowniku! Jestem Sir Lancelot z Okrągłego Stołu!",
          "Nasza wioska jest terroryzowana przez ERRORA HISTORYCZNEGO!",
          "Przybiera postać smoka i sieje zniszczenie!",
          "Król Artur powierzył mi misję jego pokonania...",
          "Ale najpierw - test twojej wiedzy o średniowieczu!",
        ],
        quiz: {
          question: "W którym roku odbyła się bitwa pod Grunwaldem?",
          answers: ["1410", "1492", "1067", "1500"],
          correct: 0,
        },
        secondDialog: [
          "Doskonale! Znasz naszą historię!",
          "Twoja odwaga i wiedza zaczynają być legendarni!",
          "Ale legend jest tu więcej - Error Smok pochłania wszystkie opowieści o średniowieczu.",
          "Poprzez manipulowanie faktami, zmienia losy rycerzy i królów!",
          "Musimy działać szybko, nim cała nasza historia będzie skażona.",
          "Przed tobą jeszcze jedno wyzwanie - ostatnia część egzaminu!",
          "Pokaż mi, że jesteś godny miana legendy!",
        ],
        secondQuiz: {
          question: "Kto był królem Polski podczas bitwy pod Grunwaldem?",
          answers: ["Władysław Jagiełło", "Kazimierz Wielki", "Bolesław Chrobry", "Mieszko I"],
          correct: 0,
        },
        interacted: false,
        quizzesDone: 0,
      },
      {
        name: "Leonardo da Vinci",
        x: 650,
        y: 320,
        era: "renaissance",
        color: "#f472b6",
        dialog: [
          "Buongiorno! Leonardo da Vinci do usług!",
          "Jestem artystą, wynalazcą i wizjonerem...",
          "Ale mój najważniejszy szkic został ukradziony!",
          "Widziałem dziwny ERROR HISTORYCZNY w pobliżu mojego warsztatu...",
          "To on ukradł moje dzieło! Ale najpierw quiz o sztuce!",
        ],
        quiz: {
          question: "W którym roku Leonardo namalował Mona Lisę?",
          answers: ["1503-1519", "1600", "1400", "1700"],
          correct: 0,
        },
        secondDialog: [
          "Magnifico! Znasz się na sztuce!",
          "Twoja wiedza o renesansie jest wręcz artystyczna!",
          "Ale czeka nas ostatnie arcydzieło tej podróży...",
          "Error Leonarda to nie zwykły wróg - to uosobienie chaosu i zapomnień.",
          "Kradzie dzieła geniuszu i niszczy dusze twórców!",
          "Ten quiz będzie najbardziej skomplikowany ze wszystkich - test ostateczny!",
          "Jeśli przejdziesz, będziesz gotów na ostateczną bitwę!",
        ],
        secondQuiz: {
          question: "Które z tych dzieł NIE zostało stworzone przez Leonarda?",
          answers: ["Stworzenie Adama", "Dama z gronostajem", "Ostatnia wieczerza", "Człowiek witruwiański"],
          correct: 0,
        },
        interacted: false,
        quizzesDone: 0,
      },
    ]
  },

  // Inicjalizacja wrogów
  initEnemies() {
    this.enemies = [
      {
        x: 800,
        y: 200,
        era: "egypt",
        health: 5,
        maxHealth: 5,
        name: "Error Faraona",
        speed: 2,
        aggro: false,
        aggroRange: 250,
        attackRange: 50,
        lastAttack: 0,
        attackCooldown: 2000,
      },
      {
        x: 300,
        y: 250,
        era: "medieval",
        health: 6,
        maxHealth: 6,
        name: "Error Smoka",
        speed: 1.5,
        aggro: false,
        aggroRange: 300,
        attackRange: 50,
        lastAttack: 0,
        attackCooldown: 1800,
      },
      {
        x: 900,
        y: 450,
        era: "renaissance",
        health: 7,
        maxHealth: 7,
        name: "Error Leonarda",
        speed: 2.5,
        aggro: false,
        aggroRange: 280,
        attackRange: 50,
        lastAttack: 0,
        attackCooldown: 1500,
      },
    ]
  },

  // Pętla gry
  gameLoop() {
    this.update()
    this.render()
    requestAnimationFrame(() => this.gameLoop())
  },

  // Aktualizacja
  update() {
    const currentTime = Date.now()
    if (this.player.isMoving && currentTime - this.player.lastFrameTime > 100) {
      this.player.animationFrame = (this.player.animationFrame + 1) % 4
      this.player.lastFrameTime = currentTime
    }

    // Ruch gracza
    this.movePlayer()

    this.updateEnemies()

    // Zmiana epoki (portale)
    this.checkPortals()

    // Aktualizacja życia
    this.updateHealthBar()
  },

  movePlayer() {
    // Ruch gracza
    this.player.isMoving = false

    if (this.keys["w"] || this.keys["arrowup"]) {
      this.player.y -= CONFIG.player.speed
      this.player.direction = "up"
      this.player.isMoving = true
      const now = Date.now()
      if (now - this.lastStepTime > this.stepCooldown) {
        this.playSound("step")
        this.lastStepTime = now
      }
    }
    if (this.keys["s"] || this.keys["arrowdown"]) {
      this.player.y += CONFIG.player.speed
      this.player.direction = "down"
      this.player.isMoving = true
      const now = Date.now()
      if (now - this.lastStepTime > this.stepCooldown) {
        this.playSound("step")
        this.lastStepTime = now
      }
    }
    if (this.keys["a"] || this.keys["arrowleft"]) {
      this.player.x -= CONFIG.player.speed
      this.player.direction = "left"
      this.player.isMoving = true
      const now = Date.now()
      if (now - this.lastStepTime > this.stepCooldown) {
        this.playSound("step")
        this.lastStepTime = now
      }
    }
    if (this.keys["d"] || this.keys["arrowright"]) {
      this.player.x += CONFIG.player.speed
      this.player.direction = "right"
      this.player.isMoving = true
      const now = Date.now()
      if (now - this.lastStepTime > this.stepCooldown) {
        this.playSound("step")
        this.lastStepTime = now
      }
    }

    // Granice mapy
    this.player.x = Math.max(32, Math.min(CONFIG.canvas.width - 32, this.player.x))
    this.player.y = Math.max(32, Math.min(CONFIG.canvas.height - 32, this.player.y))
  },

  updateEnemies() {
    const currentTime = Date.now()

    this.enemies.forEach((enemy) => {
      if (enemy.era !== this.currentEra || enemy.health <= 0) return

      const distToPlayer = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y)

      // Ściganie gracza tylko gdy jest aktywowany
      if (enemy.aggro) {
        const dx = this.player.x - enemy.x
        const dy = this.player.y - enemy.y
        const dist = Math.hypot(dx, dy)

        if (dist > enemy.attackRange) {
          // Ruch w kierunku gracza
          enemy.x += (dx / dist) * enemy.speed
          enemy.y += (dy / dist) * enemy.speed
        } else {
          // Atak gracza
          if (currentTime - enemy.lastAttack > enemy.attackCooldown) {
            this.enemyAttackPlayer(enemy)
            enemy.lastAttack = currentTime
          }
        }
      }
    })
  },

  enemyAttackPlayer(enemy) {
    this.player.health -= 10
    this.updateHealthBar()
    this.playSound("hit")
    this.speak(`${enemy.name} cię atakuje! Uciekaj lub walcz!`)

    // Wizualny efekt trafienia
    this.showDamageEffect()
  },

  showDamageEffect() {
    const canvas = this.canvas
    canvas.style.filter = "brightness(0.5)"
    setTimeout(() => {
      canvas.style.filter = "brightness(1)"
    }, 100)
  },

  // Renderowanie
  render() {
    // Tło
    this.renderBackground()

    // NPC w aktualnej epoce
    this.npcs.forEach((npc) => {
      if (npc.era === this.currentEra) {
        this.renderNPC(npc)
      }
    })

    // Wrogowie
    this.enemies.forEach((enemy) => {
      if (enemy.era === this.currentEra && enemy.health > 0) {
        this.renderEnemy(enemy)
      }
    })

    // Portale
    this.renderPortals()

    // Gracz
    this.renderPlayer()

    // Wskaźnik interakcji
    this.renderInteractionPrompt()
  },

  // Renderowanie tła
  renderBackground() {
    const backgrounds = {
      museum: { color1: "#34495e", color2: "#2c3e50" },
      egypt: { color1: "#f39c12", color2: "#d68910" },
      medieval: { color1: "#27ae60", color2: "#229954" },
      renaissance: { color1: "#e74c3c", color2: "#c0392b" },
    }

    const bg = backgrounds[this.currentEra]
    const gradient = this.ctx.createLinearGradient(0, 0, CONFIG.canvas.width, CONFIG.canvas.height)
    gradient.addColorStop(0, bg.color1)
    gradient.addColorStop(1, bg.color2)

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height)

    // Siatka
    this.ctx.strokeStyle = "rgba(255,255,256,0.1)"
    this.ctx.lineWidth = 1
    for (let i = 0; i < CONFIG.canvas.width; i += 64) {
      this.ctx.beginPath()
      this.ctx.moveTo(i, 0)
      this.ctx.lineTo(i, CONFIG.canvas.height)
      this.ctx.stroke()
    }
    for (let i = 0; i < CONFIG.canvas.height; i += 64) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, i)
      this.ctx.lineTo(CONFIG.canvas.width, i)
      this.ctx.stroke()
    }

    // Nazwa epoki
    const eraNames = {
      museum: "MUZEUM",
      egypt: "STAROŻYTNY EGIPT - 2500 p.n.e.",
      medieval: "ŚREDNIOWIECZE - 1410 r.",
      renaissance: "RENESANS - 1503 r.",
    }

    this.ctx.fillStyle = "rgba(255,255,256,0.3)"
    this.ctx.font = "bold 48px Arial"
    this.ctx.textAlign = "center"
    this.ctx.fillText(eraNames[this.currentEra], CONFIG.canvas.width / 2, 80)
  },

  // Renderowanie gracza
  renderPlayer() {
    const ctx = this.ctx
    const x = this.player.x
    const y = this.player.y

    // Ciało gracza - gradient
    const gradient = ctx.createLinearGradient(x - 16, y - 16, x + 16, y + 16)
    gradient.addColorStop(0, "#3498db")
    gradient.addColorStop(1, "#2980b9")
    ctx.fillStyle = gradient
    ctx.fillRect(x - 16, y - 16, 32, 32)

    // Kontur
    ctx.strokeStyle = "#1e5a8e"
    ctx.lineWidth = 2
    ctx.strokeRect(x - 16, y - 16, 32, 32)

    // Głowa / twarz
    ctx.fillStyle = "#f4d4a8"
    ctx.fillRect(x - 10, y - 12, 20, 16)

    // Oczy
    ctx.fillStyle = "#000"
    ctx.fillRect(x - 8, y - 8, 4, 4)
    ctx.fillRect(x + 4, y - 8, 4, 4)

    // Uśmiech
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x, y - 2, 6, 0, Math.PI)
    ctx.stroke()

    // Kierunek - broń
    ctx.fillStyle = "#95a5a6"
    const weaponOffsets = {
      up: { x: 0, y: -20 },
      down: { x: 0, y: 20 },
      left: { x: -20, y: 0 },
      right: { x: 20, y: 0 },
    }
    const offset = weaponOffsets[this.player.direction]
    ctx.fillRect(x + offset.x - 2, y + offset.y - 6, 4, 12)

    // Animacja ruchu - odbicie
    if (this.player.isMoving && this.player.animationFrame % 2 === 0) {
      ctx.fillStyle = "rgba(52, 152, 219, 0.3)"
      ctx.fillRect(x - 18, y - 18, 36, 36)
    }
  },

  // Renderowanie NPC
  renderNPC(npc) {
    const ctx = this.ctx
    const x = npc.x
    const y = npc.y

    // Ciało NPC - gradient
    const gradient = ctx.createLinearGradient(x - 16, y - 16, x + 16, y + 16)
    gradient.addColorStop(0, npc.color)
    gradient.addColorStop(1, this.darkenColor(npc.color))
    ctx.fillStyle = gradient
    ctx.fillRect(x - 16, y - 16, 32, 32)

    // Kontur
    ctx.strokeStyle = this.darkenColor(npc.color, 0.5)
    ctx.lineWidth = 2
    ctx.strokeRect(x - 16, y - 16, 32, 32)

    // Głowa
    ctx.fillStyle = "#f4d4a8"
    ctx.fillRect(x - 10, y - 12, 20, 16)

    // Oczy
    ctx.fillStyle = "#000"
    ctx.fillRect(x - 8, y - 8, 4, 4)
    ctx.fillRect(x + 4, y - 8, 4, 4)

    // Wykrzyknik jeśli nie rozmawialiśmy lub jest kolejny quiz
    if (!npc.interacted || npc.quizzesDone < 2) {
      ctx.fillStyle = "#ffd700"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      const time = Date.now() / 500
      const bounce = Math.sin(time) * 3
      ctx.fillText("!", x, y - 30 + bounce)
    }

    // Imię
    ctx.fillStyle = "#fff"
    ctx.font = "bold 12px Arial"
    ctx.textAlign = "center"
    ctx.shadowColor = "#000"
    ctx.shadowBlur = 4
    ctx.fillText(npc.name, x, y + 40)
    ctx.shadowBlur = 0
  },

  darkenColor(color, factor = 0.7) {
    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substr(0, 2), 16)
    const g = Number.parseInt(hex.substr(2, 2), 16)
    const b = Number.parseInt(hex.substr(4, 2), 16)

    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`
  },

  // Renderowanie wroga
  renderEnemy(enemy) {
    const ctx = this.ctx
    const x = enemy.x
    const y = enemy.y
    const time = Date.now() / 200

    if (enemy.aggro) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)"
      ctx.beginPath()
      ctx.arc(x, y, 40, 0, Math.PI * 2)
      ctx.fill()

      // Znak ostrzeżenia nad wrogiem
      ctx.fillStyle = "#ff0000"
      ctx.font = "bold 20px Arial"
      ctx.textAlign = "center"
      ctx.fillText("!", x, y - 40)
    }

    // Ciało wroga (pulsujące)
    const pulse = Math.sin(time) * 3
    ctx.fillStyle = "#dc2626"
    ctx.fillRect(x - 15, y - 15, 30, 30 + pulse)

    // Kontur
    ctx.strokeStyle = "#991b1b"
    ctx.lineWidth = 3
    ctx.strokeRect(x - 15, y - 15, 30, 30 + pulse)

    // Czerwone, świecące oczy
    ctx.fillStyle = "#ff0000"
    ctx.fillRect(x - 12, y - 8, 8, 8)
    ctx.fillRect(x + 4, y - 8, 8, 8)

    // Świecenie oczu
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"
    ctx.fillRect(x - 14, y - 10, 12, 12)
    ctx.fillRect(x + 2, y - 10, 12, 12)

    // Zły uśmiech
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y + 5, 8, 0, Math.PI, true)
    ctx.stroke()

    // Pasek życia
    ctx.fillStyle = "#000"
    ctx.fillRect(x - 15, y - 30, 30, 6)
    const healthPercent = enemy.health / enemy.maxHealth
    const healthColor = healthPercent > 0.5 ? "#2ecc71" : healthPercent > 0.25 ? "#f39c12" : "#e74c3c"
    ctx.fillStyle = healthColor
    ctx.fillRect(x - 15, y - 30, healthPercent * 30, 6)

    // Nazwa
    ctx.fillStyle = "#fff"
    ctx.font = "bold 11px Arial"
    ctx.textAlign = "center"
    ctx.shadowColor = "#000"
    ctx.shadowBlur = 4
    ctx.fillText(enemy.name, x, y + 45)
    ctx.shadowBlur = 0
  },

  // Renderowanie portali
  renderPortals() {
    const portals = {
      museum: [
        { x: 200, y: 200, to: "egypt", label: "Egipt" },
        { x: 1000, y: 200, to: "medieval", label: "Średniowiecze" },
        { x: 600, y: 600, to: "renaissance", label: "Renesans" },
      ],
      egypt: [{ x: 100, y: 100, to: "museum", label: "Muzeum" }],
      medieval: [{ x: 100, y: 100, to: "museum", label: "Muzeum" }],
      renaissance: [{ x: 100, y: 100, to: "museum", label: "Muzeum" }],
    }

    const currentPortals = portals[this.currentEra] || []
    currentPortals.forEach((portal) => {
      // Portal wirujący
      const time = Date.now() / 1000
      const radius = 30 + Math.sin(time * 2) * 5

      const gradient = this.ctx.createRadialGradient(portal.x, portal.y, 0, portal.x, portal.y, radius)
      gradient.addColorStop(0, "#ffd700")
      gradient.addColorStop(0.5, "#9b59b6")
      gradient.addColorStop(1, "transparent")

      this.ctx.fillStyle = gradient
      this.ctx.beginPath()
      this.ctx.arc(portal.x, portal.y, radius, 0, Math.PI * 2)
      this.ctx.fill()

      // Label
      this.ctx.fillStyle = "#fff"
      this.ctx.font = "14px Arial"
      this.ctx.textAlign = "center"
      this.ctx.fillText(portal.label, portal.x, portal.y + 50)
    })
  },

  // Sprawdzanie portali
  checkPortals() {
    const portals = {
      museum: [
        { x: 200, y: 200, to: "egypt", label: "Egipt" },
        { x: 1000, y: 200, to: "medieval", label: "Średniowiecze" },
        { x: 600, y: 600, to: "renaissance", label: "Renesans" },
      ],
      egypt: [{ x: 100, y: 100, to: "museum", label: "Muzeum" }],
      medieval: [{ x: 100, y: 100, to: "museum", label: "Muzeum" }],
      renaissance: [{ x: 100, y: 100, to: "museum", label: "Muzeum" }],
    }

    const currentPortals = portals[this.currentEra] || []
    currentPortals.forEach((portal) => {
      const dist = Math.hypot(this.player.x - portal.x, this.player.y - portal.y)
      if (dist < 50) {
        this.changeEra(portal.to)
      }
    })
  },

  // Zmiana epoki
  changeEra(newEra) {
    this.currentEra = newEra
    document.getElementById("era").textContent =
      newEra === "museum"
        ? "Muzeum"
        : newEra === "egypt"
          ? "Egipt"
          : newEra === "medieval"
            ? "Średniowiecze"
            : "Renesans"
    this.playSound("portal")
    this.speak(`Przeniesiono do epoki: ${document.getElementById("era").textContent}`)
  },

  // Wskaźnik interakcji
  renderInteractionPrompt() {
    const nearNPC = this.npcs.find((npc) => {
      if (npc.era !== this.currentEra) return false
      const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y)
      return dist < 80
    })

    if (nearNPC) {
      this.ctx.fillStyle = "rgba(0,0,0,0.7)"
      this.ctx.fillRect(this.player.x - 40, this.player.y - 50, 80, 25)
      this.ctx.fillStyle = "#ffd700"
      this.ctx.font = "12px Arial"
      this.ctx.textAlign = "center"
      this.ctx.fillText("Wciśnij E", this.player.x, this.player.y - 35)
    }
  },

  // Interakcja
  interact() {
    const interactionRange = 100

    // Szukanie NPC w pobliżu
    const nearNPC = this.npcs.find(
      (npc) =>
        npc.era === this.currentEra && Math.hypot(npc.x - this.player.x, npc.y - this.player.y) < interactionRange,
    )

    console.log("[v0] Znaleziony NPC:", nearNPC?.name)

    if (nearNPC && !this.currentDialog) {
      if (
        this.quests.every((q) => q.completed) &&
        nearNPC.name === "Profesor Nieradko" &&
        !this.allQuestsCompletedDialogShown
      ) {
        console.log("[v0] Wszystkie questy ukończone! Pokazuję dialog podsumowujący")
        this.allQuestsCompletedDialogShown = true
        this.startThirdDialog(nearNPC)
      } else if (!nearNPC.interacted) {
        console.log("[v0] Rozpoczynam pierwszy dialog z", nearNPC.name)
        this.startDialog(nearNPC)
      } else if (nearNPC.quizzesDone < 2 && nearNPC.secondDialog) {
        console.log("[v0] Rozpoczynam drugi dialog z", nearNPC.name)
        this.startSecondDialog(nearNPC)
      } else {
        this.speak("Już ze mną rozmawiałeś! Idź dalej w swoją podróż!")
      }
    } else if (!nearNPC) {
      console.log("[v0] Brak NPC w pobliżu - sprawdź czy jesteś w odpowiedniej erze")
    } else if (this.currentDialog) {
      console.log("[v0] Dialog już aktywny")
    }
  },

  // Dialog
  startDialog(npc) {
    console.log("[v0] Startowanie dialogu z", npc.name)
    this.currentDialog = npc
    this.currentDialog.isSecondDialog = false
    this.currentDialog.isThirdDialog = false
    this.dialogIndex = 0
    this.completeTalkQuestForNPC(npc)
    showDialogBox(npc.dialog[0], npc.name)
    this.speak(npc.dialog[0])
    npc.interacted = true
  },

  startSecondDialog(npc) {
    console.log("[v0] Startowanie drugiego dialogu z", npc.name)
    this.currentDialog = npc
    this.currentDialog.isSecondDialog = true
    this.currentDialog.isThirdDialog = false
    this.dialogIndex = 0
    showDialogBox(npc.secondDialog[0], npc.name)
    this.speak(npc.secondDialog[0])
  },

  startThirdDialog(npc) {
    if (!npc.thirdDialog) return
    console.log("[v0] Startowanie trzeciego dialogu z", npc.name)
    this.currentDialog = npc
    this.currentDialog.isSecondDialog = false
    this.currentDialog.isThirdDialog = true
    this.dialogIndex = 0
    showDialogBox(npc.thirdDialog[0], npc.name)
    this.speak(npc.thirdDialog[0])
  },

  continueDialog() {
    if (!this.currentDialog) return

    this.dialogIndex++

    const isSecond = this.currentDialog.isSecondDialog
    const isThird = this.currentDialog.isThirdDialog
    const dialogArray = isThird
      ? this.currentDialog.thirdDialog
      : isSecond
        ? this.currentDialog.secondDialog
        : this.currentDialog.dialog

    if (this.dialogIndex < dialogArray.length) {
      showDialogBox(dialogArray[this.dialogIndex], this.currentDialog.name)
      this.speak(dialogArray[this.dialogIndex])
    } else {
      hideDialogBox()

      if (isThird) {
        this.currentDialog = null
        setTimeout(() => this.endGame(), 1000)
        return
      }

      const npcRef = this.currentDialog
      const quiz = isSecond ? npcRef.secondQuiz : npcRef.quiz

      if (quiz && npcRef.quizzesDone < 2) {
        console.log("[v0] Pokazuję quiz dla:", npcRef.name)
        this.showQuiz(quiz, npcRef, isSecond)
      } else if (!isSecond && npcRef.quizzesDone === 1) {
        console.log("[v0] Automatyczne przejście do drugiego dialogu")
        this.currentDialog = null
        setTimeout(() => this.startSecondDialog(npcRef), 500)
      }

      this.currentDialog = null
    }
  },

  showQuiz(quiz, npc, isSecond = false) {
    console.log("[v0] Wyświetlam quiz dla:", npc.name)

    const quizBox = document.getElementById("quiz-box")
    const questionEl = document.getElementById("quiz-question")
    const answersEl = document.getElementById("quiz-answers")

    // Clear any previous quiz state
    answersEl.innerHTML = ""

    questionEl.textContent = quiz.question

    const answersWithIndex = quiz.answers.map((answer, index) => ({
      text: answer,
      originalIndex: index,
    }))

    // Losowo przemiksuj odpowiedzi
    for (let i = answersWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[answersWithIndex[i], answersWithIndex[j]] = [answersWithIndex[j], answersWithIndex[i]]
    }

    // Wyświetl przemiksowane odpowiedzi
    answersWithIndex.forEach((answerObj) => {
      const button = document.createElement("button")
      button.textContent = answerObj.text
      button.className = "quiz-answer"
      button.dataset.index = answerObj.originalIndex // Przechowaj oryginalny index dla sprawdzenia
      button.onclick = () => this.checkAnswer(answerObj.originalIndex, quiz.correct, npc, button)
      answersEl.appendChild(button)
    })

    quizBox.classList.add("active")
    this.speak(quiz.question)
  },

  checkAnswer(selected, correct, npc, buttonElement) {
    const quizBox = document.getElementById("quiz-box")
    const answersEl = document.getElementById("quiz-answers")
    const allAnswers = answersEl.querySelectorAll(".quiz-answer")

    // Disable all buttons during feedback
    allAnswers.forEach((btn) => (btn.disabled = true))

    if (selected === correct) {
      this.correctAnswers++
      this.quizzesCompleted++
      npc.quizzesDone++

      console.log("[v0] Poprawna odpowiedź! quizzesDone:", npc.quizzesDone)

      buttonElement.classList.add("correct")
      this.playSound("success")
      this.speak("Brawo! To poprawna odpowiedź!")

      setTimeout(() => {
        quizBox.classList.remove("active")

        this.completeQuizQuestForNPC(npc)

        // Logika przejścia: jeśli to drugi quiz, aktywuj wroga; jeśli pierwszy - przejście do drugiego dialogu
        if (npc.quizzesDone === 2) {
          console.log("[v0] Oba quizy ukończone, aktywacja wroga")
          this.activateEnemyForNPC(npc)
        } else if (npc.quizzesDone === 1) {
          console.log("[v0] Pierwszy quiz ukończony, przejście do drugiego dialogu")
          this.startSecondDialog(npc)
        }
      }, 1500)
    } else {
      buttonElement.classList.add("incorrect")
      this.playSound("fail")
      this.speak("Niestety, to błędna odpowiedź. Spróbuj jeszcze raz!")

      // Allow retry after 1.5 seconds
      setTimeout(() => {
        buttonElement.classList.remove("incorrect")
        allAnswers.forEach((btn) => {
          btn.disabled = false
        })
      }, 1500)
    }
  },

  completeQuizQuestForNPC(npc) {
    const questIndex = this.quests.findIndex((q) => q.era === npc.era && !q.completed && q.questType === "quiz")
    if (questIndex !== -1) {
      this.quests[questIndex].completed = true
      this.showQuestNotification(`Quest ukończony: ${this.quests[questIndex].title}`)
      console.log("[v0] Quiz quest completed for", npc.name, ":", this.quests[questIndex].title)
    } else {
      console.log("[v0] No quiz quest found for", npc.name, "in era", npc.era)
    }
  },

  completeTalkQuestForNPC(npc) {
    const questIndex = this.quests.findIndex((q) => q.era === npc.era && !q.completed && q.questType === "talk")
    if (questIndex !== -1) {
      this.quests[questIndex].completed = true
      this.showQuestNotification(`Quest ukończony: ${this.quests[questIndex].title}`)
      console.log("[v0] Talk quest completed for", npc.name, ":", this.quests[questIndex].title)
    } else {
      console.log("[v0] No talk quest found for", npc.name, "in era", npc.era)
    }
  },

  activateEnemyForNPC(npc) {
    let enemyName = null

    // Mapowanie NPC do wrogów
    if (npc.name === "Faraon Tutanchamon") {
      enemyName = "Error Faraona"
    } else if (npc.name === "Rycerz Lancelot") {
      enemyName = "Error Smoka"
    } else if (npc.name === "Leonardo da Vinci") {
      enemyName = "Error Leonarda"
    }

    if (enemyName) {
      const enemy = this.enemies.find((e) => e.name === enemyName)
      if (enemy) {
        enemy.aggro = true
        console.log("[v0] Aktywowano wroga:", enemyName)
        this.speak(`UWAGA! ${enemyName} właśnie się przebudził i idzie po ciebie!`)
      }
    }
  },

  attack() {
    // Szukanie wroga w pobliżu
    const nearEnemy = this.enemies.find(
      (e) => e.era === this.currentEra && Math.hypot(e.x - this.player.x, e.y - this.player.y) < 100 && e.health > 0,
    )

    if (nearEnemy) {
      nearEnemy.health -= 1
      this.playSound("attack")

      if (nearEnemy.health <= 0) {
        this.playSound("victory")
        this.speak(`Pokonałeś ${nearEnemy.name}! Historia została naprawiona!`)
        this.score += 200
        document.getElementById("score").textContent = this.score

        const questIndex = this.quests.findIndex(
          (q) => q.era === this.currentEra && !q.completed && q.questType === "fight",
        )
        if (questIndex !== -1) {
          this.quests[questIndex].completed = true
          this.showQuestNotification(`Quest ukończony: ${this.quests[questIndex].title}`)
        }

        // Sprawdź czy wszystkie questy ukończone
        if (this.quests.every((q) => q.completed)) {
          console.log("[v0] Wszystkie questy ukończone! Wysyłam do Profesora.")
          this.currentEra = "museum"
          this.showQuestNotification("Wróć do Profesora Nieradko w muzeum!")
        }
      }
    }
  },

  // Pasek życia
  updateHealthBar() {
    const healthFill = document.getElementById("health-fill")
    const percentage = (this.player.health / this.player.maxHealth) * 100
    healthFill.style.width = percentage + "%"

    if (this.player.health <= 0) {
      this.gameOver()
    }
  },

  // Quest notification
  showQuestNotification(text) {
    const notification = document.getElementById("quest-notification")
    document.getElementById("quest-text").textContent = text
    notification.classList.add("active")

    setTimeout(() => {
      notification.classList.remove("active")
    }, 4000)
  },

  // Panel questów
  showQuests() {
    const panel = document.getElementById("quests-panel")
    const list = document.getElementById("quests-list")

    list.innerHTML = ""
    this.quests.forEach((quest) => {
      const item = document.createElement("div")
      item.className = "quest-item" + (quest.completed ? " completed" : "")
      item.innerHTML = `
                <div class="quest-title">${quest.completed ? "✅" : "⏳"} ${quest.title}</div>
                <div class="quest-description">${quest.description}</div>
                ${quest.completed ? '<div class="quest-status">Ukończono!</div>' : ""}
            `
      list.appendChild(item)
    })

    panel.classList.add("active")
  },

  hideQuests() {
    document.getElementById("quests-panel").classList.remove("active")
  },

  // Dźwięk
  toggleSound() {
    this.soundEnabled = !this.soundEnabled
    document.getElementById("sound-icon").textContent = this.soundEnabled ? "🔊" : "🔇"
  },

  playSound(type) {
    if (!this.soundEnabled || !this.audioContext) return

    const audioContext = this.audioContext

    switch (type) {
      case "step": {
        const oscillator1 = audioContext.createOscillator()
        const gainNode1 = audioContext.createGain()
        oscillator1.connect(gainNode1)
        gainNode1.connect(audioContext.destination)

        // First step sound (slightly lower pitch)
        oscillator1.frequency.value = 150
        gainNode1.gain.value = 0.08
        oscillator1.start()
        oscillator1.stop(audioContext.currentTime + 0.04)

        // Second step sound (slightly higher pitch - right foot)
        const oscillator2 = audioContext.createOscillator()
        const gainNode2 = audioContext.createGain()
        oscillator2.connect(gainNode2)
        gainNode2.connect(audioContext.destination)
        oscillator2.frequency.value = 180
        gainNode2.gain.value = 0.08
        oscillator2.start(audioContext.currentTime + 0.05)
        oscillator2.stop(audioContext.currentTime + 0.09)
        break
      }
      case "attack": {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 300
        gainNode.gain.value = 0.2
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.1)
        break
      }
      case "success": {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 523.25
        gainNode.gain.value = 0.3
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.2)
        break
      }
      case "fail": {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 200
        gainNode.gain.value = 0.3
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.3)
        break
      }
      case "portal": {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 440
        gainNode.gain.value = 0.2
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.5)
        break
      }
      case "victory": {
        // Melodia zwycięstwa
        ;[523, 587, 659, 784].forEach((freq, i) => {
          const osc = audioContext.createOscillator()
          const gain = audioContext.createGain()
          osc.connect(gain)
          gain.connect(audioContext.destination)
          osc.frequency.value = freq
          gain.gain.value = 0.2
          osc.start(audioContext.currentTime + i * 0.2)
          osc.stop(audioContext.currentTime + (i + 1) * 0.2)
        })
        break
      }
      case "hit": {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 800
        gainNode.gain.value = 0.3
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.2)
        break
      }
    }
  },

  // Synteza mowy (narrator)
  speak(text) {
    if (!this.soundEnabled) return

    if ("speechSynthesis" in window) {
      // Anuluj poprzednią mowę
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "pl-PL"
      utterance.rate = 1.1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  },

  // Koniec gry
  endGame() {
    document.getElementById("game-screen").classList.remove("active")
    document.getElementById("end-screen").classList.add("active")

    document.getElementById("final-score").textContent = this.score
    document.getElementById("completed-quests").textContent = this.quests.filter((q) => q.completed).length
    document.getElementById("correct-answers").textContent = this.correctAnswers

    this.playSound("victory")
    this.speak("Gratulacje! Ukończyłeś wszystkie questy i uratowałeś historię!")
  },

  gameOver() {
    this.speak("Zginąłeś! Errory Historyczne wygrały... Historia jest zniszczona!")

    setTimeout(() => {
      if (confirm("GAME OVER! Zginąłeś. Chcesz spróbować ponownie?")) {
        location.reload()
      }
    }, 1000)
  },
}

// Funkcja pomocnicza do wyświetlenia okna dialogowego
function showDialogBox(text, speaker) {
  const dialogBox = document.getElementById("dialog-box")
  const dialogText = document.getElementById("dialog-text")
  const dialogSpeaker = document.getElementById("dialog-name")

  dialogText.textContent = text
  dialogSpeaker.textContent = speaker
  dialogBox.classList.add("active")
}

// Funkcja pomocnicza do ukrycia okna dialogowego
function hideDialogBox() {
  const dialogBox = document.getElementById("dialog-box")
  dialogBox.classList.remove("active")
}

// Funkcja pomocnicza do ukończenia questu
function completeQuest(npcName) {
  const questIndex = game.quests.findIndex(
    (q) => q.era === game.currentEra && !q.completed && q.description.includes(npcName),
  )
  if (questIndex !== -1) {
    game.quests[questIndex].completed = true
    game.showQuestNotification(`Quest ukończony: ${game.quests[questIndex].title}`)
  }
}

// Nasłuchiwanie klawisza E
document.addEventListener("keydown", (e) => {
  if (e.key === "e" || e.key === "E") {
    if (typeof game.interact === "function") {
      game.interact()
    } else {
      console.warn("Brak funkcji game.interact()!")
    }
  }
})
