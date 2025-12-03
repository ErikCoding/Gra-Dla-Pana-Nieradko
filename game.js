// ============================================
// AUDIO SYSTEM
// ============================================

class AudioManager {
  constructor() {
    this.audioContext = null
    this.masterVolume = 0.5
    this.musicVolume = 0.3
    this.sfxVolume = 0.6
    this.narrationVolume = 0.8
    this.muted = false

    this.currentMusic = null
    this.musicNodes = []

    // Initialize Web Audio API
    this.initAudioContext()
  }

  initAudioContext() {
    // Fix: Use window.AudioContext and window.webkitAudioContext for browser compatibility.
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      this.audioContext = new AudioContext()
    }
  }

  playFootstep() {
    if (this.muted || !this.audioContext) return

    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 80 + Math.random() * 20
    gainNode.gain.setValueAtTime(this.sfxVolume * 0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }

  playItemPickup() {
    if (this.muted || !this.audioContext) return

    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  playPortalSound() {
    if (this.muted || !this.audioContext) return

    const ctx = this.audioContext

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(200 + i * 100, ctx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(400 + i * 100, ctx.currentTime + 0.3)

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
      }, i * 50)
    }
  }

  playNotification() {
    if (this.muted || !this.audioContext) return

    const ctx = this.audioContext
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  playQuestComplete() {
    if (this.muted || !this.audioContext) return

    const ctx = this.audioContext
    const notes = [523, 659, 784, 1047] // C, E, G, C

    notes.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = "sine"
        oscillator.frequency.value = freq

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
      }, i * 100)
    })
  }

  speakNarration(text, rate = 1.0, pitch = 1.0) {
    // Fix: Check for window.speechSynthesis to prevent errors in environments without it.
    if (this.muted || typeof window.speechSynthesis === "undefined") return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Get available voices
    const voices = window.speechSynthesis.getVoices()

    // Try to find a Polish voice, or use a better quality voice
    const polishVoice = voices.find((voice) => voice.lang.startsWith("pl"))
    const qualityVoice = voices.find(
      (voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.name.includes("Premium"),
    )

    utterance.voice = polishVoice || qualityVoice || voices[0]
    utterance.rate = rate // Speech rate (0.1 to 10)
    utterance.pitch = pitch // Voice pitch (0 to 2)
    utterance.volume = this.narrationVolume

    window.speechSynthesis.speak(utterance)
  }

  playAmbientMusic() {
    if (this.muted || !this.audioContext) return

    // Create a simple ambient loop
    this.stopMusic()

    const ctx = this.audioContext
    const baseFreq = 130.81 // C3

    const createTone = (freq, duration, delay = 0) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        oscillator.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.type = "sine"
        oscillator.frequency.value = freq
        filter.type = "lowpass"
        filter.frequency.value = 800

        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, ctx.currentTime + 0.5)
        gainNode.gain.setValueAtTime(this.musicVolume * 0.1, ctx.currentTime + duration - 0.5)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + duration)

        this.musicNodes.push({ oscillator, gainNode })
      }, delay)
    }

    // Create ambient chord progression
    const playLoop = () => {
      createTone(baseFreq, 4, 0)
      createTone(baseFreq * 1.2, 4, 0)
      createTone(baseFreq * 1.5, 4, 0)

      this.currentMusic = setTimeout(playLoop, 4000)
    }

    playLoop()
  }

  stopMusic() {
    if (this.currentMusic) {
      clearTimeout(this.currentMusic)
      this.currentMusic = null
    }

    this.musicNodes.forEach(({ oscillator }) => {
      try {
        oscillator.stop()
      } catch (e) {
        // Already stopped
      }
    })
    this.musicNodes = []
  }

  toggleMute() {
    this.muted = !this.muted

    if (this.muted) {
      this.stopMusic()
      // Fix: Check for window.speechSynthesis before cancelling.
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } else {
      this.playAmbientMusic()
    }

    return this.muted
  }
}

// ============================================
// Game Map Class
// ============================================

class GameMap {
  constructor(id, name, bgColor) {
    this.id = id
    this.name = name
    this.bgColor = bgColor
  }
}

// ============================================
// Player Class
// ============================================

// Removed duplicate Player class definition

// ============================================
// NPC Class
// ============================================

// Removed duplicate NPC class definition

// ============================================
// Item Class
// ============================================

// Removed duplicate Item class definition

// ============================================
// Portal Class
// ============================================

// Removed duplicate Portal class definition

// ============================================
// GAME ENGINE - Kroniki Zagiętego Czasu
// ============================================

class Game {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.width = 800
    this.height = 600
    this.tileSize = 32

    this.player = null
    this.currentMap = "school"
    this.maps = {}
    this.npcs = []
    this.items = []
    this.portals = []

    this.inventory = []
    this.quests = []
    this.dialogActive = false
    this.currentDialog = null

    this.keys = {}
    this.lastInteractionTime = 0
    this.lastFootstepTime = 0
    this.footstepInterval = 300 // ms between footsteps

    this.initialized = false

    this.audio = new AudioManager()
  }

  init() {
    // Setup canvas
    this.canvas = document.getElementById("game-canvas")
    this.ctx = this.canvas.getContext("2d")
    this.canvas.width = this.width
    this.canvas.height = this.height

    // Initialize player
    this.player = new Player(400, 300)

    // Initialize maps
    this.initMaps()

    // Initialize NPCs
    this.initNPCs()

    // Initialize quests
    this.initQuests()

    // Initialize items
    this.initItems()

    // Setup event listeners
    this.setupEventListeners()

    this.audio.playAmbientMusic()

    // Show intro cutscene
    this.showIntroCutscene()

    this.initialized = true

    // Start game loop
    this.gameLoop()
  }

  initMaps() {
    // School map
    this.maps.school = {
      name: "Szkoła XIV LO- Korytarz Główny",
      width: 25,
      height: 20,
      tiles: this.generateSchoolMap(),
      bg: "#2c3e50",
    }

    // Ancient times
    this.maps.ancient = {
      name: "Starożytność - Rzymskie Forum",
      width: 25,
      height: 20,
      tiles: this.generateAncientMap(),
      bg: "#d4a574",
    }

    // Medieval
    this.maps.medieval = {
      name: "Średniowiecze - Zamek Królewski",
      width: 25,
      height: 20,
      tiles: this.generateMedievalMap(),
      bg: "#5d4e37",
    }

    // Renaissance
    this.maps.renaissance = {
      name: "Renesans - Pracownia da Vinci",
      width: 25,
      height: 20,
      tiles: this.generateRenaissanceMap(),
      bg: "#8b7355",
    }

    // French Revolution
    this.maps.revolution = {
      name: "Rewolucja Francuska - Paryż",
      width: 25,
      height: 20,
      tiles: this.generateRevolutionMap(),
      bg: "#4a6fa5",
    }
  }

  generateSchoolMap() {
    const tiles = []
    for (let y = 0; y < 20; y++) {
      tiles[y] = []
      for (let x = 0; x < 25; x++) {
        // Borders
        if (y === 0 || y === 19 || x === 0 || x === 24) {
          tiles[y][x] = 1 // Wall
        }
        // Rooms
        else if ((x === 8 || x === 16) && y > 3 && y < 16) {
          tiles[y][x] = 1 // Wall
        }
        // Doors
        else if ((x === 8 || x === 16) && (y === 9 || y === 10)) {
          tiles[y][x] = 3 // Door
        } else {
          tiles[y][x] = 0 // Floor
        }
      }
    }
    return tiles
  }

  generateAncientMap() {
    const tiles = []
    for (let y = 0; y < 20; y++) {
      tiles[y] = []
      for (let x = 0; x < 25; x++) {
        if (y === 0 || y === 19 || x === 0 || x === 24) {
          tiles[y][x] = 1
        } else if ((x % 5 === 0 || y % 5 === 0) && Math.random() > 0.7) {
          tiles[y][x] = 2 // Pillars
        } else {
          tiles[y][x] = 0
        }
      }
    }
    return tiles
  }

  generateMedievalMap() {
    const tiles = []
    for (let y = 0; y < 20; y++) {
      tiles[y] = []
      for (let x = 0; x < 25; x++) {
        if (y === 0 || y === 19 || x === 0 || x === 24) {
          tiles[y][x] = 1
        } else if (x === 12 && (y < 8 || y > 12)) {
          tiles[y][x] = 1
        } else {
          tiles[y][x] = 0
        }
      }
    }
    return tiles
  }

  generateRenaissanceMap() {
    const tiles = []
    for (let y = 0; y < 20; y++) {
      tiles[y] = []
      for (let x = 0; x < 25; x++) {
        if (y === 0 || y === 19 || x === 0 || x === 24) {
          tiles[y][x] = 1
        } else {
          tiles[y][x] = 0
        }
      }
    }
    return tiles
  }

  generateRevolutionMap() {
    const tiles = []
    for (let y = 0; y < 20; y++) {
      tiles[y] = []
      for (let x = 0; x < 25; x++) {
        if (y === 0 || y === 19 || x === 0 || x === 24) {
          tiles[y][x] = 1
        } else if ((x === 6 || x === 18) && y > 5 && y < 14) {
          tiles[y][x] = 1
        } else {
          tiles[y][x] = 0
        }
      }
    }
    return tiles
  }

  initNPCs() {
    this.npcs = [
      // School NPCs
      new NPC("teacher", "Pan Nieradko - Nauczyciel Historii", 150, 150, "school", "🧑‍🏫"),
      new NPC("mieszko", "Mieszko I", 400, 200, "school", "👑"),
      new NPC("napoleon", "Napoleon Bonaparte", 600, 300, "school", "🎩"),

      // Ancient NPCs
      new NPC("julius", "Juliusz Cezar", 400, 300, "ancient", "🏛️"),

      // Medieval NPCs
      new NPC("sobieski", "Jan III Sobieski", 400, 300, "medieval", "⚔️"),

      // Renaissance NPCs
      new NPC("davinci", "Leonardo da Vinci", 400, 300, "renaissance", "🎨"),

      // Revolution NPCs
      new NPC("marie", "Maria Skłodowska-Curie", 400, 300, "revolution", "⚗️"),
    ]

    // Setup NPC dialogs
    this.setupNPCDialogs()

    this.portals = [
      new Portal(700, 500, "school", "ancient", 150, 150), // Safer spawn point
      new Portal(100, 100, "ancient", "school", 700, 500),
      new Portal(100, 500, "school", "medieval", 300, 150), // Adjusted spawn
      new Portal(300, 150, "medieval", "school", 100, 500),
      new Portal(700, 100, "school", "renaissance", 200, 500),
      new Portal(200, 500, "renaissance", "school", 700, 100),
      new Portal(100, 300, "school", "revolution", 650, 300), // Fixed from 50 to 100 (away from wall)
      new Portal(650, 300, "revolution", "school", 100, 300), // Fixed from 700 to 650
    ]
  }

  setupNPCDialogs() {
    const teacher = this.npcs.find((n) => n.id === "teacher")
    teacher.dialogs = [
      {
        text: "O nie! Coś strasznego się stało! Podczas moich eksperymentów z maszyną do podróży w czasie doszło do awarii!",
        next: 1,
      },
      {
        text: "Wszystkie epoki historyczne zmieszały się! Napoleon jest w stołówce, Mieszko I próbuje obsługiwać smartfon, a Leonardo da Vinci zajął salę techniczną!",
        next: 2,
      },
      {
        text: "Musisz mi pomóc naprawić czasoprzestrzeń! Zbierz artefakty z różnych epok i pomóż historycznym postaciom wrócić do swoich czasów.",
        choices: [
          { text: "Pomogę panu!", action: "accept_main_quest" },
          { text: "To brzmi absurdalnie...", action: "skeptical" },
        ],
      },
    ]

    const mieszko = this.npcs.find((n) => n.id === "mieszko")
    mieszko.dialogs = [
      {
        text: "Witaj młody człowieku! Jestem Mieszko I, pierwszy władca Polski. Ten magiczny kryształ w mojej dłoni nie działa!",
        next: 1,
      },
      {
        text: "Sprzedawca powiedział, że to 'pendrive' z pamięcią 64GB. Ale jak tu się zmieści 64 wielkie beczki?!",
        choices: [
          { text: "To nie beczki, to gigabajty...", action: "explain_pendrive" },
          { text: "Może potrzebujesz ochrztu... dla pendrive'a?", action: "funny_baptism" },
        ],
      },
    ]

    const napoleon = this.npcs.find((n) => n.id === "napoleon")
    napoleon.dialogs = [
      {
        text: "Ah, bon! Jestem Napoleon Bonaparte! Postanowiłem zbudować imperium... kanapek!",
        next: 1,
      },
      {
        text: "Sklepik szkolny będzie moją fortecą! Ale potrzebuję składników do mojej genialnej kanapki: szynka, ser, bagietka, i... waterloo sauce!",
        choices: [
          { text: "Pomogę ci znaleźć składniki", action: "accept_napoleon_quest" },
          { text: "Waterloo? Niefortunna nazwa...", action: "waterloo_joke" },
        ],
      },
    ]

    const julius = this.npcs.find((n) => n.id === "julius")
    julius.dialogs = [
      {
        text: "Ave! Jestem Juliusz Cezar, wódz i dyktator Rzymu! Ale coś jest nie tak... gdzie są moje legiony?",
        next: 1,
      },
      {
        text: "Znalazłem się w tej dziwnej epoce. Widzę same cuda techniki! Te 'tablety' to chyba magiczne tabliczki woskowe?",
        next: 2,
      },
      {
        text: "Pomóż mi zrozumieć tę epokę! Może znajdziesz dla mnie informacje o Rzymie? Chcę wiedzieć, czy moje imperium przetrwało!",
        choices: [
          { text: "Opowiem ci o historii Rzymu", action: "accept_julius_quest" },
          { text: "Uważaj na Brutusa!", action: "julius_brutus_joke" },
        ],
      },
    ]

    const davinci = this.npcs.find((n) => n.id === "davinci")
    davinci.dialogs = [
      {
        text: "Buongiorno! Leonardo da Vinci tutaj. Zająłem tę 'salę techniczną' jako moje nowe laboratorium!",
        next: 1,
      },
      {
        text: "Projektuję rewolucyjny wynalazek - LATAJĄCY PLECAK! Potrzebuję: śrubki, taśmy klejącej i baterii.",
        choices: [
          { text: "Znajdę te przedmioty", action: "accept_davinci_quest" },
          { text: "Czy to bezpieczne?", action: "davinci_safety" },
        ],
      },
    ]

    const sobieski = this.npcs.find((n) => n.id === "sobieski")
    sobieski.dialogs = [
      {
        text: "Jestem Jan III Sobieski! Gdzie są tureckie ordy?! Widzę tylko jakieś dziwne 'pokoje' z tablicami!",
        next: 1,
      },
      {
        text: "Muszę wydać rozkaz szarży husarii na ten 'pokój nauczycielski'! Tam znajduje się ich główna kwatera!",
        choices: [
          { text: "To nie jest dobry pomysł...", action: "convince_sobieski" },
          { text: "Może najpierw rekonesans?", action: "sobieski_recon" },
        ],
      },
    ]

    const marie = this.npcs.find((n) => n.id === "marie")
    marie.dialogs = [
      {
        text: "Dzień dobry! Maria Skłodowska-Curie. Znalazłam ciekawe substancje w laboratorium chemicznym.",
        next: 1,
      },
      {
        text: "Myślę, że mogę stworzyć 'power-upy' - substancje zwiększające zdolności! Czy mógłbyś przynieść mi próbki z innych epok?",
        choices: [
          { text: "Oczywiście! Co potrzebujesz?", action: "accept_marie_quest" },
          { text: "Czy to bezpieczne?", action: "marie_safety" },
        ],
      },
    ]
  }

  initQuests() {
    this.quests = [
      {
        id: "main_quest",
        title: "Naprawa Czasoprzestrzeni",
        description:
          "Pomóż Panu Nieradko naprawić czasoprzestrzeń i odesłać wszystkie postacie historyczne do ich epok.",
        objectives: [
          "Porozmawiaj z wszystkimi postaciami historycznymi",
          "Zbierz 5 Artefaktów Temporalnych",
          "Wróć do Pana Nieradko",
        ],
        progress: 0,
        required: 7,
        completed: false,
        active: false,
      },
      {
        id: "mieszko_pendrive",
        title: "Mieszko I i Ochrzczony Pendrive",
        description: "Wyjaśnij Mieszkowi I, jak działa pendrive i pomóż mu zrozumieć współczesną technologię.",
        objectives: [
          "Wyjaśnij Mieszkowi czym jest pendrive",
          "Znajdź instrukcję obsługi",
          "Pokaż mu jak używać komputera",
        ],
        progress: 0,
        required: 3,
        completed: false,
        active: false,
      },
      {
        id: "napoleon_sandwich",
        title: "Napoleon i Imperium Kanapek",
        description:
          "Pomóż Napoleonowi zdobyć składniki do jego imperialnej kanapki, ale nie pozwól mu przejąć sklepiku!",
        objectives: [
          "Znajdź szybkę w stołówce",
          "Zdobądź ser z lodówki",
          "Przynieś bagietkę ze sklepiku",
          "Przekonaj Napoleona do rezygnacji z podboju",
        ],
        progress: 0,
        required: 4,
        completed: false,
        active: false,
      },
      {
        id: "julius_history",
        title: "Juliusz Cezar i Historia Rzymu",
        description: "Pomóż Cezarowi zrozumieć historię Rzymu i jego spadek kulturowy.",
        objectives: [
          "Znajdź książkę o historii Rzymu",
          "Przynieś mapę Imperium Rzymskiego",
          "Wyjaśnij Cezarowi upadek Rzymu",
        ],
        progress: 0,
        required: 3,
        completed: false,
        active: false,
      },
      {
        id: "davinci_backpack",
        title: "Leonardo da Vinci i Latający Plecak",
        description: "Pomóż Leonardowi da Vinci zbudować jego wynalazek - latający plecak.",
        objectives: ["Znajdź śrubki w pracowni", "Zdobądź taśmę klejącą", "Przynieś baterie", "Przetestuj wynalazek"],
        progress: 0,
        required: 4,
        completed: false,
        active: false,
      },
      {
        id: "sobieski_charge",
        title: "Sobieski i Szarża na Nauczycieli",
        description: "Przekonaj Jana III Sobieskiego, że szarża na pokój nauczycielski to zły pomysł.",
        objectives: ["Porozmawiaj z Sobieskim", "Znajdź mapę szkoły", "Wyjaśnij mu sytuację", "Zaproponuj alternatywę"],
        progress: 0,
        required: 4,
        completed: false,
        active: false,
      },
      // Side quests
      {
        id: "marie_powerups",
        title: "Maria i Power-upy",
        description: "Pomóż Marii Skłodowskiej-Curie stworzyć magiczne power-upy.",
        objectives: ["Zbierz próbki z różnych epok"],
        progress: 0,
        required: 5,
        completed: false,
        active: false,
      },
      {
        id: "collect_artifacts",
        title: "Kolekcjoner Artefaktów",
        description: "Znajdź wszystkie Artefakty Temporalne rozproszone po różnych epokach.",
        objectives: ["Znajdź wszystkie artefakty"],
        progress: 0,
        required: 5,
        completed: false,
        active: false,
      },
      {
        id: "explore_all",
        title: "Podróżnik Czasowy",
        description: "Odwiedź wszystkie dostępne epoki historyczne.",
        objectives: ["Odwiedź wszystkie lokacje"],
        progress: 0,
        required: 5,
        completed: false,
        active: false,
      },
      {
        id: "talk_to_everyone",
        title: "Dyplomata",
        description: "Porozmawiaj ze wszystkimi postaciami historycznymi.",
        objectives: ["Porozmawiaj ze wszystkimi NPC"],
        progress: 0,
        required: 7,
        completed: false,
        active: false,
      },
      {
        id: "help_everyone",
        title: "Pomocna Dłoń",
        description: "Pomóż wszystkim postaciom historycznym rozwiązać ich problemy.",
        objectives: ["Ukończ wszystkie główne questy"],
        progress: 0,
        required: 6, // Zwiększono z 5 na 6 (dodano quest Cezara)
        completed: false,
        active: false,
      },
    ]
  }

  initItems() {
    this.items = [
      // Przedmioty dla Mieszko
      new Item("pendrive_manual", "Instrukcja Pendrive", "Podręcznik obsługi urządzeń USB", 250, 200, "school", "📖"),
      new Item(
        "computer_guide",
        "Poradnik Komputerowy",
        "Jak używać komputera dla początkujących",
        320,
        180,
        "school",
        "💻",
      ),

      // Przedmioty dla Napoleona
      new Item("ham", "Szynka", "Świeża szynka dla Napoleona", 300, 400, "school", "🥓"),
      new Item("cheese", "Ser", "Pyszny ser francuski", 180, 350, "school", "🧀"),
      new Item("baguette", "Bagietka", "Chrupiąca francuska bagietka", 450, 450, "school", "🥖"),
      new Item("waterloo_sauce", "Sos Waterloo", "Specjalny sos do kanapek", 520, 380, "school", "🍶"),

      // Przedmioty dla Juliusza Cezara
      new Item("rome_book", "Książka o Rzymie", "Historia Imperium Rzymskiego", 250, 450, "ancient", "📚"),
      new Item("rome_map", "Mapa Imperium", "Mapa terytoriów Rzymu", 550, 250, "ancient", "🗺️"),

      // Przedmioty dla Leonardo da Vinci
      new Item("screws", "Śrubki", "Zestaw małych śrubek", 200, 250, "renaissance", "🔩"),
      new Item("tape", "Taśma Klejąca", "Uniwersalna taśma klejąca", 350, 280, "renaissance", "📦"),
      new Item("batteries", "Baterie", "Baterie AA, 4 sztuki", 500, 320, "renaissance", "🔋"),
      new Item("blueprint", "Schemat Wynalazku", "Plany latającego plecaka", 600, 200, "renaissance", "📐"),

      // Przedmioty dla Sobieskiego
      new Item("school_map", "Mapa Szkoły", "Szczegółowa mapa budynku", 150, 450, "medieval", "🗺️"),
      new Item("peace_treaty", "Traktat Pokojowy", "Dokument pokoju", 450, 350, "medieval", "📜"),

      // Artefakty Temporalne
      new Item("artifact1", "Artefakt Temporalny I", "Starożytny mechanizm czasowy", 650, 450, "ancient", "⏰"),
      new Item("artifact2", "Artefakt Temporalny II", "Średniowieczny klepsydra", 600, 500, "medieval", "⏳"),
      new Item("artifact3", "Artefakt Temporalny III", "Renesansowy chronometer", 150, 520, "renaissance", "⏱️"),
      new Item("artifact4", "Artefakt Temporalny IV", "Rewolucyjny zegar", 200, 150, "revolution", "🕰️"),
      new Item("artifact5", "Artefakt Temporalny V", "Współczesny stoper", 550, 250, "school", "⌚"),

      // Próbki dla Marii Skłodowskiej-Curie
      new Item("sample1", "Próbka Starożytna", "Substancja z epoki starożytnej", 200, 300, "ancient", "🧪"),
      new Item("sample2", "Próbka Średniowieczna", "Substancja z epoki średniowiecza", 500, 200, "medieval", "🧪"),
      new Item("sample3", "Próbka Renesansowa", "Substancja z epoki renesansu", 400, 450, "renaissance", "🧪"),
      new Item("sample4", "Próbka Rewolucyjna", "Substancja z epoki rewolucji", 250, 300, "revolution", "🧪"),
      new Item("sample5", "Próbka Współczesna", "Substancja z epoki współczesnej", 680, 450, "school", "🧪"),
    ]
  }

  setupEventListeners() {
    // Keyboard
    document.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true

      // Interaction
      if ((e.key === "e" || e.key === "Enter") && !this.dialogActive) {
        this.handleInteraction()
      }

      // Dialog continue
      if (e.key === "Enter" && this.dialogActive && this.currentDialog) {
        this.continueDialog()
      }

      // Inventory
      if (e.key === "i" || e.key === "I") {
        this.toggleInventory()
      }

      // Quests
      if (e.key === "q" || e.key === "Q") {
        this.toggleQuests()
      }

      // Close panels
      if (e.key === "Escape") {
        this.closeAllPanels()
      }

      if (e.key === "m" || e.key === "M") {
        const muted = this.audio.toggleMute()
        const icon = document.getElementById("audio-icon")
        icon.textContent = muted ? "🔇" : "🔊"
      }
    })

    document.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false
    })

    // UI buttons
    document.getElementById("close-inventory").addEventListener("click", () => {
      this.toggleInventory()
    })

    document.getElementById("close-quests").addEventListener("click", () => {
      this.toggleQuests()
    })
  }

  handleInteraction() {
    const now = Date.now()
    if (now - this.lastInteractionTime < 500) return
    this.lastInteractionTime = now

    // Check for NPCs
    const nearbyNPC = this.npcs.find((npc) => {
      if (npc.map !== this.currentMap) return false
      const dist = Math.hypot(npc.x - this.player.x, npc.y - this.player.y)
      return dist < 60
    })

    if (nearbyNPC) {
      this.startDialog(nearbyNPC)
      return
    }

    // Check for items
    const nearbyItem = this.items.find((item) => {
      if (item.map !== this.currentMap || item.collected) return false
      const dist = Math.hypot(item.x - this.player.x, item.y - this.player.y)
      return dist < 50
    })

    if (nearbyItem) {
      this.collectItem(nearbyItem)
      return
    }

    // Check for portals
    const nearbyPortal = this.portals.find((portal) => {
      if (portal.fromMap !== this.currentMap) return false
      const dist = Math.hypot(portal.x - this.player.x, portal.y - this.player.y)
      return dist < 50
    })

    if (nearbyPortal) {
      this.usePortal(nearbyPortal)
      return
    }
  }

  startDialog(npc) {
    this.dialogActive = true
    this.currentDialog = {
      npc: npc,
      dialogIndex: 0,
    }

    this.showDialog()
  }

  showDialog() {
    const dialogBox = document.getElementById("dialog-box")
    const portrait = document.getElementById("dialog-portrait")
    const name = document.getElementById("dialog-name")
    const text = document.getElementById("dialog-text")
    const choices = document.getElementById("dialog-choices")
    const continueBtn = document.getElementById("dialog-continue")

    const npc = this.currentDialog.npc
    const dialogData = npc.dialogs[this.currentDialog.dialogIndex]

    // Show dialog box
    dialogBox.classList.remove("hidden")

    // Portrait
    portrait.innerHTML = `<div style="font-size: 80px; display: flex; align-items: center; justify-content: center; height: 100%;">${npc.icon}</div>`

    // Name
    name.textContent = npc.name

    // Text with typing effect
    text.textContent = ""
    let charIndex = 0
    const typeInterval = setInterval(() => {
      if (charIndex < dialogData.text.length) {
        text.textContent += dialogData.text[charIndex]
        charIndex++
      } else {
        clearInterval(typeInterval)
        this.audio.speakNarration(dialogData.text, 0.95, 1.1)
      }
    }, 30)

    // Choices
    choices.innerHTML = ""
    if (dialogData.choices) {
      continueBtn.classList.add("hidden")
      dialogData.choices.forEach((choice) => {
        const btn = document.createElement("button")
        btn.className = "dialog-choice"
        btn.textContent = choice.text
        btn.addEventListener("click", () => {
          this.handleDialogChoice(choice.action)
        })
        choices.appendChild(btn)
      })
    } else {
      continueBtn.classList.remove("hidden")
    }
  }

  continueDialog() {
    const npc = this.currentDialog.npc
    const dialogData = npc.dialogs[this.currentDialog.dialogIndex]

    if (dialogData.next !== undefined) {
      this.currentDialog.dialogIndex = dialogData.next
      this.showDialog()
    } else {
      this.closeDialog()
    }
  }

  handleDialogChoice(action) {
    switch (action) {
      case "accept_main_quest":
        this.activateQuest("main_quest")
        this.showNotification("Quest rozpoczęty: Naprawa Czasoprzestrzeni")
        break
      case "skeptical":
        this.activateQuest("main_quest")
        this.showNotification("Czasem rzeczywistość jest dziwniejsza niż fikcja...")
        break
      case "accept_napoleon_quest":
        this.activateQuest("napoleon_sandwich")
        this.showNotification("Quest rozpoczęty: Napoleon i Imperium Kanapek")
        break
      case "waterloo_joke":
        this.showNotification("Napoleon nie wygląda na zadowolonego z tego żartu...")
        this.activateQuest("napoleon_sandwich")
        break
      case "accept_davinci_quest":
        this.activateQuest("davinci_backpack")
        this.showNotification("Quest rozpoczęty: Leonardo da Vinci i Latający Plecak")
        break
      case "davinci_safety":
        this.showNotification("Leonardo zapewnia, że wszystko jest pod kontrolą!")
        this.activateQuest("davinci_backpack")
        break
      case "accept_marie_quest":
        this.activateQuest("marie_powerups")
        this.showNotification("Quest rozpoczęty: Maria i Power-upy")
        break
      case "marie_safety":
        this.showNotification("Maria Skłodowska-Curie wie, co robi!")
        this.activateQuest("marie_powerups")
        break
      case "explain_pendrive":
        this.activateQuest("mieszko_pendrive")
        this.showNotification("Quest rozpoczęty: Mieszko I i Ochrzczony Pendrive")
        break
      case "funny_baptism":
        this.showNotification("Mieszko zastanawia się nad tą propozycją...")
        this.activateQuest("mieszko_pendrive")
        break
      case "convince_sobieski":
        this.activateQuest("sobieski_charge")
        this.showNotification("Quest rozpoczęty: Sobieski i Szarża na Nauczycieli")
        break
      case "sobieski_recon":
        this.showNotification("Sobieski docenia strategiczne podejście!")
        this.activateQuest("sobieski_charge")
        break
      case "accept_julius_quest":
        this.activateQuest("julius_history")
        this.showNotification("Quest rozpoczęty: Juliusz Cezar i Historia Rzymu")
        break
      case "julius_brutus_joke":
        this.showNotification("Et tu, Brute? Cezar nie ceni sobie tego żartu...")
        this.activateQuest("julius_history")
        break
    }

    this.closeDialog()
  }

  closeDialog() {
    this.dialogActive = false
    this.currentDialog = null
    document.getElementById("dialog-box").classList.add("hidden")
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  collectItem(item) {
    item.collected = true
    this.inventory.push(item)
    this.showNotification(`Zdobyto: ${item.name}!`)
    this.audio.playItemPickup()
    this.updateHUD()

    // Check quest progress
    this.checkQuestItems(item)
  }

  checkQuestItems(item) {
    // Napoleon quest
    if (["ham", "cheese", "baguette", "waterloo_sauce"].includes(item.id)) {
      this.updateQuestProgress("napoleon_sandwich", 1)
    }

    // Da Vinci quest
    if (["screws", "tape", "batteries", "blueprint"].includes(item.id)) {
      this.updateQuestProgress("davinci_backpack", 1)
    }

    // Mieszko quest
    if (["pendrive_manual", "computer_guide"].includes(item.id)) {
      this.updateQuestProgress("mieszko_pendrive", 1)
    }

    // Sobieski quest
    if (["school_map", "peace_treaty"].includes(item.id)) {
      this.updateQuestProgress("sobieski_charge", 1)
    }

    // Julius Caesar quest
    if (["rome_book", "rome_map"].includes(item.id)) {
      this.updateQuestProgress("julius_history", 1)
    }

    // Artifact collection
    if (item.id.startsWith("artifact")) {
      this.updateQuestProgress("collect_artifacts", 1)
      this.updateQuestProgress("main_quest", 1)
    }

    // Sample collection for Marie
    if (item.id.startsWith("sample")) {
      this.updateQuestProgress("marie_powerups", 1)
    }
  }

  usePortal(portal) {
    this.currentMap = portal.toMap
    this.player.x = portal.toX
    this.player.y = portal.toY
    this.updateHUD()
    this.showNotification(`Przeniesiono do: ${this.maps[this.currentMap].name}`)
    this.audio.playPortalSound()

    // Update exploration quest
    const exploreQuest = this.quests.find((q) => q.id === "explore_all")
    if (exploreQuest && !portal.visited) {
      portal.visited = true
      this.updateQuestProgress("explore_all", 1)
    }
  }

  activateQuest(questId) {
    const quest = this.quests.find((q) => q.id === questId)
    if (quest && !quest.active) {
      quest.active = true
      this.updateHUD()
    }
  }

  updateQuestProgress(questId, amount) {
    const quest = this.quests.find((q) => q.id === questId)
    if (quest && !quest.completed) {
      quest.progress += amount
      if (quest.progress >= quest.required) {
        quest.completed = true
        quest.active = false
        this.showNotification(`✅ Quest ukończony: ${quest.title}!`)
        this.audio.playQuestComplete()

        // Check help everyone quest
        const mainQuests = [
          "napoleon_sandwich",
          "davinci_backpack",
          "mieszko_pendrive",
          "sobieski_charge",
          "marie_powerups",
          "julius_history", // Dodano quest Cezara do listy głównych questów
        ]
        const completedMain = mainQuests.filter((id) => {
          const q = this.quests.find((quest) => quest.id === id)
          return q && q.completed
        }).length

        const helpQuest = this.quests.find((q) => q.id === "help_everyone")
        if (helpQuest) {
          helpQuest.progress = completedMain
          if (completedMain >= helpQuest.required) {
            helpQuest.completed = true
            this.showNotification("🎉 Pomogłeś wszystkim! Jesteś prawdziwym bohaterem!")
          }
        }

        // Check if main quest complete
        if (questId === "main_quest") {
          this.showEndingCutscene()
        }
      }
      this.updateHUD()
    }
  }

  toggleInventory() {
    const panel = document.getElementById("inventory-panel")
    const isHidden = panel.classList.contains("hidden")

    if (isHidden) {
      this.renderInventory()
      panel.classList.remove("hidden")
    } else {
      panel.classList.add("hidden")
    }
  }

  renderInventory() {
    const grid = document.getElementById("inventory-grid")
    grid.innerHTML = ""

    if (this.inventory.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.7;">Inwentarz jest pusty</p>'
      return
    }

    this.inventory.forEach((item) => {
      const itemDiv = document.createElement("div")
      itemDiv.className = "inventory-item"
      itemDiv.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
            `
      grid.appendChild(itemDiv)
    })
  }

  toggleQuests() {
    const panel = document.getElementById("quest-panel")
    const isHidden = panel.classList.contains("hidden")

    if (isHidden) {
      this.renderQuests()
      panel.classList.remove("hidden")
    } else {
      panel.classList.add("hidden")
    }
  }

  renderQuests() {
    const list = document.getElementById("quest-list")
    list.innerHTML = ""

    const activeQuests = this.quests.filter((q) => q.active || q.completed)

    if (activeQuests.length === 0) {
      list.innerHTML = '<p style="text-align: center; opacity: 0.7;">Brak aktywnych questów</p>'
      return
    }

    activeQuests.forEach((quest) => {
      const questDiv = document.createElement("div")
      questDiv.className = `quest-item ${quest.completed ? "completed" : ""}`
      questDiv.innerHTML = `
                <div class="quest-title">${quest.title}</div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress">
                    <span>Postęp: ${quest.progress}/${quest.required}</span>
                    <span class="quest-status ${quest.completed ? "completed" : "active"}">
                        ${quest.completed ? "Ukończony" : "Aktywny"}
                    </span>
                </div>
            `
      list.appendChild(questDiv)
    })
  }

  closeAllPanels() {
    document.getElementById("inventory-panel").classList.add("hidden")
    document.getElementById("quest-panel").classList.add("hidden")
    if (this.dialogActive) {
      this.closeDialog()
    }
  }

  showNotification(message) {
    const notification = document.getElementById("notification")
    notification.textContent = message
    notification.classList.remove("hidden")
    this.audio.playNotification()

    setTimeout(() => {
      notification.classList.add("hidden")
    }, 3000)
  }

  updateHUD() {
    document.getElementById("current-location").textContent = this.maps[this.currentMap].name
    document.getElementById("active-quests-count").textContent = this.quests.filter((q) => q.active).length
    document.getElementById("inventory-count").textContent = this.inventory.length
  }

  showIntroCutscene() {
    const cutscene = document.getElementById("cutscene")
    const text = document.getElementById("cutscene-text")

    const scenes = [
      "Zwykły dzień w szkole...",
      "Lekcja historii u Pana Nieradko...",
      "BZZZZT! 💥",
      "Nagle wszystko się zmienia!",
      "Czasoprzestrzeń się zagina!",
      "Postacie historyczne pojawiają się w szkole!",
      "Tylko TY możesz to naprawić!",
      "Rozpoczyna się Twoja przygoda...",
    ]

    let sceneIndex = 0

    const showScene = () => {
      if (sceneIndex < scenes.length) {
        text.textContent = scenes[sceneIndex]
        this.audio.speakNarration(scenes[sceneIndex], 1.0, 1.2)
        sceneIndex++
        setTimeout(showScene, 2000)
      } else {
        cutscene.classList.add("hidden")
      }
    }

    cutscene.classList.remove("hidden")
    showScene()

    document.getElementById("skip-cutscene").addEventListener("click", () => {
      cutscene.classList.add("hidden")
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    })
  }

  showEndingCutscene() {
    const cutscene = document.getElementById("cutscene")
    const text = document.getElementById("cutscene-text")

    const scenes = [
      "Gratulacje! 🎉",
      "Pomogłeś wszystkim postaciom historycznym!",
      "Napoleon ma swoje kanapki 🥪",
      "Leonardo skonstruował latający plecak 🎒",
      "Mieszko I rozumie już technologię 📱",
      "Sobieski zrezygnował z szarży na nauczycieli ⚔️",
      "Maria stworzyła power-upy ⚗️",
      "Czasoprzestrzeń została naprawiona! ⏰",
      "Jesteś bohaterem szkoły!",
      "DZIĘKUJEMY ZA GRĘ! 🎮",
    ]

    let sceneIndex = 0

    const showScene = () => {
      if (sceneIndex < scenes.length) {
        text.textContent = scenes[sceneIndex]
        this.audio.speakNarration(scenes[sceneIndex], 1.0, 1.2)
        sceneIndex++
        setTimeout(showScene, 2500)
      } else {
        setTimeout(() => {
          cutscene.classList.add("hidden")
        }, 2000)
      }
    }

    cutscene.classList.remove("hidden")
    showScene()
  }

  update() {
    if (this.dialogActive) return

    // Player movement
    let dx = 0
    let dy = 0

    if (this.keys["w"] || this.keys["arrowup"]) dy -= 1
    if (this.keys["s"] || this.keys["arrowdown"]) dy += 1
    if (this.keys["a"] || this.keys["arrowleft"]) dx -= 1
    if (this.keys["d"] || this.keys["arrowright"]) dx += 1

    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal movement
      const length = Math.sqrt(dx * dx + dy * dy)
      dx /= length
      dy /= length

      const newX = this.player.x + dx * this.player.speed
      const newY = this.player.y + dy * this.player.speed

      // Collision detection
      if (!this.checkCollision(newX, newY)) {
        this.player.x = newX
        this.player.y = newY
        this.player.moving = true

        const now = Date.now()
        if (now - this.lastFootstepTime > this.footstepInterval) {
          this.audio.playFootstep()
          this.lastFootstepTime = now
        }

        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.player.direction = dx > 0 ? "right" : "left"
        } else {
          this.player.direction = dy > 0 ? "down" : "up"
        }
      }
    } else {
      this.player.moving = false
    }

    // Check for nearby interactables
    this.checkInteractables()

    // Update quest for talking to everyone
    const talkQuest = this.quests.find((q) => q.id === "talk_to_everyone")
    if (talkQuest) {
      this.npcs.forEach((npc) => {
        if (npc.map === this.currentMap && !npc.talkedTo) {
          npc.talkedTo = true
          this.updateQuestProgress("talk_to_everyone", 1)
        }
      })
    }
  }

  checkCollision(x, y) {
    const map = this.maps[this.currentMap]
    const tileX = Math.floor(x / this.tileSize)
    const tileY = Math.floor(y / this.tileSize)

    // Check boundaries
    if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
      return true
    }

    // Check tile collision
    const tile = map.tiles[tileY][tileX]
    return tile === 1 || tile === 2 // Wall or pillar
  }

  checkInteractables() {
    let hasNearby = false

    // Check NPCs
    const nearbyNPC = this.npcs.find((npc) => {
      if (npc.map !== this.currentMap) return false
      const dist = Math.hypot(npc.x - this.player.x, npc.y - this.player.y)
      return dist < 60
    })

    // Check items
    const nearbyItem = this.items.find((item) => {
      if (item.map !== this.currentMap || item.collected) return false
      const dist = Math.hypot(item.x - this.player.x, item.y - this.player.y)
      return dist < 50
    })

    // Check portals
    const nearbyPortal = this.portals.find((portal) => {
      if (portal.fromMap !== this.currentMap) return false
      const dist = Math.hypot(portal.x - this.player.x, portal.y - this.player.y)
      return dist < 50
    })

    hasNearby = nearbyNPC || nearbyItem || nearbyPortal

    const prompt = document.getElementById("interaction-prompt")
    if (hasNearby) {
      prompt.classList.remove("hidden")
    } else {
      prompt.classList.add("hidden")
    }
  }

  render() {
    const map = this.maps[this.currentMap]

    // Clear canvas
    this.ctx.fillStyle = map.bg
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Calculate camera offset to center on player
    const offsetX = this.width / 2 - this.player.x
    const offsetY = this.height / 2 - this.player.y

    this.ctx.save()
    this.ctx.translate(offsetX, offsetY)

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x]
        const px = x * this.tileSize
        const py = y * this.tileSize

        switch (tile) {
          case 0: // Floor
            // Add subtle pattern to floor
            this.ctx.fillStyle = "#34495e"
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize)
            this.ctx.strokeStyle = "#2c3e50"
            this.ctx.lineWidth = 1
            this.ctx.strokeRect(px, py, this.tileSize, this.tileSize)
            // Add tile pattern
            this.ctx.fillStyle = "rgba(52, 73, 94, 0.5)"
            this.ctx.fillRect(px + 2, py + 2, 2, 2)
            break
          case 1: // Wall
            // Enhanced wall with depth
            this.ctx.fillStyle = "#7f8c8d"
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize)
            this.ctx.fillStyle = "#95a5a6"
            this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4)
            this.ctx.fillStyle = "#bdc3c7"
            this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8)
            break
          case 2: // Pillar
            this.ctx.fillStyle = "#34495e"
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize)
            // Enhanced pillar design
            this.ctx.fillStyle = "#c0392b"
            this.ctx.fillRect(px + 8, py + 4, this.tileSize - 16, this.tileSize - 8)
            this.ctx.fillStyle = "#e74c3c"
            this.ctx.fillRect(px + 10, py + 6, this.tileSize - 20, this.tileSize - 12)
            break
          case 3: // Door
            this.ctx.fillStyle = "#8b4513"
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize)
            this.ctx.fillStyle = "#a0522d"
            this.ctx.fillRect(px + 4, py + 4, this.tileSize - 8, this.tileSize - 8)
            // Door handle
            this.ctx.fillStyle = "#f39c12"
            this.ctx.fillRect(px + 8, py + this.tileSize / 2, 4, 4)
            break
        }
      }
    }

    this.portals.forEach((portal) => {
      if (portal.fromMap === this.currentMap) {
        // Outer glow
        const gradient = this.ctx.createRadialGradient(portal.x, portal.y, 0, portal.x, portal.y, 30)
        gradient.addColorStop(0, "rgba(155, 89, 182, 0.8)")
        gradient.addColorStop(0.5, "rgba(155, 89, 182, 0.4)")
        gradient.addColorStop(1, "rgba(155, 89, 182, 0)")
        this.ctx.fillStyle = gradient
        this.ctx.beginPath()
        this.ctx.arc(portal.x, portal.y, 30, 0, Math.PI * 2)
        this.ctx.fill()

        // Middle ring with animation
        const pulseSize = 20 + Math.sin(Date.now() / 200) * 3
        this.ctx.fillStyle = "rgba(142, 68, 173, 0.8)"
        this.ctx.beginPath()
        this.ctx.arc(portal.x, portal.y, pulseSize, 0, Math.PI * 2)
        this.ctx.fill()

        // Inner core
        this.ctx.fillStyle = "rgba(155, 89, 182, 1)"
        this.ctx.beginPath()
        this.ctx.arc(portal.x, portal.y, 10, 0, Math.PI * 2)
        this.ctx.fill()

        // Portal icon
        this.ctx.fillStyle = "#fff"
        this.ctx.font = "24px Arial"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText("🌀", portal.x, portal.y)
      }
    })

    this.items.forEach((item) => {
      if (item.map === this.currentMap && !item.collected) {
        // Floating animation
        const float = Math.sin(Date.now() / 300) * 5
        const rotation = Date.now() / 1000

        // Glow effect
        const gradient = this.ctx.createRadialGradient(item.x, item.y + float, 0, item.x, item.y + float, 25)
        gradient.addColorStop(0, "rgba(241, 196, 15, 0.6)")
        gradient.addColorStop(1, "rgba(241, 196, 15, 0)")
        this.ctx.fillStyle = gradient
        this.ctx.beginPath()
        this.ctx.arc(item.x, item.y + float, 25, 0, Math.PI * 2)
        this.ctx.fill()

        // Sparkles
        for (let i = 0; i < 3; i++) {
          const angle = rotation + (i * Math.PI * 2) / 3
          const sparkleX = item.x + Math.cos(angle) * 20
          const sparkleY = item.y + float + Math.sin(angle) * 20
          this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          this.ctx.beginPath()
          this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
          this.ctx.fill()
        }

        // Item icon
        this.ctx.font = "28px Arial"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillStyle = "#fff"
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
        this.ctx.shadowBlur = 4
        this.ctx.fillText(item.icon, item.x, item.y + float)
        this.ctx.shadowBlur = 0
      }
    })

    this.npcs.forEach((npc) => {
      if (npc.map === this.currentMap) {
        // Shadow
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        this.ctx.beginPath()
        this.ctx.ellipse(npc.x, npc.y + 28, 18, 6, 0, 0, Math.PI * 2)
        this.ctx.fill()

        // Body with gradient
        const bodyGradient = this.ctx.createLinearGradient(npc.x - 15, npc.y - 15, npc.x + 15, npc.y + 20)
        bodyGradient.addColorStop(0, "#3498db")
        bodyGradient.addColorStop(1, "#2980b9")
        this.ctx.fillStyle = bodyGradient
        this.ctx.fillRect(npc.x - 15, npc.y - 10, 30, 35)
        this.ctx.strokeStyle = "#2c3e50"
        this.ctx.lineWidth = 2
        this.ctx.strokeRect(npc.x - 15, npc.y - 10, 30, 35)

        // Head with gradient
        const headGradient = this.ctx.createRadialGradient(npc.x - 5, npc.y - 25, 0, npc.x, npc.y - 20, 18)
        headGradient.addColorStop(0, "#f39c12")
        headGradient.addColorStop(1, "#e67e22")
        this.ctx.fillStyle = headGradient
        this.ctx.beginPath()
        this.ctx.arc(npc.x, npc.y - 20, 18, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.strokeStyle = "#2c3e50"
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Icon
        this.ctx.font = "24px Arial"
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(npc.icon, npc.x, npc.y - 20)

        // Name with background
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        this.ctx.fillRect(npc.x - 40, npc.y + 30, 80, 16)
        this.ctx.fillStyle = "#fff"
        this.ctx.font = "bold 11px Arial"
        this.ctx.fillText(npc.name.split(" ")[0], npc.x, npc.y + 38)
      }
    })

    // Draw player
    this.player.render(this.ctx)

    this.ctx.restore()
  }

  gameLoop() {
    this.update()
    this.render()
    requestAnimationFrame(() => this.gameLoop())
  }
}

// Player class
class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.speed = 3
    this.direction = "down"
    this.moving = false
    this.animFrame = 0
  }

  render(ctx) {
    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
    ctx.beginPath()
    ctx.ellipse(this.x, this.y + 24, 15, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    const bodyGradient = ctx.createLinearGradient(this.x - 12, this.y - 8, this.x + 12, this.y + 20)
    bodyGradient.addColorStop(0, "#e74c3c")
    bodyGradient.addColorStop(1, "#c0392b")
    ctx.fillStyle = bodyGradient
    ctx.fillRect(this.x - 12, this.y - 5, 24, 28)
    ctx.strokeStyle = "#2c3e50"
    ctx.lineWidth = 2
    ctx.strokeRect(this.x - 12, this.y - 5, 24, 28)

    // Head with gradient
    const headGradient = ctx.createRadialGradient(this.x - 3, this.y - 18, 0, this.x, this.y - 15, 15)
    headGradient.addColorStop(0, "#f39c12")
    headGradient.addColorStop(1, "#e67e22")
    ctx.fillStyle = headGradient
    ctx.beginPath()
    ctx.arc(this.x, this.y - 15, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#2c3e50"
    ctx.lineWidth = 2
    ctx.stroke()

    // Face
    ctx.fillStyle = "#000"
    ctx.fillRect(this.x - 5, this.y - 18, 3, 3)
    ctx.fillRect(this.x + 2, this.y - 18, 3, 3)

    // Smile
    ctx.beginPath()
    ctx.arc(this.x, this.y - 12, 6, 0, Math.PI, false)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.stroke()

    // Movement animation
    if (this.moving) {
      this.animFrame = (this.animFrame + 0.2) % (Math.PI * 2)
      const legOffset = Math.sin(this.animFrame) * 4

      // Legs with gradient
      const legGradient = ctx.createLinearGradient(this.x - 12, this.y + 18, this.x - 4, this.y + 28)
      legGradient.addColorStop(0, "#c0392b")
      legGradient.addColorStop(1, "#a93226")
      ctx.fillStyle = legGradient
      ctx.fillRect(this.x - 12, this.y + 18 + legOffset, 8, 10)

      const legGradient2 = ctx.createLinearGradient(this.x + 4, this.y + 18, this.x + 12, this.y + 28)
      legGradient2.addColorStop(0, "#c0392b")
      legGradient2.addColorStop(1, "#a93226")
      ctx.fillStyle = legGradient2
      ctx.fillRect(this.x + 4, this.y + 18 - legOffset, 8, 10)
    } else {
      ctx.fillStyle = "#c0392b"
      ctx.fillRect(this.x - 12, this.y + 18, 8, 10)
      ctx.fillRect(this.x + 4, this.y + 18, 8, 10)
    }
  }
}

// NPC class
class NPC {
  constructor(id, name, x, y, map, icon) {
    this.id = id
    this.name = name
    this.x = x
    this.y = y
    this.map = map
    this.icon = icon
    this.dialogs = []
    this.talkedTo = false
  }
}

// Item class
class Item {
  constructor(id, name, description, x, y, map, icon) {
    this.id = id
    this.name = name
    this.description = description
    this.x = x
    this.y = y
    this.map = map
    this.icon = icon
    this.collected = false
  }
}

// Portal class
class Portal {
  constructor(x, y, fromMap, toMap, toX, toY) {
    this.x = x
    this.y = y
    this.fromMap = fromMap
    this.toMap = toMap
    this.toX = toX
    this.toY = toY
    this.visited = false
  }
}

// ============================================
// UI CONTROL
// ============================================

const game = new Game()

document.getElementById("start-game").addEventListener("click", () => {
  document.getElementById("title-screen").classList.remove("active")
  document.getElementById("game-screen").classList.add("active")

  if (!game.initialized) {
    game.init()
  }
})

document.getElementById("show-controls").addEventListener("click", () => {
  document.getElementById("title-screen").classList.remove("active")
  document.getElementById("controls-screen").classList.add("active")
})

document.getElementById("back-to-title").addEventListener("click", () => {
  document.getElementById("controls-screen").classList.remove("active")
  document.getElementById("title-screen").classList.add("active")
})
