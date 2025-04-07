import Link from "next/link"
import { appRoutes } from "@/constants/routes"

import { siteConfig } from "@/config/site"

const AuthFooter = () => {
  return <></>
  return (
    <div className="mx-auto mb-4 mt-2 max-w-md text-center text-xs">
      By signing up, you agree to {`${siteConfig.name}' `}
      <Link
        className="text-muted-foreground underline hover:text-primary"
        href={appRoutes.terms}
      >
        Terms of Use
      </Link>
      {" and "}
      <Link
        className="text-muted-foreground underline hover:text-primary"
        href={appRoutes.privacy}
      >
        Privacy Policy
      </Link>
    </div>
  )
}

export default AuthFooter
