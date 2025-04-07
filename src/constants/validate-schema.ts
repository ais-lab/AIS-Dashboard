import { z } from "zod"

import { MAX_NAME_LENGTH } from "@/lib/firebase/const"

export const userInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter your name")
    .max(MAX_NAME_LENGTH, "Name too long"),
  legalName: z.string().optional(),
  email: z.string().email(),
  nickName: z.string().optional(),
  phone: z.string().min(1, "Please enter a valid phone number"),
  mobilePhone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  jobTitle: z.string(),
  address: z.string().min(1, "Please enter a valid home city"),
  /* current home city */ birthCity: z.string().optional(),
  otherCities: z
    .array(z.string().optional().default(""))
    .optional()
    .default(["", "", ""]),
  languages: z
    .array(z.string().optional().default(""))
    .optional()
    .default(["", "", ""]),
  noOfChildren: z.number().positive().max(100).optional().or(z.literal(0)),
  personalEmail: z.string().email().optional().or(z.literal("")),
  personalGmail: z.string().email().optional().or(z.literal("")),
  personalHotmail: z.string().email().optional().or(z.literal("")),
  personalAppleId: z.string().email().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  youtube: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  tiktok: z.string().optional().or(z.literal("")),
  hobbies: z
    .array(z.string().optional().default(""))
    .optional()
    .default(["", "", ""]),
  favoriteGames: z
    .array(z.string().optional().default(""))
    .optional()
    .default(["", "", ""]),
})

export const companyInfoSchema = z.object({
  name: z
    .string({
      required_error: "Please enter a valid company name",
    })
    .min(1, "Please enter a valid company name"),
  shortName: z.string().optional(),
  establishedYear: z
    .number({
      required_error: "Please enter a valid year",
      invalid_type_error: "Please enter a valid year",
    })
    .min(1900)
    .max(new Date().getFullYear()),
  incorporationLocation: z.string().min(1, "Please enter a valid location"),
  businessLocation: z.string().optional(),
  address: z.string().min(1, "Please enter a valid address"),
  website: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/.test(
          value
        ),
      {
        message: "Please provide a valid URL",
      }
    ),
  youtube: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  github: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  sector: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  subIndustry: z.string().optional().or(z.literal("")),
  description: z
    .string({
      required_error: "Please enter a valid description",
    })
    .min(5, "Please enter a valid description")
    .max(1000, "Should not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  userProblem: z.string().max(2000).optional().or(z.literal("")),
  targetUser: z.string().max(2000).optional().or(z.literal("")),
  customerBased: z.string().max(2000).optional().or(z.literal("")),
})

export const valuationSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(1, "Please enter your name"),
  company: z.object({
    sector: z.string().min(1, "Please enter a valid sector"),
    industry: z.string().min(1, "Please enter a valid industry"),
    subIndustry: z.string().optional(),
  }),
  targetCustomer: z.string().min(1, "Please enter a valid target customer"),
  customerBased: z.string().min(1, "Please enter a valid sales locations"),
  noOfEmployees: z.number().positive().min(1, "Please enter a valid number"),
  annualRevenue: z.number().positive().min(0, "Please enter a valid number"),
})
