const MainApiPath = {
  accounts: {
    default: "accounts",
  },
  email: {
    default: "email",
    verify: () => `${MainApiPath.email.default}/verify`,
  },
  users: {
    default: "users",
    withId: (id: string) => `${MainApiPath.users.default}/${id}`,
    refcode: () => `${MainApiPath.users.default}/refcode`,
    signup: () => `${MainApiPath.users.default}/signup`,
  },
  ghepvip: {
    default: "ghepvip",
  },
  files: {
    default: "files",
    uploadUrl: () => `${MainApiPath.files.default}/upload-url`,
    meta: () => `${MainApiPath.files.default}/meta`,
  },
  gdrive: {
    default: "gdrive",
    json: () => `${MainApiPath.gdrive.default}/json`,
    txt: () => `${MainApiPath.gdrive.default}/txt`,
  },
} as const

export default MainApiPath
