import { useEffect, useMemo, useRef, useState } from "react"
import useDownloadFile from "@/apis/files/use-download-file"
import { useGhepVip } from "@/apis/ghep/use-ghep-vip"
import userGhepVipPrice from "@/apis/prices/use-ghepvip-price"
import useUser from "@/apis/users/use-user"
import { useAuth } from "@/contexts/auth-context"
import DefaultFrameExample from "@assets/examples/default-frame.webp"
import GoldFrameExample from "@assets/examples/gold-frame.webp"
import OverallImage from "@assets/examples/overall.webp"
import TopHeroImage from "@assets/examples/tophero.webp"
import WinRateImage from "@assets/examples/winrate.webp"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PhotoProvider, PhotoView } from "react-photo-view"
import { useLocalStorage } from "react-use"
import { toast } from "sonner"
import { thumbHashToDataURL } from "thumbhash"
import { literal, z } from "zod"

import dayjsConfig from "@/config/dayjs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DownloadIcon } from "@/components/ui/download"
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
import { LayoutPanelTopIcon } from "@/components/ui/layout-panel-top"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import FileDropzone from "@/components/common/file-dropzone"
import { Icons } from "@/components/common/icons"
import { MultiSelect } from "@/components/common/multi-select"

interface Props {}

const romanNumerals = [
  {
    label: "Không ghép",
    value: "null",
  },
  {
    label: "EVO II",
    value: "evo2",
  },
  {
    label: "EVO III",
    value: "evo3",
  },
  {
    label: "EVO IV",
    value: "evo4",
  },
  {
    label: "EVO V",
    value: "evo5",
  },
  {
    label: "EVO V (Max)",
    value: "evo5max",
  },
]

const evoLabels = {
  wukong: "Wukong",
  valhein: "Valhein",
  nakroth: "Nakroth",
}

const tools = [
  {
    value: "vip9|effect",
    label: "VIP 9",
  },
  {
    value: "vip10|effect",
    label: "VIP 10",
  },
  {
    value: "10620|effect",
    label: "Hiệu ứng hạ Krixi Phù thủy thời không",
  },
  {
    value: "10620|button",
    label: "Nút bấm Krixi Phù thủy thời không",
  },
  {
    value: "10914|button",
    label: "Nút bấm Veera Phù thủy Hội họa",
  },
  {
    value: "10915|button",
    label: "Nút bấm Veera Thất Sát - Thượng Sinh",
  },
  {
    value: "11115|button",
    label: "Nút bấm Violet Thần long tỷ tỷ",
  },

  {
    value: "11120|full",
    label: "Nút bấm + hiệu ứng hạ Violet Nobara Kugisaki",
  },

  {
    value: "11616|effect",
    label: "Hiệu ứng hạ Butterfly Thánh nữ khởi nguyên",
  },
  {
    value: "11616|button",
    label: "Nút bấm Butterfly Thánh nữ khởi nguyên",
  },
  {
    value: "11812|effect",
    label: "Hiệu ứng hạ Alice Eternal Sailor Chibi Moon",
  },
  {
    value: "11812|button",
    label: "Nút bấm Alice Eternal Sailor Chibi Moon",
  },

  {
    value: "13011|button",
    label: "Nút bấm Airi Bích hải thánh nữ",
  },

  {
    value: "13015|effect",
    label: "Hiệu ứng hạ Airi Thứ nguyên Vệ thần",
  },
  {
    value: "13015|button",
    label: "Nút bấm Airi Thứ nguyên Vệ thần",
  },

  {
    value: "13116|effect",
    label: "Hiệu ứng hạ Murad Tuyệt thế thần binh",
  },
  {
    value: "13116|button",
    label: "Nút bấm Murad Tuyệt thế thần binh",
  },

  {
    value: "13118|full",
    label: "Nút bấm + hiệu ứng hạ Murad Thiên Luân Thánh Kiếm",
  },

  {
    value: "13210|effect",
    label: "Hiệu ứng hạ Hayate Tu Di Thánh Đế",
  },

  {
    value: "13706|full",
    label: "Nút bấm + hiệu ứng hạ Paine Megumi Fushiguro",
  },

  {
    value: "14111|button",
    label: "Nút bấm Lauriel Thứ nguyên vệ thần",
  },

  {
    value: "15012|effect",
    label: "Hiệu ứng hạ Nakroth Killua",
  },
  {
    value: "15012|button",
    label: "Nút bấm Nakroth Killua",
  },

  {
    value: "15013|effect",
    label: "Hiệu ứng hạ Nakroth Quỷ thương Liệp đế",
  },
  {
    value: "15013|button",
    label: "Nút bấm Nakroth Quỷ thương Liệp đế",
  },

  {
    value: "15014|effect",
    label: "Hiệu ứng hạ Nakroth Producer Tia chớp",
  },

  {
    value: "15015|effect",
    label: "Hiệu ứng hạ Nakroth Bạch Diện chiến thương",
  },
  {
    value: "15015|button",
    label: "Nút bấm Nakroth Bạch Diện chiến thương",
  },

  {
    value: "15212|effect",
    label: "Hiệu ứng hạ Điêu Thuyền Eternal Sailor Chibi Moon",
  },
  {
    value: "15212|button",
    label: "Nút bấm Điêu Thuyền Eternal Sailor Chibi Moon",
  },

  {
    value: "15412|effect",
    label: "Hiệu ứng hạ Yena Huyền cửu thiên",
  },
  {
    value: "15412|button",
    label: "Nút bấm Yena Huyền cửu thiên",
  },
  {
    value: "15413|button",
    label: "Nút hiệu ứng Yena Trấn Yêu Thần Lộc",
  },
  {
    value: "15711|effect",
    label: "Hiệu ứng hạ Raz Gon",
  },
  {
    value: "15711|button",
    label: "Nút bấm Raz Gon",
  },

  {
    value: "16710|effect",
    label: "Hiệu ứng hạ Ngộ Không Tân niên Võ Thần",
  },

  {
    value: "19015|effect",
    label: "Hiệu ứng hạ Tulen Satoru Gojo",
  },
  {
    value: "19015|button",
    label: "Nút bấm Tulen Satoru Gojo",
  },

  {
    value: "19508|effect",
    label: "Hiệu ứng hạ Enzo Kurapika",
  },
  {
    value: "19508|button",
    label: "Nút bấm Enzo Kurapika",
  },

  {
    value: "19906|effect",
    label: "Hiệu ứng hạ Elando'rr Elando'rr-Tuxedo",
  },
  {
    value: "19906|button",
    label: "Nút bấm Elando'rr Elando'rr-Tuxedo",
  },

  {
    value: "50119|full",
    label: "Nút bấm + hiệu ứng hạ Tel'Annas Lân Quang Thánh Điệu",
  },

  {
    value: "51015|effect",
    label: "Hiệu ứng hạ Liliana Ma Pháp Tối Thượng",
  },
  {
    value: "51015|button",
    label: "Nút bấm Liliana Ma Pháp Tối Thượng",
  },

  {
    value: "52011|effect",
    label: "Hiệu ứng hạ Veres Lưu ly Long mẫu",
  },
  {
    value: "52011|button",
    label: "Nút bấm Veres Lưu ly Long mẫu",
  },

  {
    value: "52414|full",
    label: "Nút bấm + hiệu ứng hạ Capheny Càn Nguyên Điện Chủ",
  },

  {
    value: "54307|effect",
    label: "Hiệu ứng hạ Aya Công chúa cầu vòng",
  },
  {
    value: "54307|button",
    label: "Nút bấm Aya Công chúa cầu vòng",
  },

  {
    value: "59702|effect",
    label: "Hiệu ứng hạ Biron Yuji Itadori",
  },
  {
    value: "59702|button",
    label: "Nút bấm Biron Yuji Itadori",
  },
  {
    value: "59802|button",
    label: "Nút hiệu ứng Bolt Baron Thiên Phủ - Tư Mệnh",
  },
  {
    value: "59901|button",
    label: "Nút hiệu ứng Billow Thiên Tướng - Độ Ách",
  },
]

const numberFormatter = Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
})

const mergeSkinSchema = z.object({
  username: z
    .string({
      required_error: "Tên người dùng không được để trống",
    })
    .min(1, "Vui lòng nhập tên người dùng"),
  password: z
    .string({
      required_error: "Mật khẩu không được để trống",
    })
    .min(1, "Vui lòng nhập mật khẩu"),
  overallImageUrl: z
    .string({
      required_error: "Vui lòng tải lên ảnh tổng quan tài khoản",
    })
    .url("Vui lòng tải lên ảnh tổng quan tài khoản"),
  changeNameCardCount: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .or(literal("")),
  accountCode: z.string().optional(),
  evoSkin: z
    .object({
      wukong: z.string().optional(),
      valhein: z.string().optional(),
      nakroth: z.string().optional(),
    })
    .optional(),
  topHeroImageUrls: z.array(z.string().url()).optional(),
  winRateImageUrls: z.array(z.string().url()).optional(),
  imageCount: z.coerce.number().int().positive().min(10),
})

const IMAGE_BRIGHTNESS_KEY = "image_brightness"
const IMAGE_FRAME_TYPE_KEY = "image_frame_type"

const MergeSkinForm = (props: Props) => {
  const [openExampleDialog, setOpenExampleDialog] = useState(false)
  const [openConfirmDiffersDialog, setOpenConfirmDiffersDialog] =
    useState(false)

  const [exampleData, setExampleData] = useState<{
    type: "overall" | "tophero" | "winrate"
    title: string
    url: string
  }>()

  const clearOverallImageRef = useRef<() => void>()
  const clearTopHeroImageRef = useRef<() => void>()
  const clearWinRateImageRef = useRef<() => void>()

  const downloadIconRef = useRef<any>()
  const layoutPanelTopIconRef = useRef<any>()

  const [excludeLowWinRate, setExcludeLowWinRate] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const [brightness = 0, setBrightness] = useLocalStorage<number>(
    IMAGE_BRIGHTNESS_KEY,
    0
  )
  const [frameType, setFrameType] = useLocalStorage<string>(
    IMAGE_FRAME_TYPE_KEY,
    "default"
  )

  const { mutate: downloadFile, isPending: isDownloadFilePending } =
    useDownloadFile({
      onError: (error) => {
        toast.error(error.message)
      },
    })

  const [files, setFiles] = useState<{
    uploaded: string[]
    failed: File[]
    inProgress: File[]
  }>({ uploaded: [], failed: [], inProgress: [] })
  const form = useForm<z.infer<typeof mergeSkinSchema>>({
    resolver: zodResolver(mergeSkinSchema),
    mode: "onBlur",
    defaultValues: {
      imageCount: "" as any,
      username: "",
      password: "",
      overallImageUrl: "",
      changeNameCardCount: "" as any,
      accountCode: "",
      evoSkin: {
        wukong: "" as any,
        valhein: "" as any,
        nakroth: "" as any,
      },
      topHeroImageUrls: [],
      winRateImageUrls: [],
    },
  })

  const {
    formState: { errors },
  } = form

  const { firebaseUser } = useAuth()
  const { data: user } = useUser({
    id: firebaseUser?.email || "",
    enabled: !!firebaseUser?.email,
  })
  const { data: price } = userGhepVipPrice()

  const {
    mutate: ghepVip,
    data: result,
    isPending: isGhepVipPending,
    reset: resetGhepVip,
  } = useGhepVip({
    onSuccess: () => {
      toast.success("Ghép ảnh thành công")
      resetForm()
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 8000,
      })
    },
  })

  const submitForm = (data: z.infer<typeof mergeSkinSchema>) => {
    if (isGhepVipPending) return
    setIsImageLoaded(false)
    const vfx = selectedTools.reduce((acc, tool) => {
      const [id, type] = tool.split("|")
      if (type === "full") {
        return {
          ...acc,
          [id]: {
            effect: true,
            button: true,
          },
        }
      }
      return {
        ...acc,
        [id]: {
          ...((acc as any)[id] || {}),
          [type]: true,
        },
      }
    }, {})
    ghepVip({
      ...data,
      excludeLowWinRate,
      brightness,
      frameType,
      vfx,
    })
  }

  const resetForm = () => {
    form.reset()
    setFiles({ uploaded: [], failed: [], inProgress: [] })
    setSelectedTools([])
    clearOverallImageRef.current?.()
    clearTopHeroImageRef.current?.()
    clearWinRateImageRef.current?.()
  }

  const showExampleDialog = (type: "overall" | "tophero" | "winrate") => {
    setExampleData({
      type,
      title:
        type === "overall"
          ? "Ảnh tổng quan tài khoản"
          : type === "tophero"
            ? "Ảnh TOP tướng"
            : "Ảnh tỉ lệ thắng",
      url:
        type === "overall"
          ? OverallImage.src
          : type === "tophero"
            ? TopHeroImage.src
            : WinRateImage.src,
    })
    setOpenExampleDialog(true)
  }

  const showFrameExampleDialog = (type: "default" | "gold") => {
    setExampleData({
      type: "overall",
      title: type === "default" ? "Khung mặc định" : "Khung vàng",
      url: type === "default" ? DefaultFrameExample.src : GoldFrameExample.src,
    })
    setOpenExampleDialog(true)
  }

  const imageCount = !isNaN(form.getValues("imageCount"))
    ? Number(form.getValues("imageCount"))
    : undefined

  const imagePrice = useMemo(() => {
    if (!imageCount || price === undefined) return undefined
    return price * imageCount
  }, [imageCount])

  const thumbhashDataUrl = useMemo(() => {
    if (!result?.thumbHash) return
    const thumbHashBuffer = Buffer.from(result.thumbHash, "base64")
    const dataUrl = thumbHashToDataURL(thumbHashBuffer)
    return dataUrl
  }, [result?.thumbHash])

  useEffect(() => {
    if (brightness > 0.3) {
      setBrightness(0.3)
    } else if (brightness < -0.1) {
      setBrightness(-0.1)
    }
  }, [brightness])

  const totalPrice = imagePrice

  const countGhep = user?.countGhep || 0

  useEffect(() => {
    if (!user) return
    if (countGhep >= 3) return
    const lastConfirmDialog = localStorage.getItem("lastConfirmDialog")
    if (lastConfirmDialog) {
      const lastConfirmDate = new Date(lastConfirmDialog)
      const now = new Date()
      const diffInHours = dayjsConfig(now).diff(
        dayjsConfig(lastConfirmDate),
        "minutes"
      )
      if (diffInHours <= 60) return
    }
    const timer = setTimeout(() => {
      setOpenConfirmDiffersDialog(true)
      localStorage.setItem("lastConfirmDialog", new Date().toISOString())
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [countGhep, user])

  return (
    <>
      <div className="mt-[2%]">
        <h2 className="mb-4 text-center font-bold">Ghép Ảnh</h2>
        <Form {...form}>
          <form className="bento-bg mx-auto grid max-w-6xl grid-cols-5 gap-6 p-4 lg:p-6">
            <div className="col-span-5 grid gap-2 lg:col-span-3">
              <FormLabel className="font-bold">Số lượng ảnh ghép</FormLabel>
              <FormField
                name="imageCount"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Số lượng ảnh ghép"
                          disabled={isGhepVipPending}
                        />
                      </FormControl>
                      {!errors.imageCount && (
                        <FormDescription>
                          Giá tiền sẽ được tính dựa trên số lượng ảnh ghép
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormLabel className="mt-2 font-bold">
                Thông tin tài khoản
              </FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tên tài khoản"
                            disabled={isGhepVipPending}
                          />
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
                      <FormControl>
                        <PasswordInput
                          {...field}
                          placeholder="Mật khẩu"
                          defaultShowPassword
                          disabled={isGhepVipPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                name="overallImageUrl"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="mt-2 font-bold">
                        Ảnh tổng quan tài khoản
                        <span
                          className="ml-1 text-muted-foreground hover:underline"
                          onClick={() => showExampleDialog("overall")}
                        >
                          (Xem ảnh mẫu)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <FileDropzone
                          options={{
                            maxFiles: 1,
                            accept: { "image/*": [".jpg", ".jpeg", ".png"] },
                          }}
                          onUpload={(files) => {
                            setFiles((prev) => ({
                              ...prev,
                              inProgress: [...prev.inProgress, ...files],
                            }))
                          }}
                          onUploadSuccess={(file, url) => {
                            field.onChange(url)
                            setFiles((prev) => ({
                              ...prev,
                              uploaded: [...prev.uploaded, url],
                              inProgress: prev.inProgress.filter(
                                (f) => f !== file
                              ),
                            }))
                          }}
                          onRemove={(file, url) => {
                            field.onChange("")
                            setFiles((prev) => ({
                              ...prev,
                              uploaded: prev.uploaded.filter((f) => f !== url),
                              inProgress: prev.inProgress.filter(
                                (f) => f !== file
                              ),
                              failed: prev.failed.filter((f) => f !== file),
                            }))
                          }}
                          onError={(file) => {
                            setFiles((prev) => ({
                              ...prev,
                              inProgress: prev.inProgress.filter(
                                (f) => f !== file
                              ),
                              failed: [...prev.failed, file],
                            }))
                          }}
                          clearAllFunctionRef={clearOverallImageRef}
                          disabled={isGhepVipPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <div className="mt-1 grid grid-cols-2 gap-4">
                {/* <FormField
                name="heroCount"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Số tướng"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                name="skinCount"
                control={form.control}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Số trang phục"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              /> */}
                <FormField
                  name="changeNameCardCount"
                  control={form.control}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Số thẻ đổi tên (nếu có)"
                            type="number"
                            disabled={isGhepVipPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
                <FormField
                  name="accountCode"
                  control={form.control}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Mã số tài khoản (nếu có)"
                            disabled={isGhepVipPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
              <FormLabel className="mt-2 font-bold">
                Trang phục tiến hoá (Chọn nếu có)
              </FormLabel>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(evoLabels).map(([key, label]) => (
                  <FormField
                    name={`evoSkin.${key}` as any}
                    control={form.control}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={field.onChange}
                              disabled={isGhepVipPending}
                            >
                              <SelectTrigger>
                                <SelectValue>
                                  {field.value
                                    ? romanNumerals.find(
                                        (item) => item.value === field.value
                                      )?.label
                                    : "Chọn"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {romanNumerals.map(({ value, label }) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormLabel className="mt-2 font-bold">
                Phụ kiện (nút bấm, hiệu ứng hạ)
                <Badge className="ml-1 text-xs">🛠️ Beta</Badge>
              </FormLabel>
              <MultiSelect
                options={tools}
                placeholder="Chọn phụ kiện (nút bấm, hiệu ứng hạ)"
                defaultValue={selectedTools}
                onValueChange={(value) => setSelectedTools(value)}
                disabled={isGhepVipPending}
                maxCount={10}
              />
              <FormLabel className="mt-2 font-bold">
                Ảnh TOP tướng (Nếu có)
                <span
                  className="ml-1 text-muted-foreground hover:underline"
                  onClick={() => showExampleDialog("tophero")}
                >
                  (Xem ảnh mẫu)
                </span>
              </FormLabel>
              <FileDropzone
                options={{
                  accept: { "image/*": [".jpg", ".jpeg", ".png"] },
                }}
                onUpload={(files) => {
                  setFiles((prev) => ({
                    ...prev,
                    inProgress: [...prev.inProgress, ...files],
                  }))
                }}
                onUploadSuccess={(file, url) => {
                  form.setValue("topHeroImageUrls", [
                    ...(form.getValues("topHeroImageUrls") || []),
                    url,
                  ])
                  setFiles((prev) => ({
                    ...prev,
                    uploaded: [...prev.uploaded, url],
                    inProgress: prev.inProgress.filter((f) => f !== file),
                  }))
                }}
                onRemove={(file, url) => {
                  form.setValue("topHeroImageUrls", [
                    ...(form.getValues("topHeroImageUrls") || []).filter(
                      (value) => value !== url
                    ),
                  ])
                  setFiles((prev) => ({
                    ...prev,
                    uploaded: prev.uploaded.filter((f) => f !== url),
                    inProgress: prev.inProgress.filter((f) => f !== file),
                    failed: prev.failed.filter((f) => f !== file),
                  }))
                }}
                onError={(file) => {
                  setFiles((prev) => ({
                    ...prev,
                    inProgress: prev.inProgress.filter((f) => f !== file),
                    failed: [...prev.failed, file],
                  }))
                }}
                clearAllFunctionRef={clearTopHeroImageRef}
                disabled={isGhepVipPending}
              />
              <FormLabel className="mt-2 font-bold">
                Ảnh tỉ lệ thắng (Nếu có)
                <span
                  className="ml-1 text-muted-foreground hover:underline"
                  onClick={() => showExampleDialog("winrate")}
                >
                  (Xem ảnh mẫu)
                </span>
              </FormLabel>
              <FileDropzone
                options={{
                  accept: { "image/*": [".jpg", ".jpeg", ".png"] },
                }}
                onUpload={(files) => {
                  setFiles((prev) => ({
                    ...prev,
                    inProgress: [...prev.inProgress, ...files],
                  }))
                }}
                onUploadSuccess={(file, url) => {
                  form.setValue("winRateImageUrls", [
                    ...(form.getValues("winRateImageUrls") || []),
                    url,
                  ])
                  setFiles((prev) => ({
                    ...prev,
                    uploaded: [...prev.uploaded, url],
                    inProgress: prev.inProgress.filter((f) => f !== file),
                  }))
                }}
                onRemove={(file, url) => {
                  form.setValue("winRateImageUrls", [
                    ...(form.getValues("winRateImageUrls") || []).filter(
                      (value) => value !== url
                    ),
                  ])
                  setFiles((prev) => ({
                    ...prev,
                    uploaded: prev.uploaded.filter((f) => f !== url),
                    inProgress: prev.inProgress.filter((f) => f !== file),
                    failed: prev.failed.filter((f) => f !== file),
                  }))
                }}
                onError={(file) => {
                  setFiles((prev) => ({
                    ...prev,
                    inProgress: prev.inProgress.filter((f) => f !== file),
                    failed: [...prev.failed, file],
                  }))
                }}
                clearAllFunctionRef={clearWinRateImageRef}
                disabled={isGhepVipPending}
              />
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  id="excludeLowWinRate"
                  checked={excludeLowWinRate}
                  onCheckedChange={(e) => setExcludeLowWinRate(e as boolean)}
                  disabled={isGhepVipPending}
                />
                <label
                  htmlFor="excludeLowWinRate"
                  className="cursor-pointer disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  Chỉ lấy tướng có tỉ lệ thắng trên 52%
                </label>
              </div>
              <FormLabel className="mb-0.5 mt-1.5 font-bold">
                Chọn loại khung <Badge className="text-xs">🤩 Mới</Badge>
              </FormLabel>
              <div className="flex flex-col gap-2 xl:flex-row">
                <div className="flex-1">
                  <Button
                    size="lg"
                    type="button"
                    variant="outline"
                    onClick={() => setFrameType("default")}
                    disabled={isGhepVipPending}
                    className={cn(
                      "w-full rounded-none transition-all",
                      frameType === "default" &&
                        "bg-neutral-50 outline outline-[0.4px]"
                    )}
                    style={{
                      borderWidth: frameType === "default" ? "4px" : "1px",
                      borderImage:
                        frameType === "default"
                          ? "linear-gradient(145deg, rgba(202,105,221,1) 0%, rgba(28,198,245,1) 100%) 1"
                          : "none",
                      borderStyle: "solid",
                      boxSizing: "border-box",
                    }}
                  >
                    {frameType === "default" ? (
                      <Icons.check className="mr-1 h-4 w-4 text-success" />
                    ) : null}
                    Mặc định
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    className="h-fit p-0 pt-1 text-muted-foreground"
                    onClick={() => showFrameExampleDialog("default")}
                  >
                    <Icons.info className="mr-1 size-4" />
                    <p>
                      Click xem ảnh mẫu{"  "}
                      <span className="text-primary">khung mặc định</span>
                    </p>
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    size="lg"
                    type="button"
                    variant="outline"
                    onClick={() => setFrameType("gold")}
                    disabled={isGhepVipPending}
                    className={cn(
                      "w-full rounded-none transition-all",
                      frameType === "gold" &&
                        "bg-neutral-50 outline outline-[0.4px]"
                    )}
                    style={{
                      borderWidth: frameType === "gold" ? "4px" : "1px",
                      borderImage:
                        frameType === "gold"
                          ? "linear-gradient(to top, rgba(255,221,84,1) 0%, rgba(255,255,255,1) 100%) 1"
                          : "none",
                      borderStyle: "solid",
                      boxSizing: "border-box",
                    }}
                  >
                    {frameType === "gold" ? (
                      <Icons.check className="mr-1 size-4 text-success" />
                    ) : null}
                    <p>Vàng ✨</p>
                    {frameType === "gold" && (
                      <p className="ml-0.5 text-xs font-bold">
                        (nên up nhiều TLT)
                      </p>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    className="h-fit p-0 pt-1 text-muted-foreground"
                    onClick={() => showFrameExampleDialog("gold")}
                  >
                    <Icons.info className="mr-1 size-4" />
                    <p>
                      Click xem ảnh mẫu{"  "}
                      <span className="text-primary">khung vàng</span>
                    </p>
                  </Button>
                </div>
              </div>
              <FormLabel className="mb-0.5 mt-1.5 font-bold">
                Độ sáng ảnh:
                <span
                  className={cn(
                    brightness === 0 && "text-muted-foreground",
                    brightness > 0 && "text-success",
                    brightness < 0 && "text-destructive"
                  )}
                >
                  {" "}
                  {brightness === 0
                    ? "Mặc định"
                    : (brightness > 0 ? "Tăng " : "Giảm ") +
                      Math.abs(brightness * 100).toFixed(0) +
                      "%"}
                </span>
              </FormLabel>

              <Slider
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                min={-0.1}
                max={0.3}
                step={0.01}
                disabled={isGhepVipPending}
              />
              <p className="text-sm text-muted-foreground">Mẫu tham khảo</p>
              {
                <img
                  src={
                    frameType === "gold"
                      ? GoldFrameExample.src
                      : DefaultFrameExample.src
                  }
                  alt="Frame"
                  className={cn(
                    "mx-auto w-3/4 rounded border border-dashed border-neutral-200 lg:mx-0"
                  )}
                  style={{
                    filter: `brightness(${1.02 + brightness})`,
                  }}
                />
              }
            </div>
            <div className="col-span-5  lg:col-span-2">
              <div className="flex flex-col space-y-2">
                <FormLabel className="font-bold">Thành tiền</FormLabel>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <p>
                    {imageCount || "--"} ảnh <span className="text-xs">✖</span>{" "}
                    {numberFormatter.format(price || 0)}
                  </p>
                  {imagePrice !== undefined ? (
                    <p>{numberFormatter.format(imagePrice)}</p>
                  ) : (
                    "--"
                  )}
                </div>
                <div className="border-t border-neutral-75" />
                <div className="flex justify-between text-lg text-foreground">
                  <p className="font-semibold">Tổng cộng</p>
                  <strong>
                    {totalPrice !== undefined
                      ? numberFormatter.format(totalPrice)
                      : "--"}
                  </strong>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  isLoading={isGhepVipPending}
                  disabled={
                    files.failed.length > 0 ||
                    files.inProgress.length > 0 ||
                    !form.formState.isDirty
                  }
                  onMouseEnter={() => {
                    layoutPanelTopIconRef.current?.startAnimation()
                  }}
                  onMouseLeave={() => {
                    layoutPanelTopIconRef.current?.stopAnimation()
                  }}
                  onClick={(e) => {
                    form.handleSubmit(submitForm)(e)
                  }}
                >
                  <LayoutPanelTopIcon
                    ref={layoutPanelTopIconRef}
                    size={20}
                    className="pointer-events-none"
                  />
                  Ghép Ảnh Tự Động
                </Button>
                {files.failed.length > 0 && (
                  <p className="text-xs text-destructive">
                    Vui lòng xoá hoặc tải lại ảnh bị lỗi
                  </p>
                )}
                {files.inProgress.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Đang tải {files.inProgress.length} ảnh lên...
                  </p>
                )}
              </div>
              <div
                className={cn(
                  "relative mt-4 flex min-h-60 w-full items-center justify-center overflow-hidden rounded border-[1.5px] border-dashed border-neutral-100 text-sm text-muted-foreground",
                  isGhepVipPending && "cursor-wait p-0.5"
                )}
              >
                {isGhepVipPending && (
                  <span className="-z-1 absolute size-[120%] animate-[spin_5s_linear_infinite_reverse] bg-[conic-gradient(from_90deg_at_50%_50%,#707980_50%,#fff_5%)] group-hover:bg-none" />
                )}
                {result ? (
                  <>
                    <PhotoProvider maskOpacity={0.75} bannerVisible={false}>
                      <PhotoView src={result.resultUrl}>
                        <img
                          src={result.resultUrl}
                          alt="Result"
                          className={cn(
                            "z-0 w-full animate-in fade-in-50",
                            !isImageLoaded && thumbhashDataUrl && "hidden"
                          )}
                          onLoad={() => setIsImageLoaded(true)}
                        />
                      </PhotoView>
                    </PhotoProvider>
                    {!isImageLoaded && thumbhashDataUrl && (
                      <img
                        src={thumbhashDataUrl}
                        alt="Result"
                        className={cn("z-0 w-full animate-in fade-in-0")}
                      />
                    )}
                  </>
                ) : (
                  <p className="z-0 flex aspect-video size-full min-h-[236px] items-center justify-center rounded-sm bg-neutral-25 px-4 text-center">
                    {isGhepVipPending
                      ? "Đang ghép ảnh... Thường < 1 phút - 2 phút, đừng tắt/chuyển tab giúp mình nha!"
                      : "Ảnh ghép sẽ hiển thị ở đây sau khi hoàn thành."}
                  </p>
                )}
              </div>
              <Badge className="my-2 w-fit rounded py-1">
                📌 Ghép không ưng, lỗi inb zalo 0835066924 để được hỗ trợ ghép
                lại/hoàn tiền
              </Badge>
              {result && (
                <div className="mt-2 flex flex-col items-center justify-center gap-2 pb-14 lg:pb-0">
                  <p className="text-muted-foreground">
                    *Bấm vào ảnh để xem full màn hình
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      isLoading={isDownloadFilePending}
                      onMouseEnter={() => {
                        downloadIconRef.current?.startAnimation()
                      }}
                      onMouseLeave={() => {
                        downloadIconRef.current?.stopAnimation()
                      }}
                      onClick={() =>
                        downloadFile({
                          url: result.resultUrl,
                          fileName: `${result.username}.jpg`,
                        })
                      }
                    >
                      <DownloadIcon
                        size={16}
                        ref={downloadIconRef as any}
                        className="pointer-events-none"
                      />
                      Tải ảnh về
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetGhepVip()
                      }}
                    >
                      Ghép ảnh mới
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
      <Dialog open={openExampleDialog} onOpenChange={setOpenExampleDialog}>
        <DialogContent className="max-w-4xl bg-neutral-25">
          <DialogHeader className="w-full">
            <DialogTitle>Ảnh mẫu - {exampleData?.title}</DialogTitle>
            <DialogDescription>
              Vui lòng chụp full màn hình game để có kết quả tốt nhất
            </DialogDescription>
          </DialogHeader>
          <PhotoProvider maskOpacity={0.75} bannerVisible={false}>
            <PhotoView src={exampleData?.url}>
              <img
                src={exampleData?.url}
                alt="Overall"
                className="w-full rounded border border-dashed border-neutral-100"
              />
            </PhotoView>
          </PhotoProvider>
          <p className="text-xs text-muted-foreground">
            *Bấm vào ảnh để xem full màn hình
          </p>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openConfirmDiffersDialog}
        onOpenChange={setOpenConfirmDiffersDialog}
      >
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>
              Kiểm tra xem mình đã upload đúng ảnh chưa nha
            </DialogTitle>
            <DialogDescription>
              Ảnh TOP tướng và ảnh Tỉ lệ thắng là khác nhau, bạn nhớ kiểm tra kĩ
              để upload đúng ảnh, tránh lỗi nhen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="text-center">
              <h4>Mẫu ảnh top tướng</h4>
              <img
                src={TopHeroImage.src}
                alt="TopHero"
                className="w-full rounded border border-dashed border-neutral-100"
              />
            </div>
            <div className="text-center">
              <h4>Mẫu ảnh tỉ lệ thắng</h4>
              <img
                src={WinRateImage.src}
                alt="WinRate"
                className="w-full rounded border border-dashed border-neutral-100"
              />
            </div>
          </div>
          <DialogFooter className="">
            <Button
              className="mx-auto"
              onClick={() => setOpenConfirmDiffersDialog(false)}
            >
              Đã hiểu, tiếp tục ghép ảnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MergeSkinForm
