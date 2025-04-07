export const appRoutes = {
  home: "/",
  payment: "/payment",
  login: "/login",
  signup: "/signup",
  terms: "/terms",
  privacy: "/privacy",
  forgotPassword: "/forgot",
  contact: "/contact",
  settings: "/settings",
  affiliate: "/affiliate",
} as const

export const authRoutes = [
  appRoutes.login,
  appRoutes.signup,
  appRoutes.forgotPassword,
]

export const ignoreRedirectRoutes = []

export const isAuthRoute = (route: string, additional?: string[]) =>
  Array.from<string>([...authRoutes, ...(additional || [])]).includes(route)

export const isIgnoreRedirectRoute = (route: string) =>
  Array.from<string>(ignoreRedirectRoutes).includes(route)

export const footerRoutes = {
  [appRoutes.privacy]: "Privacy",
  [appRoutes.terms]: "Terms of Use",
  [appRoutes.contact]: "Contact Us",
} as const
