import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'en' | 'ml'

type Dictionary = Record<string, string> | Record<string, (arg?: any) => string>

const en = {
  app_title: 'Balasabha',
  nav_cms: 'CMS',
  nav_modify_storage: 'Modify Storage',
  nav_dashboard: 'Dashboard',
  nav_sign_out: 'Sign out',
  login_title: 'Sign in',
  login_email: 'Email',
  login_password: 'Password',
  hide_password: 'Hide password',
  show_password: 'Show password',
  login_signin: 'Sign in',
  login_signing_in: 'Signing in…',
  settings: 'Settings',
  language: 'Language',
  english: 'English',
  malayalam: 'Malayalam',
  cms_title: 'CMS',
  cms_subtitle: 'Create a new media entry.',
  cms_publish: 'Publish',
  cms_uploading: 'Uploading…',
  cms_media_type: 'Media Type',
  cms_image: 'Image',
  cms_video: 'Video',
  cms_thumbnail: 'Thumbnail Image',
  cms_story: 'Story',
  cms_poem: 'Poem',
  cms_story_language: 'Story/Poem Language',
  cms_story_text: 'Story/Poem Text',
  cms_story_text_placeholder: 'Enter your story or poem here...',
  cms_story_images: 'Story Images',
  cms_poem_images: 'Poem Images',
  cms_story_images_help: 'Upload multiple images for your story (they will be stored as pages).',
  cms_poem_images_help: 'Upload multiple images for your poem (they will be stored as pages).',
  cms_page: 'Page',
  dash_title: 'Dashboard',
  dash_subtitle: 'Analysis and monitoring of uploaded entries.',
} as const satisfies Dictionary

const ml = {
  app_title: 'ബാലസഭ',
  nav_cms: 'CMS',
  nav_modify_storage: 'സ്റ്റോറേജ് മാറ്റുക',
  nav_dashboard: 'ഡാഷ്‌ബോർഡ്',
  nav_sign_out: 'സൈൻ ഔട്ട്',
  login_title: 'ലോഗിൻ',
  login_email: 'ഇമെയിൽ',
  login_password: 'പാസ്സ്‌വേർഡ്',
  hide_password: 'പാസ്സ്‌വേർഡ്  മറയ്ക്കുക',
  show_password: 'പാസ്സ്‌വേർഡ്  കാണിക്കുക',
  login_signin: 'ലോഗിൻ',
  login_signing_in: 'ലോഗിൻ ചെയ്യുന്നു…',
  settings: 'ക്രമീകരണങ്ങൾ',
  language: 'ഭാഷ',
  english: 'ഇംഗ്ലീഷ്',
  malayalam: 'മലയാളം',
  cms_title: 'CMS',
  cms_subtitle: 'ഒരു പുതിയ മീഡിയ എൻട്രി സൃഷ്ടിക്കുക.',
  cms_publish: 'പ്രസിദ്ധീകരിക്കുക',
  cms_uploading: 'അപ്‌ലോഡുചെയ്യുന്നു…',
  cms_media_type: 'മീഡിയ തരം',
  cms_image: 'ചിത്രം',
  cms_video: 'വീഡിയോ',
  cms_thumbnail: 'തംബ്നെയിൽ ചിത്രം',
  cms_story: 'കഥ',
  cms_poem: 'കവിത',
  cms_story_language: 'കഥ/കവിത ഭാഷ',
  cms_story_text: 'കഥ/കവിത ടെക്സ്റ്റ്',
  cms_story_text_placeholder: 'നിങ്ങളുടെ കഥ അല്ലെങ്കിൽ കവിത ഇവിടെ നൽകുക...',
  cms_story_images: 'കഥ ചിത്രങ്ങൾ',
  cms_poem_images: 'കവിത ചിത്രങ്ങൾ',
  cms_story_images_help: 'നിങ്ങളുടെ കഥയ്ക്കായി ഒന്നിലധികം ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക (അവ പേജുകളായി സംഭരിക്കും). ടെക്സ്റ്റ് ഉള്ളടക്കം ആവശ്യമില്ല.',
  cms_poem_images_help: 'നിങ്ങളുടെ കവിതയ്ക്കായി ഒന്നിലധികം ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക (അവ പേജുകളായി സംഭരിക്കും). ടെക്സ്റ്റ് ഉള്ളടക്കം ആവശ്യമില്ല.',
  cms_page: 'പേജ്',
  dash_title: 'ഡാഷ്‌ബോർഡ്',
  dash_subtitle: 'അപ്‌ലോഡ് ചെയ്ത എൻട്രികളുടെ വിശകലനം, നിരീക്ഷണം.',
} as const satisfies Dictionary

const dicts = { en, ml } as const

type I18nContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof en) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en')
  useEffect(() => { try { localStorage.setItem('lang', lang) } catch {} }, [lang])
  const t = useMemo(() => (key: keyof typeof en) => dicts[lang][key], [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}


