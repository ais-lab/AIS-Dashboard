import { useState } from "react"
import useDeleteAccount from "@/apis/accounts/use-delete-account"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/common/icons"

interface Props {
  accountId: string
}

const DeleteAccountButton = ({ accountId }: Props) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount({
    onSuccess: () => {
      toast.success("Xóa tài khoản thành công")
      setConfirmDelete(false)
    },
    onError: async (error) => {
      const jsonError = await error.response.json()
      const { message } = jsonError || {
        message: "Có lỗi xảy ra, xoá tài khoản không thành công",
      }
      setConfirmDelete(false)
      toast.error(message)
    },
  })

  return (
    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
      <AlertDialogTrigger asChild>
        <Button variant="destructiveOutline">
          <Icons.trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa tài khoản</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa tài khoản{" "}
            <i className="text-foreground">{accountId}</i> không?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteAccount({ accountId })}
            isLoading={isDeleting}
          >
            <Icons.trash2 className="mr-1 h-4 w-4" />
            Xóa
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAccountButton
