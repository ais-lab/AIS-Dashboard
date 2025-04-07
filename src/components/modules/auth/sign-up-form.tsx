"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useRefCode from "@/apis/auth/use-refcode"
import useSignUp from "@/apis/auth/use-sign-up"
import { userKeys } from "@/constants/query-key-factory"
import { appRoutes } from "@/constants/routes"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { debounce } from "lodash"
import { useForm } from "react-hook-form"
import { useSearchParam } from "react-use"
import { toast } from "sonner"
import { z } from "zod"

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
import { Icons } from "@/components/common/icons"
import IosLoadingSpinner from "@/components/common/ios-loading-spinner"

import AuthFooter from "./auth-footer"
import { siteConfig } from "@/config/site"

const signUpSchema = z.object({
  email: z
    .string({
      required_error: "Vui lòng nhập email của bạn",
    })
    .email("Vui lòng nhập email hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu của bạn không đủ mạnh. Mật khẩu phải có ít nhất 6 ký tự.")
    .max(20),
  refcode: z.string().optional(),
})

const SignUpForm = () => {
  const router = useRouter()
  const refcodeDefault = useSearchParam("refcode")

  const queryClient = useQueryClient()

  const [disableRefCode, setDisableRefCode] = useState(false)

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      refcode: refcodeDefault || "",
    },
  })

  const { mutateAsync: signUp, error: signUpError } = useSignUp({
    onSuccess: () => {
      router.push(appRoutes.home)
      if (form.getValues("refcode")) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: userKeys.currentUser })
          queryClient.invalidateQueries({ queryKey: userKeys.user })
        }, 1200)
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.")
    },
  })

  const {
    mutate: getRefCode,
    isPending: getRefCodePending,
    data: refCode,
    reset: resetRefCode,
  } = useRefCode({
    onError: (error) => {
      form.setError("refcode", {
        type: "manual",
        message: error.message,
      })
    },
  })

  const handleRefCodeChange = async (refcode: string) => {
    if (!refcode) {
      form.clearErrors("refcode")
      resetRefCode()
      return
    }
    getRefCode({ refcode })
  }

  const debouncedRefCodeChangeHandler = useCallback(
    debounce(handleRefCodeChange, 500),
    []
  )

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    if (getRefCodePending || !isRefCodeValid) return

    await signUp({
      ...values,
      refcodeUrl: `${window.location.origin}/api`,
    })
  }

  const hasInputRefCode = form.watch("refcode") !== ""
  const isRefCodeValid = (hasInputRefCode && refCode) || !hasInputRefCode

  useEffect(() => {
    if (!refcodeDefault) return
    form.setValue("refcode", refcodeDefault)
    debouncedRefCodeChangeHandler(refcodeDefault)
  }, [refcodeDefault])

  useEffect(() => {
    if (window === undefined) return
    const baseUri = window.location.hostname
    if (baseUri.includes("gheptudong")) {
      form.setValue("refcode", "phucdang")
      handleRefCodeChange("phucdang")
      setDisableRefCode(true)
      return
    }
    const baseUrlParts = baseUri.split(".").filter((part) => part !== "www")
    if (baseUrlParts.length < 3) return
    const subdomain = baseUrlParts[0]
    form.setValue("refcode", subdomain)
    handleRefCodeChange(subdomain)
    setDisableRefCode(true)
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
        <Card className="mx-auto max-w-md" blurBackground>
          <CardHeader>
            <CardTitle className="text-xl">
              Tạo tài khoản {siteConfig.name}
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
                  </FormItem>
                )}
              />

              <FormField
                name="refcode"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã giới thiệu</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={disableRefCode}
                        onChange={(e) => {
                          debouncedRefCodeChangeHandler(e.target.value)
                          form.setValue("refcode", e.target.value)
                        }}
                        trailing={
                          getRefCodePending ? (
                            <IosLoadingSpinner size="small" />
                          ) : refCode ? (
                            <Icons.checkCheck className="size-4 text-green-500" />
                          ) : null
                        }
                      />
                    </FormControl>
                    <FormMessage />
                    {refCode && (
                      <FormDescription className="text-sm text-green-500">
                        {refCode.message}
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              {signUpError && (
                <FormMessage className="text-center text-red-500" role="alert">
                  Có lỗi xảy ra. Vui lòng thử lại.
                </FormMessage>
              )}

              <Button
                type="submit"
                className="mt-4 w-full"
                isLoading={form.formState.isSubmitting}
                disabled={getRefCodePending || !isRefCodeValid}
              >
                <div className="flex max-w-xs items-center justify-center overflow-hidden text-ellipsis">
                  Đăng ký
                </div>
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Đã có tài khoản?{" "}
              <Link
                className="text-primary hover:underline"
                href={appRoutes.login}
              >
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
      <AuthFooter />
    </Form>
  )
}

export default SignUpForm
