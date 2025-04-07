import { useEffect } from "react"
import { usePathname } from "next/navigation"
import useUser from "@/apis/users/use-user"
import { appRoutes } from "@/constants/routes"
import { useAuth } from "@/contexts/auth-context"
import useUIStore from "@/stores/ui-store"
import ZaloIcon from "@assets/svgs/icons/zalo.svg"
import { ArrowLeftToLine } from "lucide-react"
import { useWindowSize } from "react-use"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { Icons } from "../icons"
import LogoutAlert from "../logout-alert"
import SidebarItem from "./sidebar-item"

const items = [
  {
    icon: <Icons.layoutDashboard className="h-5 w-5" />,
    label: "Ghép ảnh",
    path: appRoutes.home,
  },
  {
    icon: <Icons.dollarSign className="h-5 w-5" />,
    label: "Nạp tiền",
    path: appRoutes.payment,
  },
  {
    icon: <ZaloIcon className="size-6" />,
    label: "Group Zalo Hỗ trợ",
    path: "https://zalo.me/g/zbxyae446",
    newTab: true,
  },
]

const SideBar = () => {
  const path = usePathname()

  const { showSidebar, toggleSidebar, setShowSidebar } = useUIStore(
    (state) => state
  )

  const { width } = useWindowSize()

  const { firebaseUser } = useAuth()
  const { data: user } = useUser({
    id: firebaseUser?.email || "",
    enabled: !!firebaseUser?.email,
  })

  useEffect(() => {
    if (width < 640) setShowSidebar(false)
  }, [width])

  return (
    <>
      {showSidebar && (
        <div
          className="fixed left-[220px] top-0 z-20 h-screen w-screen bg-transparent backdrop-blur md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-0 flex-col overflow-hidden border-r border-neutral-50 bg-background drop-shadow-sm transition-all ease-in md:flex"
        )}
        style={{ width: showSidebar ? "220px" : "0" }}
      >
        <nav className="flex flex-1 flex-col items-start">
          <div className="flex w-full items-center justify-between">
            <Icons.appIcon className="mx-4 my-6 size-8 rounded" />
            <Button
              variant="ghost"
              onClick={toggleSidebar}
              className="mr-2 p-4"
            >
              <ArrowLeftToLine
                className={cn(
                  "size-4 transform cursor-pointer",
                  !showSidebar && "rotate-180"
                )}
              />
            </Button>
          </div>
          {items.map((item, index) => {
            const child = (
              <SidebarItem
                key={item.path}
                isActive={path === item.path}
                {...item}
              />
            )
            return child
          })}
          {user?.affiliate && (
            <SidebarItem
              key={appRoutes.affiliate}
              isActive={path === appRoutes.affiliate}
              label="Tiếp thị liên kết"
              path={appRoutes.affiliate}
              icon={<Icons.megaphone className="size-5" />}
            />
          )}
        </nav>
        <footer className="flex items-center justify-center py-4">
          <LogoutAlert>
            <div className="group flex w-full cursor-pointer p-4 text-sm transition-colors hover:bg-neutral-75 hover:text-primary">
              <Icons.logout className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-primary" />
              Đăng xuất
            </div>
          </LogoutAlert>
        </footer>
      </aside>
    </>
  )
}

export default SideBar
