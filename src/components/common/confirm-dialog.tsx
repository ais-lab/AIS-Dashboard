import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"

interface Props {
  title: string
  description: React.ReactNode
  destructive?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  confirmContent?: React.ReactNode
  cancelContent?: React.ReactNode
  isLoading?: boolean
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const ConfirmDialog = (props: Props) => {
  const {
    title,
    description,
    destructive,
    onConfirm,
    onCancel,
    confirmContent,
    cancelContent,
    isLoading,
    isOpen,
    onOpenChange,
  } = props

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelContent || "Cancel"}
          </AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmContent || "OK"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
