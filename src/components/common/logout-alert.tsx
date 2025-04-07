import useLogout from "@/apis/auth/use-logout"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { Icons } from "./icons"

interface Props {
  children: React.ReactNode
}

const LogoutAlert = ({ children }: Props) => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const handleLogout = () => {
    logout()
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đăng xuất</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn đăng xuất không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            <Icons.logout className="mr-1 h-4 w-4" />
            Đăng xuất
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LogoutAlert
