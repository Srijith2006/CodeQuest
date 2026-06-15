// ── Translation dictionary ────────────────────────────────────────────────────
// Covers the 6 languages required by spec: English, Spanish, Hindi,
// Portuguese, Chinese, French.
//
// Usage: const { t } = useTranslation();  <button>{t("nav.home")}</button>

export type LanguageCode = "en" | "es" | "hi" | "pt" | "zh" | "fr";

export const LANGUAGES: { code: LanguageCode; label: string; flag: string; otpMethod: "email" | "mobile" }[] = [
  { code: "en", label: "English",   flag: "🇺🇸", otpMethod: "mobile" },
  { code: "es", label: "Español",   flag: "🇪🇸", otpMethod: "mobile" },
  { code: "hi", label: "हिन्दी",     flag: "🇮🇳", otpMethod: "mobile" },
  { code: "pt", label: "Português", flag: "🇧🇷", otpMethod: "mobile" },
  { code: "zh", label: "中文",       flag: "🇨🇳", otpMethod: "mobile" },
  { code: "fr", label: "Français",  flag: "🇫🇷", otpMethod: "email" }, // French → email OTP per spec
];

type Dict = Record<string, Record<LanguageCode, string>>;

export const translations: Dict = {
  // ── Navbar ──────────────────────────────────────────────────────────────────
  "nav.home":           { en: "Home",           es: "Inicio",        hi: "होम",            pt: "Início",       zh: "首页",     fr: "Accueil" },
  "nav.questions":      { en: "Questions",      es: "Preguntas",     hi: "प्रश्न",          pt: "Perguntas",    zh: "问题",     fr: "Questions" },
  "nav.aiAssist":       { en: "AI Assist",      es: "Asistente IA",  hi: "एआई सहायक",      pt: "Assistente IA",zh: "AI助手",   fr: "Assistant IA" },
  "nav.tags":           { en: "Tags",           es: "Etiquetas",     hi: "टैग",            pt: "Tags",         zh: "标签",     fr: "Étiquettes" },
  "nav.users":          { en: "Users",          es: "Usuarios",      hi: "उपयोगकर्ता",      pt: "Usuários",     zh: "用户",     fr: "Utilisateurs" },
  "nav.socialSpace":    { en: "Social Space",   es: "Espacio Social",hi: "सोशल स्पेस",       pt: "Espaço Social",zh: "社交空间", fr: "Espace Social" },
  "nav.friends":        { en: "Friends",        es: "Amigos",        hi: "मित्र",           pt: "Amigos",       zh: "好友",     fr: "Amis" },
  "nav.subscription":   { en: "Subscription",   es: "Suscripción",   hi: "सदस्यता",         pt: "Assinatura",   zh: "订阅",     fr: "Abonnement" },
  "nav.rewards":        { en: "Rewards",        es: "Recompensas",   hi: "पुरस्कार",        pt: "Recompensas",  zh: "奖励",     fr: "Récompenses" },
  "nav.language":       { en: "Language",       es: "Idioma",        hi: "भाषा",            pt: "Idioma",       zh: "语言",     fr: "Langue" },
  "nav.loginHistory":   { en: "Login History",  es: "Historial",     hi: "लॉगिन इतिहास",     pt: "Histórico",    zh: "登录历史", fr: "Historique" },
  "nav.saves":          { en: "Saves",          es: "Guardados",     hi: "सहेजे गए",        pt: "Salvos",       zh: "收藏",     fr: "Enregistrés" },
  "nav.challenges":     { en: "Challenges",     es: "Desafíos",      hi: "चुनौतियाँ",       pt: "Desafios",     zh: "挑战",     fr: "Défis" },
  "nav.chat":           { en: "Chat",           es: "Chat",          hi: "चैट",             pt: "Chat",         zh: "聊天",     fr: "Discussion" },
  "nav.articles":       { en: "Articles",       es: "Artículos",     hi: "लेख",             pt: "Artigos",      zh: "文章",     fr: "Articles" },
  "nav.companies":      { en: "Companies",      es: "Empresas",      hi: "कंपनियाँ",        pt: "Empresas",     zh: "公司",     fr: "Entreprises" },
  "nav.about":          { en: "About",          es: "Acerca de",     hi: "परिचय",           pt: "Sobre",        zh: "关于",     fr: "À propos" },
  "nav.products":       { en: "Products",       es: "Productos",     hi: "उत्पाद",          pt: "Produtos",     zh: "产品",     fr: "Produits" },
  "nav.forTeams":       { en: "For Teams",      es: "Para Equipos",  hi: "टीमों के लिए",     pt: "Para Equipes", zh: "团队版",   fr: "Pour les équipes" },
  "nav.login":          { en: "Log in",         es: "Iniciar sesión",hi: "लॉगिन",           pt: "Entrar",       zh: "登录",     fr: "Connexion" },
  "nav.signup":         { en: "Sign up",        es: "Registrarse",   hi: "साइन अप",          pt: "Cadastrar",    zh: "注册",     fr: "S'inscrire" },
  "nav.logout":         { en: "Log out",        es: "Cerrar sesión", hi: "लॉगआउट",          pt: "Sair",         zh: "登出",     fr: "Déconnexion" },
  "nav.searchPlaceholder": { en: "Search questions, tags, users…", es: "Buscar preguntas, etiquetas, usuarios…", hi: "प्रश्न, टैग, उपयोगकर्ता खोजें…", pt: "Pesquisar perguntas, tags, usuários…", zh: "搜索问题、标签、用户…", fr: "Rechercher questions, tags, utilisateurs…" },

  // ── Home page ───────────────────────────────────────────────────────────────
  "home.topQuestions":   { en: "Top Questions",  es: "Preguntas destacadas", hi: "शीर्ष प्रश्न",     pt: "Principais Perguntas", zh: "热门问题",   fr: "Questions populaires" },
  "home.askQuestion":    { en: "Ask Question",   es: "Hacer pregunta",      hi: "प्रश्न पूछें",       pt: "Fazer Pergunta",       zh: "提问",       fr: "Poser une question" },
  "home.questions":      { en: "questions",      es: "preguntas",           hi: "प्रश्न",            pt: "perguntas",            zh: "个问题",     fr: "questions" },
  "home.newest":         { en: "Newest",         es: "Más recientes",       hi: "नवीनतम",            pt: "Mais Recentes",        zh: "最新",       fr: "Plus récentes" },
  "home.active":         { en: "Active",         es: "Activas",             hi: "सक्रिय",            pt: "Ativas",               zh: "活跃",       fr: "Actives" },
  "home.bountied":       { en: "Bountied",       es: "Con recompensa",      hi: "इनामी",            pt: "Com recompensa",       zh: "悬赏",       fr: "Primées" },
  "home.unanswered":     { en: "Unanswered",     es: "Sin respuesta",       hi: "अनुत्तरित",        pt: "Sem resposta",         zh: "未回答",     fr: "Sans réponse" },
  "home.filter":         { en: "Filter",         es: "Filtrar",             hi: "फ़िल्टर",           pt: "Filtrar",              zh: "筛选",       fr: "Filtrer" },
  "home.votes":          { en: "votes",          es: "votos",               hi: "वोट",              pt: "votos",                zh: "票",         fr: "votes" },
  "home.answers":        { en: "answers",        es: "respuestas",          hi: "उत्तर",            pt: "respostas",            zh: "回答",       fr: "réponses" },
  "home.askedBy":        { en: "asked",          es: "preguntado",          hi: "द्वारा पूछा गया",   pt: "perguntado",           zh: "提问于",     fr: "demandé" },
  "home.noQuestions":    { en: "No questions found", es: "No se encontraron preguntas", hi: "कोई प्रश्न नहीं मिला", pt: "Nenhuma pergunta encontrada", zh: "未找到问题", fr: "Aucune question trouvée" },

  // ── Common / buttons ────────────────────────────────────────────────────────
  "common.save":         { en: "Save",     es: "Guardar",     hi: "सहेजें",      pt: "Salvar",     zh: "保存",   fr: "Enregistrer" },
  "common.cancel":       { en: "Cancel",   es: "Cancelar",    hi: "रद्द करें",   pt: "Cancelar",   zh: "取消",   fr: "Annuler" },
  "common.delete":       { en: "Delete",   es: "Eliminar",    hi: "हटाएं",       pt: "Excluir",    zh: "删除",   fr: "Supprimer" },
  "common.edit":         { en: "Edit",     es: "Editar",      hi: "संपादित करें", pt: "Editar",     zh: "编辑",   fr: "Modifier" },
  "common.submit":       { en: "Submit",   es: "Enviar",      hi: "जमा करें",    pt: "Enviar",     zh: "提交",   fr: "Soumettre" },
  "common.loading":      { en: "Loading…", es: "Cargando…",   hi: "लोड हो रहा है…", pt: "Carregando…", zh: "加载中…", fr: "Chargement…" },
  "common.points":       { en: "points",   es: "puntos",      hi: "अंक",         pt: "pontos",     zh: "积分",   fr: "points" },

  // ── Language settings page ──────────────────────────────────────────────────
  "lang.title":          { en: "Language Settings", es: "Configuración de idioma", hi: "भाषा सेटिंग्स", pt: "Configurações de idioma", zh: "语言设置", fr: "Paramètres de langue" },
  "lang.current":        { en: "Current language:", es: "Idioma actual:", hi: "वर्तमान भाषा:", pt: "Idioma atual:", zh: "当前语言：", fr: "Langue actuelle :" },
  "lang.active":         { en: "Active", es: "Activo", hi: "सक्रिय", pt: "Ativo", zh: "当前", fr: "Actif" },
  "lang.verificationRequired": { en: "Verification Required", es: "Verificación requerida", hi: "सत्यापन आवश्यक", pt: "Verificação necessária", zh: "需要验证", fr: "Vérification requise" },
};

/** Translate a key into the current language, falling back to English. */
export function translate(key: string, lang: LanguageCode): string {
  const entry = translations[key];
  if (!entry) return key; // missing translation — show key so it's obvious
  return entry[lang] || entry.en || key;
}