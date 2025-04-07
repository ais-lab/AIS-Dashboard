import { useMemo, useState } from "react"
import Link from "next/link"
import useAddAccount from "@/apis/accounts/use-add-account"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { RunDuration, runDurationLabels, runDurations } from "@/types/models"
import dayjsConfig, { DAYJS_CONSTANT_DEFAULT } from "@/config/dayjs"
import { siteConfig } from "@/config/site"
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
import { TimeSelect } from "@/components/common/date-select"
import { Icons } from "@/components/common/icons"

interface Props {}

const addAccountSchema = z.object({
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
  time: z.string().optional(),
})

const ONE_DAY = 24 * 60 * 60 * 1000

const AddAccountButton = (props: Props) => {
  const form = useForm<z.infer<typeof addAccountSchema>>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: {
      account: "",
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { mutateAsync: addAcount } = useAddAccount({
    onSuccess: () => {
      setIsDialogOpen(false)
      toast.success(`Tài khoản ${form.getValues("account")} đã được thêm`)
    },
    onError: async (error) => {
      const jsonError = await error.response.json()
      const { message } = jsonError || {
        message: "Có lỗi xảy ra",
      }
      if (message === "Tài khoản đã tồn tại") {
        form.setError("account", { message })
        form.setFocus("account")
        return
      }
      toast.error(message)
    },
  })

  const time = form.watch("time")

  const currentTime = new Date().getTime()

  const nextRun = useMemo(() => {
    if (!time) return currentTime
    const [hour, minute] = time.split(":").map((v) => parseInt(v))
    const date = new Date()
    date.setHours(hour, minute, 0, 0)
    if (date.getTime() < new Date().getTime()) {
      return date.getTime() + ONE_DAY
    }
    return date.getTime()
  }, [currentTime, time])

  const handleSubmit = async (data: z.infer<typeof addAccountSchema>) => {
    await addAcount({
      account: data.account.trim(),
      duration: data.duration as RunDuration,
      nextRun: new Date(nextRun).toISOString(),
    })
  }

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
          <Button>
            <Icons.plus className="mr-2 h-4 w-4" />
            Thêm tài khoản
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader className="text-xl font-bold">
            Thêm tài khoản
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    {!form.formState.errors.account && (
                      <FormDescription>Nhớ kiểm tra kỹ nhen</FormDescription>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">Gói chạy</FormLabel>
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
                            ? `Hết hạn vào: ${dayjsConfig.view(new Date().getTime() + runDurationLabels[form.getValues("duration") as RunDuration].timeLength)}`
                            : "Không hết hạn"}
                        </FormDescription>
                      )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span>Thời gian chạy</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        (Nếu chạy luôn thì để trống)
                      </span>
                    </FormLabel>

                    <FormControl>
                      <TimeSelect
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                    {!form.formState.errors.time && (
                      <FormDescription>
                        Sẽ chạy lần đầu vào:{" "}
                        {dayjsConfig.view(
                          nextRun,
                          DAYJS_CONSTANT_DEFAULT.fullDateFormat
                        )}
                        {time
                          ? ` (${dayjsConfig.tzView({
                              date: nextRun,
                              format: DAYJS_CONSTANT_DEFAULT.timestampFormat,
                              isDisplayToday: true,
                              isRelative: true,
                            })})`
                          : " (Chạy ngay)"}
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
                Thêm tài khoản
              </Button>
            </form>
          </Form>
          {!form.getValues("account") && (
            <Link href={siteConfig.links.messenger} target="_blank">
              <Button variant="link" className="h-fit p-0 text-[12px] max-w-full">
                Thêm hàng loạt (50, 100... tài khoản): liên hệ với admin
              </Button>
            </Link>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddAccountButton
