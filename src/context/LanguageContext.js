import React, { createContext, useContext, useState, useCallback } from 'react';

const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'zh', 'ja'];

const translations = {
  en: {
    // Navigation
    'nav.menu': 'Menu',
    'nav.events': 'Events',
    'nav.gallery': 'Gallery',
    'nav.paintings': 'Paintings',
    'nav.press': 'Press',
    'nav.contact': 'Contact',
    'nav.reserve': 'Reserve',
    'nav.order': 'Order',

    // Page headers
    'header.ourMenus': 'Our Menus',
    'header.events': 'Events',
    'header.gallery': 'Gallery',
    'header.contactUs': 'Contact Us',
    'header.paintings': 'Paintings',
    'header.press': 'Press',
    'header.order': 'Order Online',

    // Common actions
    'common.viewMenu': 'View Menu',
    'common.reserveTable': 'Reserve a Table',
    'common.getTickets': 'Get Tickets',
    'common.addToCart': 'Add to Cart',
    'common.checkout': 'Checkout',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.readMore': 'Read More',

    // Footer
    'footer.explore': 'Explore',
    'footer.visitUs': 'Visit Us',
    'footer.creativeAmerican': 'Creative American Dining',
    'footer.allRights': 'All rights reserved',
  },

  es: {
    'nav.menu': 'Carta',
    'nav.events': 'Eventos',
    'nav.gallery': 'Galeria',
    'nav.paintings': 'Pinturas',
    'nav.press': 'Prensa',
    'nav.contact': 'Contacto',
    'nav.reserve': 'Reservar',
    'nav.order': 'Pedir',

    'header.ourMenus': 'Nuestras Cartas',
    'header.events': 'Eventos',
    'header.gallery': 'Galeria',
    'header.contactUs': 'Contactenos',
    'header.paintings': 'Pinturas',
    'header.press': 'Prensa',
    'header.order': 'Pedir en Linea',

    'common.viewMenu': 'Ver Carta',
    'common.reserveTable': 'Reservar una Mesa',
    'common.getTickets': 'Obtener Entradas',
    'common.addToCart': 'Agregar al Carrito',
    'common.checkout': 'Pagar',
    'common.submit': 'Enviar',
    'common.close': 'Cerrar',
    'common.back': 'Atras',
    'common.next': 'Siguiente',
    'common.loading': 'Cargando...',
    'common.error': 'Algo salio mal',
    'common.readMore': 'Leer Mas',

    'footer.explore': 'Explorar',
    'footer.visitUs': 'Visitenos',
    'footer.creativeAmerican': 'Cocina Americana Creativa',
    'footer.allRights': 'Todos los derechos reservados',
  },

  fr: {
    'nav.menu': 'Carte',
    'nav.events': 'Evenements',
    'nav.gallery': 'Galerie',
    'nav.paintings': 'Peintures',
    'nav.press': 'Presse',
    'nav.contact': 'Contact',
    'nav.reserve': 'Reserver',
    'nav.order': 'Commander',

    'header.ourMenus': 'Nos Menus',
    'header.events': 'Evenements',
    'header.gallery': 'Galerie',
    'header.contactUs': 'Contactez-nous',
    'header.paintings': 'Peintures',
    'header.press': 'Presse',
    'header.order': 'Commander en Ligne',

    'common.viewMenu': 'Voir la Carte',
    'common.reserveTable': 'Reserver une Table',
    'common.getTickets': 'Obtenir des Billets',
    'common.addToCart': 'Ajouter au Panier',
    'common.checkout': 'Paiement',
    'common.submit': 'Envoyer',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.readMore': 'Lire la Suite',

    'footer.explore': 'Explorer',
    'footer.visitUs': 'Nous Rendre Visite',
    'footer.creativeAmerican': 'Cuisine Americaine Creative',
    'footer.allRights': 'Tous droits reserves',
  },

  zh: {
    'nav.menu': '\u83DC\u5355',
    'nav.events': '\u6D3B\u52A8',
    'nav.gallery': '\u56FE\u5E93',
    'nav.paintings': '\u753B\u4F5C',
    'nav.press': '\u65B0\u95FB',
    'nav.contact': '\u8054\u7CFB',
    'nav.reserve': '\u9884\u8BA2',
    'nav.order': '\u70B9\u9910',

    'header.ourMenus': '\u6211\u4EEC\u7684\u83DC\u5355',
    'header.events': '\u6D3B\u52A8',
    'header.gallery': '\u56FE\u5E93',
    'header.contactUs': '\u8054\u7CFB\u6211\u4EEC',
    'header.paintings': '\u753B\u4F5C',
    'header.press': '\u65B0\u95FB\u62A5\u9053',
    'header.order': '\u5728\u7EBF\u70B9\u9910',

    'common.viewMenu': '\u67E5\u770B\u83DC\u5355',
    'common.reserveTable': '\u9884\u8BA2\u5EA7\u4F4D',
    'common.getTickets': '\u83B7\u53D6\u95E8\u7968',
    'common.addToCart': '\u52A0\u5165\u8D2D\u7269\u8F66',
    'common.checkout': '\u7ED3\u8D26',
    'common.submit': '\u63D0\u4EA4',
    'common.close': '\u5173\u95ED',
    'common.back': '\u8FD4\u56DE',
    'common.next': '\u4E0B\u4E00\u6B65',
    'common.loading': '\u52A0\u8F7D\u4E2D...',
    'common.error': '\u51FA\u4E86\u70B9\u95EE\u9898',
    'common.readMore': '\u9605\u8BFB\u66F4\u591A',

    'footer.explore': '\u63A2\u7D22',
    'footer.visitUs': '\u5230\u8BBF\u6211\u4EEC',
    'footer.creativeAmerican': '\u521B\u610F\u7F8E\u5F0F\u6599\u7406',
    'footer.allRights': '\u7248\u6743\u6240\u6709',
  },

  ja: {
    'nav.menu': '\u30E1\u30CB\u30E5\u30FC',
    'nav.events': '\u30A4\u30D9\u30F3\u30C8',
    'nav.gallery': '\u30AE\u30E3\u30E9\u30EA\u30FC',
    'nav.paintings': '\u7D75\u753B',
    'nav.press': '\u30D7\u30EC\u30B9',
    'nav.contact': '\u304A\u554F\u3044\u5408\u308F\u305B',
    'nav.reserve': '\u4E88\u7D04',
    'nav.order': '\u6CE8\u6587',

    'header.ourMenus': '\u30E1\u30CB\u30E5\u30FC\u4E00\u89A7',
    'header.events': '\u30A4\u30D9\u30F3\u30C8',
    'header.gallery': '\u30AE\u30E3\u30E9\u30EA\u30FC',
    'header.contactUs': '\u304A\u554F\u3044\u5408\u308F\u305B',
    'header.paintings': '\u7D75\u753B',
    'header.press': '\u30D7\u30EC\u30B9',
    'header.order': '\u30AA\u30F3\u30E9\u30A4\u30F3\u6CE8\u6587',

    'common.viewMenu': '\u30E1\u30CB\u30E5\u30FC\u3092\u898B\u308B',
    'common.reserveTable': '\u5E2D\u3092\u4E88\u7D04\u3059\u308B',
    'common.getTickets': '\u30C1\u30B1\u30C3\u30C8\u3092\u53D6\u5F97',
    'common.addToCart': '\u30AB\u30FC\u30C8\u306B\u8FFD\u52A0',
    'common.checkout': '\u4F1A\u8A08',
    'common.submit': '\u9001\u4FE1',
    'common.close': '\u9589\u3058\u308B',
    'common.back': '\u623B\u308B',
    'common.next': '\u6B21\u3078',
    'common.loading': '\u8AAD\u307F\u8FBC\u307F\u4E2D...',
    'common.error': '\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F',
    'common.readMore': '\u7D9A\u304D\u3092\u8AAD\u3080',

    'footer.explore': '\u63A2\u7D22',
    'footer.visitUs': '\u30A2\u30AF\u30BB\u30B9',
    'footer.creativeAmerican': '\u30AF\u30EA\u30A8\u30A4\u30C6\u30A3\u30D6\u30A2\u30E1\u30EA\u30AB\u30F3\u30C0\u30A4\u30CB\u30F3\u30B0',
    'footer.allRights': '\u5168\u8457\u4F5C\u6A29\u6240\u6709',
  },
};

const STORAGE_KEY = 'standardfare_language';

function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  } catch {
    // localStorage unavailable
  }
  return 'en';
}

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return;
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const t = useCallback(
    (key) => {
      const val = translations[lang]?.[key];
      if (val !== undefined) return val;
      // Fallback to English
      return translations.en?.[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

export default LanguageContext;
