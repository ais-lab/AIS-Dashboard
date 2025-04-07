"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import useLogin from "@/apis/auth/use-login"
import { appRoutes } from "@/constants/routes"
import { zodResolver } from "@hookform/resolvers/zod"
import { FirebaseError } from "firebase/app"
import { signOut } from "firebase/auth"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { auth } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { PasswordInput } from "@/components/ui/password-input"
import { siteConfig } from "@/config/site"

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Vui lòng nhập email",
    })
    .email("Email không hợp lệ"),
  password: z
    .string({
      required_error: "Vui lòng nhập mật khẩu",
    })
    .min(1, "Vui lòng nhập mật khẩu"),
})

const LoginForm = () => {
  const router = useRouter()
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  })

  const {
    mutate: login,
    isPending: isLoggingIn,
    error: loginError,
  } = useLogin({
    onSuccess: (user) => {
      router.replace(appRoutes.home)
    },
    onError: (error) => {
      signOut(auth)
      if (error instanceof FirebaseError) return
      toast.error(
        "Could not log in due to server error. Please try again later."
      )
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => login(values)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="mx-auto max-w-md bg-transparent" blurBackground>
          <CardHeader>
            <CardTitle className="text-xl">
              Chào mừng đến với {siteConfig.name}
            </CardTitle>
            <Badge className="w-fit rounded">
              🎉 Tạo tài khoản tặng ngay 10.000đ trải nghiệm
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
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
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-right underline">
                      <Link href={appRoutes.forgotPassword}>
                        Quên mật khẩu?
                      </Link>
                    </FormDescription>
                  </FormItem>
                )}
              />
              {loginError && (
                <FormMessage className="text-center text-red-500" role="alert">
                  Email hoặc mật khẩu không đúng
                </FormMessage>
              )}

              <Button
                type="submit"
                className="mt-2 w-full"
                isLoading={isLoggingIn}
              >
                Đăng nhập
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {"Chưa có tài khoản? "}
              <Link
                className="text-primary hover:underline"
                href={appRoutes.signup}
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
      {/* <AuthFooter /> */}
    </Form>
  )
}

export default LoginForm
