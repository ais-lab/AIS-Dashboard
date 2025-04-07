"use client"

import Link from "next/link"
import useResetPassword from "@/apis/auth/use-reset-password"
import { appRoutes } from "@/constants/routes"
import EmailSentIcon from "@assets/svgs/icons/email-sent.svg"
import FogotPasswordIcon from "@assets/svgs/icons/forgot-password.svg"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "Vui lòng nhập email của bạn",
    })
    .email("Vui lòng nhập một email hợp lệ"),
})

export default function ForgotPasswordPage() {
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  })

  const { isSuccess: isEmailSent, mutateAsync: sendResetPasswordEmail } =
    useResetPassword({
      onError: () => {
        toast.error(
          "Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại sau."
        )
      },
    })

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    await sendResetPasswordEmail(data)
  }

  const icon = isEmailSent ? (
    <EmailSentIcon className="mx-auto mb-6 size-16" />
  ) : (
    <FogotPasswordIcon className="mx-auto mb-6 size-16" />
  )
  const title = isEmailSent ? "Email Đã Gửi" : "Quên Mật Khẩu"
  const description = isEmailSent
    ? "Một email với hướng dẫn đặt lại mật khẩu đã được gửi đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến của bạn."
    : "Vui lòng nhập địa chỉ email của bạn để đặt lại mật khẩu."

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mx-auto max-w-md">
          <CardHeader className="space-y-6 pb-6 pt-8">
            <CardTitle className="text-center font-bold">
              {icon}
              {title}
            </CardTitle>
            <CardDescription className="text-center text-neutral-900">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {!isEmailSent ? (
                <>
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                  <Button
                    type="submit"
                    className="mt-2 w-full"
                    isLoading={form.formState.isSubmitting}
                    disabled={!form.formState.isValid}
                  >
                    Gửi mail đặt lại mật khẩu
                  </Button>
                </>
              ) : (
                <Link href={appRoutes.login}>
                  <Button className="w-full">Quay Lại Đăng Nhập</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
        {!isEmailSent && (
          <div className="mx-auto mt-1 text-center">
            <Link href={appRoutes.login}>
              <Button
                variant="link"
                className="text-sm font-normal text-muted-foreground"
              >
                Quay Lại Đăng Nhập
              </Button>
            </Link>
          </div>
        )}
      </form>
    </Form>
  )
}
