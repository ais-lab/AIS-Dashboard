import { useEffect, useMemo, useState } from "react"
import useExtendAccount from "@/apis/accounts/use-extend-account"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  Account,
  RunDuration,
  runDurationLabels,
  runDurations,
} from "@/types/models"
import dayjsConfig, { DAYJS_CONSTANT_DEFAULT } from "@/config/dayjs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/common/icons"

interface Props {
  account: Account
}

const extendAccountSchema = z.object({
  account: z
    .string({
      required_error: "Tài khoản không được để trống",
    })
    .min(1),
  duration: z
    .string({
      required_error: "Vui lòng chọn gói chạy",
    })
    .min(1),
})

const ExtendAccountButton = ({ account }: Props) => {
  const form = useForm<z.infer<typeof extendAccountSchema>>({
    resolver: zodResolver(extendAccountSchema),
    defaultValues: {
      account: account.id,
      duration: account.duration,
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { mutateAsync: extendAccount } = useExtendAccount({
    onSuccess: () => {
      setIsDialogOpen(false)
      toast.success(`Tài khoản ${form.getValues("account")} đã được gia hạn`)
    },
    onError: async (error) => {
      const jsonError = await error.response.json()
      const { message } = jsonError || {
        message: "Có lỗi xảy ra",
      }
      if (message === "Tài khoản không tồn tại") {
        form.setError("account", { message })
        form.setFocus("account")
        return
      }
      toast.error(message)
    },
  })

  const currentTime = new Date().getTime()
  const duration = form.getValues("duration") as RunDuration

  const expiredTime = useMemo(() => {
    if (duration === "forever") return
    const currentDateTime = new Date().toISOString()
    const { expiredAt = currentDateTime } = account
    const newExpiredAt = expiredAt < currentDateTime ? currentTime : expiredAt
    return new Date(
      new Date(newExpiredAt).getTime() + runDurationLabels[duration].timeLength
    ).toISOString()
  }, [currentTime])

  const handleSubmit = async (data: z.infer<typeof extendAccountSchema>) => {
    await extendAccount({
      account: data.account.trim(),
      duration: data.duration as RunDuration,
    })
  }

  useEffect(() => {
    form.reset({
      account: account.id,
      duration: account.duration,
    })
  }
  , [account])


  return (
    <div>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            form.reset()
          }
          setIsDialogOpen(open)
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">
            <Icons.timerReset className="mr-2 size-4" />
            Gia hạn
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader className="text-xl font-bold">
            Gia hạn tài khoản
          </DialogHeader>
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                name="account"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Tài khoản</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                    
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Gói chạy gia hạn</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn gói chạy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {runDurations.map((value) => {
                          const data = runDurationLabels[value]
                          return (
                            <SelectItem
                              key={value}
                              value={value}
                              className="font-semibold"
                            >
                              {data.label}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {!form.formState.errors.duration &&
                      form.getValues("duration") && (
                        <FormDescription>
                          {form.getValues("duration") !== "forever"
                            ? `Hết hạn vào: ${dayjsConfig.view(expiredTime, DAYJS_CONSTANT_DEFAULT.dateFormat)}`
                            : "Không hết hạn"}
                        </FormDescription>
                      )}
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-2"
                isLoading={form.formState.isSubmitting}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                Gia hạn
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ExtendAccountButton
